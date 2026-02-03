import { FastifyInstance } from 'fastify'
import { PaymentController } from '../controllers/payment.controller'
import { createPaymentSchema } from '../dtos/request/create-payment.dto'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function paymentRoutes(fastify: FastifyInstance) {
    const controller = new PaymentController()

    // Get all payments
    fastify.get('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get all payments',
            tags: ['Payments'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getPayments,
    })

    // Get single payment
    fastify.get('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get payment by ID',
            tags: ['Payments'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getPayment,
    })

    // Create payment (protected)
    fastify.post('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Process payment',
            tags: ['Payments'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = createPaymentSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.createPayment,
    })
}
