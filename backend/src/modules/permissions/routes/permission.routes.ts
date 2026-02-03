import { FastifyInstance } from 'fastify'
import { PermissionController } from '../controllers/permission.controller'
import { createPermissionSchema } from '../dtos/request/create-permission.dto'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function permissionRoutes(fastify: FastifyInstance) {
    const controller = new PermissionController()

    // Get all permissions
    fastify.get('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get all permissions',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getPermissions,
    })

    // Get resources
    fastify.get('/resources', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get all unique resources',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getResources,
    })

    // Get single permission
    fastify.get('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get permission by ID',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getPermission,
    })

    // Create permission (admin only)
    fastify.post('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Create new permission',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = createPermissionSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.createPermission,
    })

    // Delete permission (admin only)
    fastify.delete('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Delete permission',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.deletePermission,
    })
}
