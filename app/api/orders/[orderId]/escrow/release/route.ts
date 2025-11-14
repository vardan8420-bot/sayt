import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { releaseEscrow } from '../../../../../../lib/escrow'
import prisma from '../../../../../../lib/prisma'

/**
 * POST /api/orders/[orderId]/escrow/release
 * Освобождение escrow платежа для заказа
 * 
 * Простой роут для освобождения escrow без дополнительных параметров
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
    
    // Опциональный body для параметра force
    let force = false
    try {
      const body = await req.json()
      force = body?.force === true
    } catch {
      // Body не обязателен, используем значения по умолчанию
    }

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
    const isSeller = order.sellerId === session.user.id
    const isBuyer = order.buyerId === session.user.id
    
    // Проверяем роль пользователя (админ может принудительно освободить)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    const isAdmin = user?.role === 'ADMIN'

    // Только продавец или админ может освободить escrow
    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { error: 'Only seller or admin can release escrow' },
        { status: 403 }
      )
    }

    // Если принудительное освобождение, проверяем что это админ
    if (force && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admin can force release escrow' },
        { status: 403 }
      )
    }

    // Освобождаем escrow
    const result = await releaseEscrow(orderId, force === true)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Error releasing escrow:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

