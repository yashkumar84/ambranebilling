import { FastifyRequest, FastifyReply } from 'fastify'
import { OrderService } from '../services/order.service'
import { InvoiceService } from '../services/invoice.service'
import { CreateOrderDTO } from '../dtos/request/create-order.dto'
import { UpdateOrderDTO } from '../dtos/request/update-order.dto'
import { ApiResponse } from '@/common/dtos/response.dto'

export class OrderController {
    private orderService: OrderService
    private invoiceService: InvoiceService

    constructor() {
        this.orderService = new OrderService()
        this.invoiceService = new InvoiceService()
        this.getOrders = this.getOrders.bind(this)
        this.getOrder = this.getOrder.bind(this)
        this.createOrder = this.createOrder.bind(this)
        this.updateOrder = this.updateOrder.bind(this)
        this.deleteOrder = this.deleteOrder.bind(this)
        this.updateOrderStatus = this.updateOrderStatus.bind(this)
        this.getDashboardStats = this.getDashboardStats.bind(this)
        this.getDetailedAnalytics = this.getDetailedAnalytics.bind(this)
        this.processRefund = this.processRefund.bind(this)
        this.generateInvoice = this.generateInvoice.bind(this)
        this.generateReceipt = this.generateReceipt.bind(this)
    }

    async getOrders(request: FastifyRequest, reply: FastifyReply) {
        const { page = 1, limit = 20 } = request.query as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const result = await this.orderService.findAll(tenantId, page, limit)
        return reply.code(200).send(ApiResponse.success(result, 'Orders retrieved successfully'))
    }

    async getOrder(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const order = await this.orderService.findById(id, tenantId)
        return reply.code(200).send(ApiResponse.success(order, 'Order retrieved successfully'))
    }

    async createOrder(request: FastifyRequest, reply: FastifyReply) {
        const data = request.body as CreateOrderDTO
        const userId = (request as any).user.userId
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const order = await this.orderService.create(data, tenantId, userId)
        return reply.code(201).send(ApiResponse.success(order, 'Order created successfully'))
    }

    async updateOrder(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const data = request.body as UpdateOrderDTO
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const order = await this.orderService.update(id, data, tenantId)
        return reply.code(200).send(ApiResponse.success(order, 'Order updated successfully'))
    }

    async deleteOrder(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        await this.orderService.delete(id, tenantId)
        return reply.code(200).send(ApiResponse.success(null, 'Order deleted successfully'))
    }

    async updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const { status } = request.body as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const order = await this.orderService.updateStatus(id, status, tenantId)
        return reply.code(200).send(ApiResponse.success(order, 'Order status updated successfully'))
    }

    async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user
        let tenantId = user.tenantId

        // Super admin can access all tenants or specify tenant via header
        if (user?.isSuperAdmin) {
            const targetTenant = request.headers['x-tenant-id'] as string
            if (targetTenant) {
                tenantId = targetTenant
            } else {
                return reply.code(200).send(ApiResponse.success({
                    totalOrders: 0,
                    todayOrders: 0,
                    totalRevenue: 0,
                    todayRevenue: 0
                }, 'Dashboard statistics retrieved successfully'))
            }
        } else if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const stats = await this.orderService.getDashboardStats(tenantId)
        return reply.code(200).send(ApiResponse.success(stats, 'Dashboard statistics retrieved successfully'))
    }

    async getDetailedAnalytics(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user
        let tenantId = user.tenantId

        // Super admin can access all tenants or specify tenant via header
        if (user?.isSuperAdmin) {
            const targetTenant = request.headers['x-tenant-id'] as string
            if (targetTenant) {
                tenantId = targetTenant
            } else {
                return reply.code(200).send(ApiResponse.success({
                    ordersByStatus: [],
                    ordersByType: [],
                    totalRevenue: 0
                }, 'Detailed analytics retrieved successfully'))
            }
        } else if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const analytics = await this.orderService.getDetailedAnalytics(tenantId)
        return reply.code(200).send(ApiResponse.success(analytics, 'Detailed analytics retrieved successfully'))
    }

    async processRefund(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        try {
            const order = await this.orderService.processRefund(id, tenantId)
            return reply.code(200).send(ApiResponse.success(order, 'Refund processed successfully'))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    async generateInvoice(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        try {
            const order = await this.orderService.findById(id, tenantId)
            const pdfBuffer = await this.invoiceService.generateInvoice(order as any)

            return reply
                .code(200)
                .header('Content-Type', 'application/pdf')
                .header('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`)
                .send(pdfBuffer)
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    async generateReceipt(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).user?.tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        try {
            const order = await this.orderService.findById(id, tenantId)
            const pdfBuffer = await this.invoiceService.generateReceipt(order as any)

            return reply
                .code(200)
                .header('Content-Type', 'application/pdf')
                .header('Content-Disposition', `inline; filename=receipt-${order.orderNumber}.pdf`)
                .send(pdfBuffer)
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }
}
