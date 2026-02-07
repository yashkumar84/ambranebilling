import { FastifyInstance } from 'fastify'
import { TableController } from '../controllers/table.controller'
import { createTableSchema } from '../dtos/request/create-table.dto'
import { updateTableSchema } from '../dtos/request/update-table.dto'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function tableRoutes(fastify: FastifyInstance) {
    const controller = new TableController()

    // Get all tables for a restaurant
    fastify.get('/restaurant/:restaurantId', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get all tables for a restaurant',
            tags: ['Tables'],
        },
        handler: controller.getTables,
    })

    // Get single table
    fastify.get('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get table by ID',
            tags: ['Tables'],
        },
        handler: controller.getTable,
    })

    // Create table (protected)
    fastify.post('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Create new table',
            tags: ['Tables'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = createTableSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.createTable,
    })

    // Update table (protected)
    fastify.put('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Update table',
            tags: ['Tables'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = updateTableSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.updateTable,
    })

    // Update table status (protected)
    fastify.patch('/:id/status', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Update table status',
            tags: ['Tables'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.updateTableStatus,
    })

    // Delete table (protected)
    fastify.delete('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Delete table',
            tags: ['Tables'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.deleteTable,
    })
}
