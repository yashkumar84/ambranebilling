import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/common/middleware/auth.middleware'
import { PaymentService } from '../../payments/services/payment.service'

const prisma = new PrismaClient()
const paymentService = new PaymentService()

export default async function subscriptionRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', authMiddleware)

    /**
     * Get current tenant subscription
     * GET /api/subscriptions/me
     */
    fastify.get('/me', async (request, reply) => {
        const { tenantId } = request.user as { tenantId: string }

        if (!tenantId) {
            return reply.code(400).send({ error: 'Tenant context required' })
        }

        const subscription = await prisma.tenantSubscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        })

        return reply.send(subscription)
    })

    /**
     * Create Checkout Order for a Plan
     * POST /api/subscriptions/purchase
     */
    fastify.post('/purchase', async (request, reply) => {
        const { tenantId } = request.user as { tenantId: string }
        const { planId, billingCycle } = request.body as { planId: string, billingCycle: 'MONTHLY' | 'YEARLY' }

        if (!tenantId) {
            return reply.code(400).send({ error: 'Tenant context required' })
        }

        try {
            const order = await paymentService.createPlanOrder(tenantId, planId, billingCycle)
            return reply.send(order)
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message })
        }
    })

    /**
     * Verify Plan Payment
     * POST /api/subscriptions/verify
     */
    fastify.post('/verify', async (request, reply) => {
        const { tenantId } = request.user as { tenantId: string }
        const data = request.body as { orderId: string, paymentId: string, signature: string }

        if (!tenantId) {
            return reply.code(400).send({ error: 'Tenant context required' })
        }

        try {
            const subscription = await paymentService.verifyPlanPayment(tenantId, data)
            return reply.send({
                message: 'Subscription activated successfully',
                subscription,
            })
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message })
        }
    })
}
