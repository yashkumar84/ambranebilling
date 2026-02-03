import { FastifyRequest, FastifyReply } from 'fastify'
import { RoleService } from '../services/role.service'
import { CreateRoleDTO } from '../dtos/request/create-role.dto'
import { AssignPermissionsDTO } from '../dtos/request/assign-permissions.dto'
import { ApiResponse } from '@/common/dtos/response.dto'

export class RoleController {
    private roleService: RoleService

    constructor() {
        this.roleService = new RoleService()
        this.getRoles = this.getRoles.bind(this)
        this.getRole = this.getRole.bind(this)
        this.createRole = this.createRole.bind(this)
        this.updateRole = this.updateRole.bind(this)
        this.deleteRole = this.deleteRole.bind(this)
        this.assignPermissions = this.assignPermissions.bind(this)
        this.removePermission = this.removePermission.bind(this)
    }

    async getRoles(request: FastifyRequest, reply: FastifyReply) {
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const result = await this.roleService.findAll(tenantId)

        return reply.code(200).send(ApiResponse.success(result, 'Roles retrieved successfully'))
    }

    async getRole(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        const role = await this.roleService.findById(id, tenantId)
        return reply.code(200).send(ApiResponse.success(role, 'Role retrieved successfully'))
    }

    async createRole(request: FastifyRequest, reply: FastifyReply) {
        const data = request.body as CreateRoleDTO
        const tenantId = (request as any).tenantId
        const userId = (request as any).user.id
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        const role = await this.roleService.create(data, tenantId, userId)
        return reply.code(201).send(ApiResponse.success(role, 'Role created successfully'))
    }

    async updateRole(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const data = request.body as Partial<CreateRoleDTO>
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        const role = await this.roleService.update(id, data, tenantId)
        return reply.code(200).send(ApiResponse.success(role, 'Role updated successfully'))
    }

    async deleteRole(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        await this.roleService.delete(id, tenantId)
        return reply.code(200).send(ApiResponse.success(null, 'Role deleted successfully'))
    }

    async assignPermissions(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const data = request.body as AssignPermissionsDTO
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        const role = await this.roleService.assignPermissions(id, data.permissionIds, tenantId)
        return reply.code(200).send(ApiResponse.success(role, 'Permissions assigned successfully'))
    }

    async removePermission(request: FastifyRequest, reply: FastifyReply) {
        const { id, permissionId } = request.params as any
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        const role = await this.roleService.removePermission(id, permissionId, tenantId)
        return reply.code(200).send(ApiResponse.success(role, 'Permission removed successfully'))
    }
}
