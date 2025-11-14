import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { createEscrowPayment, releaseEscrow, cancelEscrow } from '../../../../../lib/escrow'
import prisma from '../../../../../lib/prisma'

/**
 * POST /api/orders/[orderId]/escrow
 * Создание escrow платежа для заказа
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await context.params
    const body = await req.json()
    const { amount, currency = 'usd' } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь имеет доступ к заказу
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        sellerId: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Только покупатель может создать escrow платеж
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await createEscrowPayment(orderId, amount, currency)

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating escrow payment:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders/[orderId]/escrow
 * Освобождение или отмена escrow платежа
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await context.params
    const body = await req.json()
    const { action, reason, force } = body // action: 'release' | 'cancel'

    // Проверяем доступ к заказу
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        sellerId: true,
        escrowStatus: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем права доступа
    const isBuyer = order.buyerId === session.user.id
    const isSeller = order.sellerId === session.user.id
    
    // Проверяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    const isAdmin = user?.role === 'ADMIN'

    if (action === 'release') {
      // Только продавец или админ может запросить освобождение
      if (!isSeller) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const result = await releaseEscrow(orderId, force === true)
      return NextResponse.json(result)
    } else if (action === 'cancel') {
      // Только покупатель может отменить escrow
      if (!isBuyer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (!reason) {
        return NextResponse.json(
          { error: 'Reason is required for cancellation' },
          { status: 400 }
        )
      }

      const result = await cancelEscrow(orderId, reason)
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "release" or "cancel"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error processing escrow action:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

