import { PrismaClient, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

export class AnalyticsService {
    async getDashboardMetrics(tenantId: string) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const [
            todayStats,
            yesterdayStats,
            totalCustomers,
            activeProducts
        ] = await Promise.all([
            // Today's Stats
            prisma.order.aggregate({
                where: {
                    tenantId,
                    createdAt: { gte: today },
                    paymentStatus: PaymentStatus.COMPLETED
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            }),
            // Yesterday's Stats for Comparison
            prisma.order.aggregate({
                where: {
                    tenantId,
                    createdAt: { gte: yesterday, lt: today },
                    paymentStatus: PaymentStatus.COMPLETED
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            }),
            // Total Customers
            prisma.customer.count({ where: { tenantId } }),
            // Active Products
            prisma.product.count({ where: { tenantId, isActive: true } })
        ])

        const todayRevenue = Number(todayStats._sum.totalAmount || 0)
        const yesterdayRevenue = Number(yesterdayStats._sum.totalAmount || 0)
        const revenueGrowth = yesterdayRevenue === 0 ? 100 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100

        return {
            revenue: {
                current: todayRevenue,
                previous: yesterdayRevenue,
                growth: Number(revenueGrowth.toFixed(2))
            },
            orders: {
                current: todayStats._count.id,
                previous: yesterdayStats._count.id,
                growth: yesterdayStats._count.id === 0 ? 100 : Number((((todayStats._count.id - yesterdayStats._count.id) / yesterdayStats._count.id) * 100).toFixed(2))
            },
            customers: totalCustomers,
            products: activeProducts
        }
    }

    async getSalesTrends(tenantId: string, days: number = 7) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        const sales = await prisma.order.findMany({
            where: {
                tenantId,
                createdAt: { gte: startDate },
                paymentStatus: PaymentStatus.COMPLETED
            },
            select: {
                createdAt: true,
                totalAmount: true
            },
            orderBy: { createdAt: 'asc' }
        })

        // Group by day
        const trends: Record<string, number> = {}
        for (let i = 0; i < days; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            trends[d.toISOString().split('T')[0]] = 0
        }

        sales.forEach(sale => {
            const date = sale.createdAt.toISOString().split('T')[0]
            if (trends[date] !== undefined) {
                trends[date] += Number(sale.totalAmount)
            }
        })

        return Object.entries(trends)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))
    }
}
