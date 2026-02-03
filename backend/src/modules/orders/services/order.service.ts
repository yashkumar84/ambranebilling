import { PrismaClient, PaymentStatus, OrderStatus } from '@prisma/client'
import { CreateOrderDTO } from '../dtos/request/create-order.dto'
import { UpdateOrderDTO } from '../dtos/request/update-order.dto'

const prisma = new PrismaClient()

export class OrderService {
    async findAll(tenantId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { tenantId },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where: { tenantId } }),
        ])

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    async findById(id: string, tenantId: string) {
        const order = await prisma.order.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        if (!order) {
            throw new Error('Order not found')
        }

        return order
    }

    async create(data: CreateOrderDTO, tenantId: string, userId: string) {
        // Calculate totals
        let subtotal = 0
        const items = data.items.map((item) => {
            const itemTotal = item.price * item.quantity
            subtotal += itemTotal
            return {
                productId: item.productId,
                variantId: item.variantId,
                productName: '', // Will be filled from product
                unitPrice: item.price,
                quantity: item.quantity,
                subtotal: itemTotal,
                notes: item.notes,
            }
        })

        const taxAmount = subtotal * (data.taxRate || 0) / 100
        const discountAmount = data.discount || 0
        const totalAmount = subtotal + taxAmount - discountAmount

        const order = await prisma.order.create({
            data: {
                tenantId,
                userId,
                orderNumber: await this.generateOrderNumber(tenantId),
                tableId: data.tableId,
                customerId: data.customerId,
                orderType: data.orderType || 'DINE_IN',
                status: 'PENDING',
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                paymentStatus: (data.paymentStatus || 'PENDING') as PaymentStatus,
                items: {
                    create: items,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        return order
    }

    async update(id: string, data: UpdateOrderDTO, tenantId: string) {
        const order = await prisma.order.findFirst({
            where: { id, tenantId },
        })

        if (!order) {
            throw new Error('Order not found')
        }

        const updated = await prisma.order.update({
            where: { id },
            data: {
                status: data.status,
                paymentStatus: data.paymentStatus as PaymentStatus | undefined,
                discountAmount: data.discount,
                notes: data.notes,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        return updated
    }

    async delete(id: string, tenantId: string) {
        const order = await prisma.order.findFirst({
            where: { id, tenantId },
        })

        if (!order) {
            throw new Error('Order not found')
        }

        await prisma.order.delete({
            where: { id },
        })

        return { message: 'Order deleted successfully' }
    }

    async updateStatus(id: string, status: OrderStatus, tenantId: string) {
        const order = await prisma.order.findFirst({
            where: { id, tenantId },
        })

        if (!order) {
            throw new Error('Order not found')
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        return updated
    }

    async getDashboardStats(tenantId: string) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [totalOrders, todayOrders, totalRevenue, todayRevenue] = await Promise.all([
            prisma.order.count({ where: { tenantId } }),
            prisma.order.count({
                where: {
                    tenantId,
                    createdAt: { gte: today },
                },
            }),
            prisma.order.aggregate({
                where: { tenantId, paymentStatus: PaymentStatus.COMPLETED },
                _sum: { totalAmount: true },
            }),
            prisma.order.aggregate({
                where: {
                    tenantId,
                    paymentStatus: PaymentStatus.COMPLETED,
                    createdAt: { gte: today },
                },
                _sum: { totalAmount: true },
            }),
        ])

        return {
            totalOrders,
            todayOrders,
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
            todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
        }
    }

    async getDetailedAnalytics(tenantId: string, startDate?: Date, endDate?: Date) {
        const where: any = { tenantId }

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = startDate
            if (endDate) where.createdAt.lte = endDate
        }

        const [ordersByStatus, ordersByType, totalRevenue] = await Promise.all([
            prisma.order.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            prisma.order.groupBy({
                by: ['orderType'],
                where,
                _count: true,
            }),
            prisma.order.aggregate({
                where: { ...where, paymentStatus: PaymentStatus.COMPLETED },
                _sum: { totalAmount: true },
            }),
        ])

        return {
            ordersByStatus,
            ordersByType,
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        }
    }

    private async generateOrderNumber(tenantId: string): Promise<string> {
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

        const lastOrder = await prisma.order.findFirst({
            where: {
                tenantId,
                orderNumber: { startsWith: `ORD-${dateStr}` },
            },
            orderBy: { createdAt: 'desc' },
        })

        let sequence = 1
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2])
            sequence = lastSequence + 1
        }

        return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`
    }
}
