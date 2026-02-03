import { FastifyReply, FastifyRequest } from 'fastify'
import { UsersService } from '../services/users.service'
import { AppError } from '@/common/middleware/error.middleware'

export class UsersController {
    private usersService: UsersService

    constructor() {
        this.usersService = new UsersService()
    }

    getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
        // Super admins can access all users, regular users need tenant context
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            throw new AppError(403, 'Tenant context required')
        }

        const { skip = 0, take = 20 } = request.query as { skip?: number; take?: number }
        const result = await this.usersService.getAllUsers(request.tenantId || undefined, skip, take)

        return reply.code(200).send({
            success: true,
            data: result.users,
            meta: {
                total: result.total,
            },
        })
    }

    getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            throw new AppError(403, 'Tenant context required')
        }

        const { id } = request.params as { id: string }
        const user = await this.usersService.getUserById(id, request.tenantId)

        return reply.code(200).send({
            success: true,
            data: user,
        })
    }

    createUser = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            throw new AppError(403, 'Tenant context required')
        }

        const user = await this.usersService.createUser(request.tenantId, request.body as any)

        return reply.code(201).send({
            success: true,
            data: user,
            message: 'User created successfully',
        })
    }

    updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            throw new AppError(403, 'Tenant context required')
        }

        const { id } = request.params as { id: string }
        const user = await this.usersService.updateUser(id, request.tenantId, request.body as any)

        return reply.code(200).send({
            success: true,
            data: user,
            message: 'User updated successfully',
        })
    }

    deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            throw new AppError(403, 'Tenant context required')
        }

        const { id } = request.params as { id: string }
        await this.usersService.deleteUser(id, request.tenantId)

        return reply.code(200).send({
            success: true,
            message: 'User deleted successfully',
        })
    }
}
