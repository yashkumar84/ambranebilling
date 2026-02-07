import { FastifyInstance } from 'fastify'
import { OrderController } from '../controllers/order.controller'
import { createOrderSchema } from '../dtos/request/create-order.dto'
import { updateOrderSchema } from '../dtos/request/update-order.dto'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function orderRoutes(fastify: FastifyInstance) {
    const controller = new OrderController()

    // Get dashboard stats
    fastify.get('/stats/restaurant/:restaurantId', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get dashboard statistics',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getDashboardStats,
    })

    // Get detailed analytics
    fastify.get('/analytics/restaurant/:restaurantId', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get detailed analytics',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getDetailedAnalytics,
    })

    // Get all orders for a restaurant
    fastify.get('/restaurant/:restaurantId', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get all orders for a restaurant',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getOrders,
    })

    // Get single order
    fastify.get('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get order by ID',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getOrder,
    })

    // Create order (protected)
    fastify.post('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Create new order',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = createOrderSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.createOrder,
    })

    // Update order (protected)
    fastify.put('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Update order',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = updateOrderSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.updateOrder,
    })

    // Update order status (protected)
    fastify.patch('/:id/status', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Update order status',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.updateOrderStatus,
    })

    // Delete order (protected)
    fastify.delete('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Delete order',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.deleteOrder,
    })

    // Process refund (protected)
    fastify.post('/:id/refund', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Process order refund',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.processRefund,
    })

    // Generate invoice (protected)
    fastify.get('/:id/invoice', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Generate and download order invoice PDF',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.generateInvoice,
    })

    // Generate receipt (thermal) (protected)
    fastify.get('/:id/receipt', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Generate and view order thermal receipt PDF',
            tags: ['Orders'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.generateReceipt,
    })
}
