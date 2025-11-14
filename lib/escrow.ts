import { stripe } from './stripe'
import prisma from './prisma'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

/**
 * Создание escrow платежа для заказа
 * Деньги удерживаются до подтверждения выполнения сделки
 */
export async function createEscrowPayment(orderId: string, amount: number, currency: string = 'usd') {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Проверяем существование заказа
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      escrowStatus: true,
      stripePaymentId: true,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.stripePaymentId) {
    throw new Error('Payment already created for this order')
  }

  // Создаем Payment Intent с ручным захватом (manual capture)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Конвертируем в центы
    currency: currency.toLowerCase(),
    capture_method: 'manual', // Не списываем сразу, ждем подтверждения
    metadata: {
      orderId,
      type: 'escrow',
    },
    description: `Escrow payment for order ${orderId}`,
  })

  // Обновляем заказ
  await prisma.order.update({
    where: { id: orderId },
    data: {
      stripePaymentId: paymentIntent.id,
      escrowStatus: 'HELD',
      paymentId: paymentIntent.id,
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Освобождение escrow платежа после проверки AI
 * AI анализирует статус заказа, трекинг и сообщения
 */
export async function releaseEscrow(orderId: string, force: boolean = false) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Получаем заказ со всеми необходимыми данными
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      messages: {
        take: 10, // Последние 10 сообщений
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          content: true,
          senderId: true,
          createdAt: true,
        },
      },
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (!order.stripePaymentId) {
    throw new Error('No payment intent found for this order')
  }

  if (order.escrowStatus === 'RELEASED') {
    throw new Error('Escrow already released')
  }

  // Если принудительное освобождение (например, от админа)
  if (force) {
    await capturePaymentAndUpdate(order, orderId)
    return { released: true, reason: 'forced' }
  }

  // AI проверка условий сделки
  const aiDecision = await checkEscrowReleaseConditions(order)

  if (aiDecision.canRelease) {
    await capturePaymentAndUpdate(order, orderId, aiDecision.reason)
    return {
      released: true,
      reason: aiDecision.reason,
      confidence: aiDecision.confidence,
    }
  } else {
    // Сохраняем решение AI в заказ
    await prisma.order.update({
      where: { id: orderId },
      data: {
        aiDecision: {
          canRelease: false,
          reason: aiDecision.reason,
          checkedAt: new Date().toISOString(),
        },
      },
    })

    return {
      released: false,
      reason: aiDecision.reason,
      confidence: aiDecision.confidence,
    }
  }
}

/**
 * Проверка условий для освобождения escrow через AI
 */
async function checkEscrowReleaseConditions(order: any) {
  try {
    // Формируем контекст для AI
    const firstItem = order.items?.[0]
    const orderType = firstItem?.productId ? 'product' : 'service'
    const itemTitle = firstItem?.product?.title || firstItem?.service?.title || 'Unknown'

    const context = `
      Проверь, выполнены ли условия сделки для заказа #${order.id}:

      Тип: ${orderType}
      Товар/Услуга: ${itemTitle}
      Статус заказа: ${order.status}
      Трекинг номер: ${order.trackingNumber || 'не указан'}
      Дата создания: ${order.createdAt}
      
      Последние сообщения между покупателем и продавцом:
      ${order.messages.length > 0
        ? order.messages
            .map(
              (msg: any) =>
                `[${new Date(msg.createdAt).toLocaleDateString()}] ${msg.senderId === order.buyerId ? 'Покупатель' : 'Продавец'}: ${msg.content.substring(0, 100)}`
            )
            .join('\n')
        : 'Нет сообщений'
      }

      Проверь следующие критерии:
      1. Статус заказа должен быть DELIVERED или SHIPPED (для товаров) или PAID (для услуг)
      2. Для товаров должен быть указан трекинг номер
      3. Нет активных споров (disputeStatus не должен быть "open")
      4. Прошло достаточно времени с момента создания заказа (минимум 1 день для товаров)

      Ответь в формате JSON:
      {
        "canRelease": true/false,
        "reason": "краткое объяснение",
        "confidence": 0.0-1.0
      }
    `

    // Проверяем наличие OpenAI API ключа
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback heuristics')
      return getFallbackDecision(order)
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: context,
      temperature: 0.3, // Низкая температура для более детерминированных ответов
    })

    // Парсим JSON ответ
    let decision
    try {
      // Извлекаем JSON из ответа (может быть обернут в markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        decision = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: если AI не вернул JSON, анализируем текст
        const lowerText = text.toLowerCase()
        decision = {
          canRelease: lowerText.includes('release') && !lowerText.includes('hold'),
          reason: text.substring(0, 200),
          confidence: 0.5,
        }
      }
    } catch (parseError) {
      // Если не удалось распарсить, используем эвристику
      const lowerText = text.toLowerCase()
      decision = {
        canRelease:
          (order.status === 'DELIVERED' || order.status === 'SHIPPED') &&
          order.disputeStatus !== 'open' &&
          order.trackingNumber !== null,
        reason: `AI analysis failed, using heuristics. AI response: ${text.substring(0, 100)}`,
        confidence: 0.4,
      }
    }

    return {
      canRelease: decision.canRelease === true,
      reason: decision.reason || 'AI analysis completed',
      confidence: decision.confidence || 0.5,
    }
  } catch (error: any) {
    console.error('AI escrow check error:', error)
    // Fallback на эвристику при ошибке AI
    return getFallbackDecision(order, error.message)
  }
}

