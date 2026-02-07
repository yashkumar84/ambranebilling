import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ProductService } from '../services/products.service'

const prisma = new PrismaClient()

export class PublicController {
    private productService: ProductService

    constructor() {
        this.productService = new ProductService()
    }

    getPublicMenu = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.params as { tenantId: string }

        try {
            // Check if tenant exists and is active
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId, isActive: true }
            })

            if (!tenant) {
                return reply.code(404).send({
                    success: false,
                    message: 'Restaurant not found or inactive'
                })
            }

            const result = await this.productService.findAll(tenantId, 1, 100, '')
            return reply.send({
                success: true,
                data: result.products,
                restaurantName: tenant.businessName
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    createPublicOrder = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId, tableId, items, customerName, customerPhone } = request.body as any
        const Razorpay = require('razorpay')

        try {
            // Basic validation
            if (!tenantId || !items || items.length === 0) {
                return reply.code(400).send({
                    success: false,
                    message: 'Missing required order information'
                })
            }

            // 1. Calculate and validate totals securely
            let subtotalValue = 0
            const validatedItems: any[] = []

            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId, tenantId },
                    include: { variants: true }
                })

                if (!product) continue

                let unitPrice = Number(product.sellingPrice)
                let name = product.name

                // Check for variants if provided
                if (item.variantId) {
                    const variant = product.variants.find((v: any) => v.id === item.variantId)
                    if (variant) {
                        unitPrice += Number(variant.priceAdjustment)
                        name = `${product.name} (${variant.variantName})`
                    }
                }

                subtotalValue += unitPrice * item.quantity
                validatedItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                    productName: name,
                    subtotal: unitPrice * item.quantity
                })
            }

            if (validatedItems.length === 0) {
                return reply.code(400).send({ success: false, message: 'No valid items found' })
            }

            // 2. Create Order in database (PENDING status)
            const orderNumber = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`

            const order = await prisma.$transaction(async (tx) => {
                const newOrder = await tx.order.create({
                    data: {
                        tenantId: tenantId,
                        orderNumber: orderNumber,
                        tableId: tableId,
                        status: 'PENDING',
                        subtotal: subtotalValue,
                        totalAmount: subtotalValue,
                        orderType: 'DINE_IN',
                        notes: `Customer: ${customerName || 'Walk-in'} | Phone: ${customerPhone || 'N/A'}`,
                        items: {
                            create: validatedItems.map(item => ({
                                productId: item.productId,
                                variantId: item.variantId,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                subtotal: item.subtotal,
                                productName: item.productName
                            }))
                        }
                    }
                })

                // Create KOT for staff
                if (tableId) {
                    await tx.table.update({
                        where: { id: tableId },
                        data: { status: 'OCCUPIED' }
                    })
                }

                return newOrder
            })

            // 3. Create Razorpay Order for this specific order
            const rzp = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            })

            const rzpOrder = await rzp.orders.create({
                amount: Math.round(subtotalValue * 100), // paise
                currency: 'INR',
                receipt: order.orderNumber,
                notes: {
                    orderId: order.id,
                    tenantId: tenantId,
                    type: 'CUSTOMER_ORDER'
                }
            })

            return reply.code(201).send({
                success: true,
                order: order,
                razorpayOrder: rzpOrder,
                message: 'Order created. Proceed to payment.'
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    verifyPublicOrderPayment = async (request: FastifyRequest, reply: FastifyReply) => {
        const { orderId, paymentId, signature } = request.body as any
        const crypto = require('crypto')

        try {
            // 1. Verify Signature
            const body = orderId + '|' + paymentId
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex')

            if (expectedSignature !== signature) {
                return reply.code(400).send({ success: false, message: 'Invalid payment signature' })
            }

            // 2. Fetch order notes from Razorpay to get our local orderId
            const Razorpay = require('razorpay')
            const rzp = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            })

            const rzpOrder = await rzp.orders.fetch(orderId)
            const localOrderId = rzpOrder.notes.orderId

            // 3. Update Order and Record Payment
            const result = await prisma.$transaction(async (tx) => {
                const order = await tx.order.update({
                    where: { id: localOrderId },
                    data: {
                        paymentStatus: 'COMPLETED',
                        status: 'PREPARING' // Kitchen can start preparing
                    }
                })

                await tx.payment.create({
                    data: {
                        orderId: localOrderId,
                        amount: order.totalAmount,
                        paymentMethod: 'UPI',
                        paymentStatus: 'COMPLETED',
                        transactionId: paymentId
                    }
                })

                return order
            })

            return reply.send({
                success: true,
                data: result,
                message: 'Payment verified and order confirmed'
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    // Customer Loyalty Hub Logic
    getCustomerHub = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId, phone } = request.params as { tenantId: string; phone: string }

        try {
            // Find customer by phone in this tenant
            const customer = await prisma.customer.findUnique({
                where: {
                    tenantId_phone: { tenantId, phone }
                },
                include: {
                    orders: {
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            items: true
                        }
                    }
                }
            })

            if (!customer) {
                return reply.code(404).send({
                    success: false,
                    message: 'Customer profile not found in this network.'
                })
            }

            return reply.send({
                success: true,
                data: {
                    profile: {
                        name: customer.name,
                        phone: customer.phone,
                        loyaltyPoints: customer.loyaltyPoints,
                        currentBalance: customer.currentBalance
                    },
                    recentOrders: customer.orders
                }
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    getStoreOffers = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.params as { tenantId: string }

        try {
            const offers = await prisma.offer.findMany({
                where: {
                    tenantId,
                    isActive: true,
                    OR: [
                        { expiryDate: null },
                        { expiryDate: { gt: new Date() } }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            })

            return reply.send({
                success: true,
                data: offers
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }
}
