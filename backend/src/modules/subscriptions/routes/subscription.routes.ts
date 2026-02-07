import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/common/middleware/auth.middleware'
import { SubscriptionController } from '../controllers/subscription.controller'

export default async function subscriptionRoutes(fastify: FastifyInstance) {
    const controller = new SubscriptionController()

    /**
     * Public route to get all plans
     * GET /api/subscriptions/plans
     */
    fastify.get('/plans', controller.getPlans)

    // Protected routes
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', authMiddleware)

        /**
         * Get current tenant subscription
         * GET /api/subscriptions/me
         */
        protectedRoutes.get('/me', controller.getMySubscription)

        /**
         * Create Checkout Order for a Plan
         * POST /api/subscriptions/purchase
         */
        protectedRoutes.post('/purchase', controller.createCheckout)

        /**
         * Verify Plan Payment
         * POST /api/subscriptions/verify
         */
        protectedRoutes.post('/verify', controller.verifyPayment)
    })
}