/**
 * Fallback решение на основе эвристики
 */
function getFallbackDecision(order: any, errorMessage?: string) {
  const canRelease =
    (order.status === 'DELIVERED' || order.status === 'SHIPPED') &&
    order.disputeStatus !== 'open' &&
    order.trackingNumber !== null

  return {
    canRelease,
    reason: errorMessage
      ? `AI check failed: ${errorMessage}. Using fallback heuristics.`
      : 'Using fallback heuristics (AI not available)',
    confidence: 0.3,
  }
}

/**
 * Захват платежа и обновление заказа
 */
async function capturePaymentAndUpdate(order: any, orderId: string, reason?: string) {
  if (!order.stripePaymentId) {
    throw new Error('No payment intent ID')
  }

  // Захватываем платеж в Stripe
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  await stripe.paymentIntents.capture(order.stripePaymentId)

  // Обновляем статус escrow
  await prisma.order.update({
    where: { id: orderId },
    data: {
      escrowStatus: 'RELEASED',
      aiDecision: {
        canRelease: true,
        reason: reason || 'Escrow released',
        releasedAt: new Date().toISOString(),
      },
    },
  })

  // Начисляем репутацию продавцу
  await prisma.user.update({
    where: { id: order.sellerId },
    data: {
      reputationScore: { increment: 1 },
      tradesCompleted: { increment: 1 },
    },
  })

  // Создаем уведомление для продавца
  await prisma.notification.create({
    data: {
      userId: order.sellerId,
      type: 'order',
      title: 'Escrow Released',
      message: `Payment for order #${orderId} has been released. Your reputation has been updated.`,
      link: `/orders/${orderId}`,
      orderId,
    },
  })
}

/**
 * Отмена escrow платежа (возврат покупателю)
 */
export async function cancelEscrow(orderId: string, reason: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      stripePaymentId: true,
      escrowStatus: true,
      buyerId: true,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (!order.stripePaymentId) {
    throw new Error('No payment intent found')
  }

  if (order.escrowStatus === 'RELEASED') {
    throw new Error('Cannot cancel already released escrow')
  }

  // Отменяем Payment Intent (возвращаем деньги)
  await stripe.paymentIntents.cancel(order.stripePaymentId)

  // Обновляем статус
  await prisma.order.update({
    where: { id: orderId },
    data: {
      escrowStatus: 'REFUNDED',
      status: 'REFUNDED',
      aiDecision: {
        cancelled: true,
        reason,
        cancelledAt: new Date().toISOString(),
      },
    },
  })

  // Создаем уведомление для покупателя
  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: 'order',
      title: 'Order Cancelled',
      message: `Order #${orderId} has been cancelled. Your payment will be refunded.`,
      link: `/orders/${orderId}`,
      orderId,
    },
  })

  return { cancelled: true }
}

