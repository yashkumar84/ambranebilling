import { FastifyInstance } from 'fastify'
import { PublicController } from '../controllers/public.controller'

export default async function publicRoutes(fastify: FastifyInstance) {
    const controller = new PublicController()

    // Public menu access for QR codes
    fastify.get('/menu/:tenantId', {
        schema: {
            description: 'Get public menu for a restaurant',
            tags: ['Public'],
            params: {
                type: 'object',
                properties: {
                    tenantId: { type: 'string' }
                },
                required: ['tenantId']
            }
        },
        handler: controller.getPublicMenu,
    })

    // Public order placement
    fastify.post('/orders', {
        schema: {
            description: 'Place an order from a public QR page',
            tags: ['Public'],
            body: {
                type: 'object',
                properties: {
                    tenantId: { type: 'string' },
                    tableId: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productId: { type: 'string' },
                                quantity: { type: 'number' },
                                price: { type: 'number' }
                            },
                            required: ['productId', 'quantity', 'price']
                        }
                    },
                    customerName: { type: 'string' },
                    customerPhone: { type: 'string' }
                },
                required: ['tenantId', 'items']
            }
        },
        handler: controller.createPublicOrder,
    })
}
