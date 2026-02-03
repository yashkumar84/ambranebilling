import { FastifyRequest, FastifyReply } from 'fastify'
import { PaymentService } from '../services/payment.service'
import { CreatePaymentDTO } from '../dtos/request/create-payment.dto'
import { ApiResponse } from '@/common/dtos/response.dto'
import { PaginationDTO } from '@/common/dtos/pagination.dto'

export class PaymentController {
    private paymentService: PaymentService

    constructor() {
        this.paymentService = new PaymentService()
        this.getPayments = this.getPayments.bind(this)
        this.getPayment = this.getPayment.bind(this)
        this.createPayment = this.createPayment.bind(this)
    }

    async getPayments(request: FastifyRequest, reply: FastifyReply) {
        const { page = 1, limit = 20, orderId } = request.query as any
        const tenantId = (request as any).tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const pagination = new PaginationDTO(page, limit)
        const result = await this.paymentService.getPayments(tenantId, pagination, {
            orderId: orderId,
        })

        return reply.code(200).send(ApiResponse.success(result, 'Payments retrieved successfully'))
    }

    async getPayment(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const payment = await this.paymentService.getPayment(id, tenantId)
        return reply.code(200).send(ApiResponse.success(payment, 'Payment retrieved successfully'))
    }

    async createPayment(request: FastifyRequest, reply: FastifyReply) {
        const data = request.body as CreatePaymentDTO
        const tenantId = (request as any).tenantId

        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const payment = await this.paymentService.createPayment(data, tenantId)
        return reply.code(201).send(ApiResponse.success(payment, 'Payment processed successfully'))
    }
}
