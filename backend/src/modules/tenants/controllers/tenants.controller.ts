import { FastifyRequest, FastifyReply } from 'fastify'
import { TenantService } from '../services/tenants.service'
import { ApiResponse } from '@/common/dtos/response.dto'
import { AuthService } from '@/modules/auth/services/auth.service'

export class TenantsController {
    private tenantService: TenantService
    private authService: AuthService

    constructor() {
        this.tenantService = new TenantService()
        this.authService = new AuthService()
    }

    private async resolveTenantId(request: FastifyRequest): Promise<string | null> {
        let tenantId = (request as any).user.tenantId
        if (tenantId) return tenantId

        const userId = (request as any).user.userId
        if (!userId) return null

        const tenant = await this.tenantService.getTenantByOwnerId(userId)
        return tenant?.id || null
    }

    createTenant = async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = (request as any).user.userId
        const userEmail = (request as any).user.email

        // Use resolveTenantId to check DB for existing tenant even if token is stale
        const userTenantId = await this.resolveTenantId(request)

        console.log(`[DEBUG] createTenant attempt for userId: ${userId}, existing tenantId: ${userTenantId}`)

        if (userTenantId) {
            console.warn(`[DEBUG] User ${userId} already has tenant ${userTenantId}, rejecting create request.`)
            return reply.code(400).send(ApiResponse.error('User already belongs to a tenant'))
        }

        try {
            const data = request.body as any
            const result = await this.tenantService.createTenant(data, userId)

            // Generate new tokens with updated tenantId
            const tokens = await this.authService.refreshUserTokens(userId, userEmail, result.tenant.id, result.user.roleId || undefined)

            // Set new cookies
            reply
                .setCookie('accessToken', tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                })
                .setCookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                })

            return reply.code(201).send(ApiResponse.success({
                ...result,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }, 'Store created successfully'))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    getMe = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = await this.resolveTenantId(request)

        if (!tenantId) {
            return reply.code(400).send(ApiResponse.error('User does not belong to a tenant'))
        }

        try {
            const tenant = await this.tenantService.getTenantById(tenantId)
            if (!tenant) {
                return reply.code(404).send(ApiResponse.error('Tenant not found'))
            }
            return reply.send(ApiResponse.success(tenant))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    updateTenant = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string }
        const userTenantId = (request as any).user.tenantId
        const isSuperAdmin = (request as any).user.isSuperAdmin

        // Policy: Tenant users can only update their own tenant
        if (!isSuperAdmin && userTenantId !== id) {
            return reply.code(403).send(ApiResponse.error('Unauthorized to update this tenant'))
        }

        try {
            const data = request.body as any
            const tenant = await this.tenantService.updateTenant(id, data)
            return reply.send(ApiResponse.success(tenant, 'Tenant updated successfully'))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }
}
