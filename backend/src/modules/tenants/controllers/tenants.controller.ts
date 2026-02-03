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

    createTenant = async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = (request as any).user.userId
        const userEmail = (request as any).user.email
        const userTenantId = (request as any).user.tenantId

        if (userTenantId) {
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
}
