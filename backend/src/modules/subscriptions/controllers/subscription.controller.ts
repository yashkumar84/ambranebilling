import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PaymentService } from '../../payments/services/payment.service'
import { ApiResponse } from '@/common/dtos/response.dto'

const prisma = new PrismaClient()

export class SubscriptionController {
    private paymentService: PaymentService

    constructor() {
        this.paymentService = new PaymentService()
    }

    private async resolveTenantId(request: FastifyRequest): Promise<string | null> {
        let tenantId = (request as any).user.tenantId
        if (tenantId) return tenantId

        const userId = (request as any).user.userId
        console.log(`[DEBUG] Resolving tenantId for userId: ${userId}`)
        if (!userId) {
            console.error('[DEBUG] No userId found in request.user')
            return null
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tenantId: true }
        })

        console.log(`[DEBUG] DB lookup returned tenantId: ${user?.tenantId}`)
        return user?.tenantId || null
    }

    /**
     * Get all available subscription plans
     */
    getPlans = async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const plans = await prisma.subscriptionPlan.findMany({
                where: { isActive: true },
                orderBy: { priceMonthly: 'asc' }
            })
            return reply.send(ApiResponse.success(plans))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    /**
     * Get current subscription status for a tenant
     */
    getMySubscription = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = await this.resolveTenantId(request)
        if (!tenantId) {
            return reply.code(400).send(ApiResponse.error('Tenant ID required'))
        }

        try {
            const subscription = await prisma.tenantSubscription.findUnique({
                where: { tenantId },
                include: { plan: true }
            })
            return reply.send(ApiResponse.success(subscription))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    /**
     * Create a Razorpay order for a plan purchase
     */
    createCheckout = async (request: FastifyRequest, reply: FastifyReply) => {
        console.log('[DEBUG] createCheckout called')
        const tenantId = await this.resolveTenantId(request)
        const { planId, billingCycle } = request.body as { planId: string, billingCycle: 'MONTHLY' | 'YEARLY' }

        console.log(`[DEBUG] createCheckout - tenantId: ${tenantId}, planId: ${planId}, billingCycle: ${billingCycle}`)

        if (!tenantId) {
            console.error('[DEBUG] No tenantId, returning 400')
            return reply.code(400).send(ApiResponse.error('Tenant ID required'))
        }

        try {
            console.log('[DEBUG] Calling paymentService.createPlanOrder')
            const order = await this.paymentService.createPlanOrder(tenantId, planId, billingCycle)
            console.log('[DEBUG] Order created successfully:', order)
            return reply.send(ApiResponse.success(order))
        } catch (error: any) {
            console.error('[DEBUG] Error in createCheckout - Full error object:', JSON.stringify(error, null, 2))
            console.error('[DEBUG] Error message:', error.message, 'statusCode:', error.statusCode)
            const statusCode = error.statusCode || 500
            const errorMessage = error.message || error.toString() || 'An error occurred during checkout'
            return reply.code(statusCode).send(ApiResponse.error(errorMessage))
        }
    }

    /**
     * Verify payment and activate plan
     */
    verifyPayment = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = await this.resolveTenantId(request)
        const { orderId, paymentId, signature } = request.body as any

        if (!tenantId) {
            return reply.code(400).send(ApiResponse.error('Tenant ID required'))
        }

        try {
            const result = await this.paymentService.verifyPlanPayment(tenantId, {
                orderId,
                paymentId,
                signature
            })
            return reply.send(ApiResponse.success(result, 'Subscription activated successfully'))
        } catch (error: any) {
            return reply.code(400).send(ApiResponse.error(error.message))
        }
    }
}
