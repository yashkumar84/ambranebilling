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
        const { tenantId, tableId, items } = request.body as any

        try {
            // Basic validation
            if (!tenantId || !items || items.length === 0) {
                return reply.code(400).send({
                    success: false,
                    message: 'Missing required order information'
                })
            }

            // Create order as PENDING
            const order = await prisma.$transaction(async (tx) => {
                // 1. Calculate totals
                let subtotalValue = 0
                for (const item of items) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } })
                    if (product) {
                        subtotalValue += Number(product.sellingPrice) * item.quantity
                    }
                }

                const orderNumber = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`

                // 2. Create Order
                const newOrder = await (tx.order as any).create({
                    data: {
                        tenantId: tenantId,
                        orderNumber: orderNumber,
                        tableId: tableId,
                        status: 'PENDING',
                        subtotal: subtotalValue,
                        totalAmount: subtotalValue,
                        orderType: 'DINE_IN',
                        items: {
                            create: items.map((item: any) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: item.price,
                                totalPrice: item.price * item.quantity
                            }))
                        }
                    }
                })

                return newOrder
            })

            return reply.code(201).send({
                success: true,
                data: order,
                message: 'Order placed successfully. Please wait for staff confirmation.'
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }
}
