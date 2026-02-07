import { PrismaClient, PaymentStatus } from '@prisma/client'
import { CreatePaymentDTO } from '../dtos/request/create-payment.dto'
import { PaymentResponseDTO } from '../dtos/response/payment.response.dto'
import { PaymentMapper } from '../mappers/payment.mapper'
import { AppError } from '@/common/middleware/error.middleware'
import { PaginationDTO } from '@/common/dtos/pagination.dto'
import { config } from '@/config/env.config'
const Razorpay = require('razorpay')

const prisma = new PrismaClient()

export class PaymentService {
    private razorpay: any

    constructor() {
        if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
            this.razorpay = new Razorpay({
                key_id: config.RAZORPAY_KEY_ID,
                key_secret: config.RAZORPAY_KEY_SECRET,
            })
        }
    }
    async getPayments(tenantId: string, pagination: PaginationDTO, filters?: { orderId?: string }) {
        const payments = await prisma.payment.findMany({
            where: {
                order: { tenantId },
                orderId: filters?.orderId,
            },
            include: {
                order: true,
            },
            skip: pagination.skip,
            take: pagination.limit,
            orderBy: { createdAt: 'desc' },
        })

        const total = await prisma.payment.count({
            where: {
                order: { tenantId },
                orderId: filters?.orderId,
            },
        })

        return {
            items: PaymentMapper.toResponseDTOArray(payments),
            ...pagination.getMetadata(total),
        }
    }

    async getPayment(id: string, tenantId: string): Promise<PaymentResponseDTO> {
        const payment = await prisma.payment.findFirst({
            where: {
                id,
                order: { tenantId },
            },
            include: {
                order: true,
            },
        })

        if (!payment) {
            throw new AppError(404, 'Payment not found')
        }

        return PaymentMapper.toResponseDTO(payment)
    }

    async createPayment(data: CreatePaymentDTO, tenantId: string): Promise<PaymentResponseDTO> {
        // Verify order belongs to tenant
        const order = await prisma.order.findFirst({
            where: {
                id: data.orderId,
                tenantId,
            },
        })

        if (!order) {
            throw new AppError(404, 'Order not found')
        }

        const payment = await prisma.payment.create({
            data: {
                orderId: data.orderId,
                amount: data.amount,
                paymentMethod: data.method,
                paymentStatus: data.status || 'PENDING',
                transactionId: data.transactionId,
            },
            include: {
                order: true,
            },
        })

        return PaymentMapper.toResponseDTO(payment)
    }

    async updatePaymentStatus(id: string, status: PaymentStatus, tenantId: string) {
        const payment = await prisma.payment.findFirst({
            where: {
                id,
                order: { tenantId },
            },
        })

        if (!payment) {
            throw new AppError(404, 'Payment not found')
        }

        const updated = await prisma.payment.update({
            where: { id },
            data: { paymentStatus: status },
            include: {
                order: true,
            },
        })

        return PaymentMapper.toResponseDTO(updated)
    }

    /**
     * Create Razorpay Order for Subscription Plan
     */
    async createPlanOrder(tenantId: string, planId: string, billingCycle: 'MONTHLY' | 'YEARLY') {
        console.log(`[DEBUG] createPlanOrder called - tenantId: ${tenantId}, planId: ${planId}, billingCycle: ${billingCycle}`)

        let plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        })
        console.log(`[DEBUG] Plan lookup by ID result:`, plan ? 'Found' : 'Not found')

        // Fallback to name/slug lookup if ID not found (matches onboarding slugs)
        if (!plan) {
            console.log(`[DEBUG] Attempting fallback name lookup for: ${planId}`)
            plan = await prisma.subscriptionPlan.findFirst({
                where: { name: { contains: planId, mode: 'insensitive' } }
            })
            console.log(`[DEBUG] Plan lookup by name result:`, plan ? `Found: ${plan.name}` : 'Not found')
        }

        if (!plan) {
            console.error(`[DEBUG] Plan not found for planId: ${planId}`)
            throw new AppError(404, 'Subscription plan not found')
        }

        const amount = billingCycle === 'MONTHLY' ? Number(plan.priceMonthly) : Number(plan.priceYearly)
        console.log(`[DEBUG] Plan amount: ${amount}`)

        if (!this.razorpay) {
            console.error('[DEBUG] Razorpay not configured!')
            throw new AppError(500, 'Razorpay not configured')
        }

        console.log('[DEBUG] Creating Razorpay order...')
        // Razorpay receipt max length is 40 chars
        // Format: rcpt_XXXXXXXX_TTTTTTTTT (rcpt_ + 8 char tenant ID + _ + base36 timestamp)
        const shortTenantId = tenantId.slice(-8) // Last 8 chars of UUID
        const shortTimestamp = Date.now().toString(36) // Base36 encoding for shorter timestamp
        const receipt = `rcpt_${shortTenantId}_${shortTimestamp}` // ~28 chars total

        const order = await this.razorpay.orders.create({
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt,
            notes: {
                tenantId,
                planId,
                billingCycle,
            },
        })
        console.log('[DEBUG] Razorpay order created successfully:', order.id)

        return order
    }

    /**
     * Verify Plan Payment and Activate/Update Subscription
     */
    async verifyPlanPayment(tenantId: string, data: { orderId: string, paymentId: string, signature: string }) {
        const crypto = require('crypto')
        const body = data.orderId + '|' + data.paymentId
        const expectedSignature = crypto
            .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex')

        if (expectedSignature !== data.signature) {
            throw new AppError(400, 'Invalid payment signature')
        }

        // Get order details to know which plan was purchased
        const order = await this.razorpay.orders.fetch(data.orderId)
        const { planId, billingCycle } = order.notes

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        })

        if (!plan) {
            throw new AppError(404, 'Plan not found')
        }

        // Calculate end date
        const endDate = new Date()
        if (billingCycle === 'MONTHLY') {
            endDate.setMonth(endDate.getMonth() + 1)
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1)
        }

        // Update subscription AND activate tenant in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update or create subscription
            const subscription = await tx.tenantSubscription.upsert({
                where: { tenantId },
                update: {
                    planId,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate,
                },
                create: {
                    tenantId,
                    planId,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate,
                },
            })

            // 2. Activate the tenant (unlock full features)
            await tx.tenant.update({
                where: { id: tenantId },
                data: { isActive: true },
            })

            return subscription
        })

        return result
    }
}
