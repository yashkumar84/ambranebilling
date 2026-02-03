import { FastifyRequest, FastifyReply } from 'fastify'
import { PermissionService } from '../services/permission.service'
import { CreatePermissionDTO } from '../dtos/request/create-permission.dto'
import { ApiResponse } from '@/common/dtos/response.dto'

export class PermissionController {
    private permissionService: PermissionService

    constructor() {
        this.permissionService = new PermissionService()
        this.getPermissions = this.getPermissions.bind(this)
        this.getPermission = this.getPermission.bind(this)
        this.createPermission = this.createPermission.bind(this)
        this.deletePermission = this.deletePermission.bind(this)
        this.getResources = this.getResources.bind(this)
    }

    async getPermissions(_request: FastifyRequest, reply: FastifyReply) {
        const result = await this.permissionService.getAllPermissions()
        return reply.code(200).send(ApiResponse.success(result, 'Permissions retrieved successfully'))
    }

    async getPermission(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const permission = await this.permissionService.getPermissionById(id)
        return reply.code(200).send(ApiResponse.success(permission, 'Permission retrieved successfully'))
    }

    async createPermission(request: FastifyRequest, reply: FastifyReply) {
        const data = request.body as CreatePermissionDTO
        const permission = await this.permissionService.createPermission(data)
        return reply.code(201).send(ApiResponse.success(permission, 'Permission created successfully'))
    }

    async deletePermission(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        await this.permissionService.deletePermission(id)
        return reply.code(200).send(ApiResponse.success(null, 'Permission deleted successfully'))
    }

    async getResources(_request: FastifyRequest, reply: FastifyReply) {
        // Since getResources doesn't exist, we'll return a unique list of resources from all permissions
        const allPermissions = await this.permissionService.getAllPermissions()
        const resources = Array.from(new Set(allPermissions.map(p => p.resource)))
        return reply.code(200).send(ApiResponse.success(resources, 'Resources retrieved successfully'))
    }
}
