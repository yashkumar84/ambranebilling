import { FastifyInstance } from 'fastify'
import { RoleController } from '../controllers/role.controller'
import { createRoleSchema } from '../dtos/request/create-role.dto'
import { assignPermissionsSchema } from '../dtos/request/assign-permissions.dto'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function roleRoutes(fastify: FastifyInstance) {
    const controller = new RoleController()

    // Get all roles
    fastify.get('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get all roles',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getRoles,
    })

    // Get single role
    fastify.get('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get role by ID',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getRole,
    })

    // Create role (admin only)
    fastify.post('/', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Create new role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = createRoleSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.createRole,
    })

    // Update role (admin only)
    fastify.put('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Update role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.updateRole,
    })

    // Assign permissions to role (admin only)
    fastify.post('/:id/permissions', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Assign permissions to role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        preValidation: async (request, reply) => {
            const result = assignPermissionsSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.assignPermissions,
    })

    // Remove permission from role (admin only)
    fastify.delete('/:id/permissions/:permissionId', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Remove permission from role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.removePermission,
    })

    // Delete role (admin only)
    fastify.delete('/:id', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Delete role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.deleteRole,
    })
}
