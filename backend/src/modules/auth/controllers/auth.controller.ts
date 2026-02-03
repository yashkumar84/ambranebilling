import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { LoginRequestDTO } from '../dtos/request/login.dto'
import { RegisterRequestDTO } from '../dtos/request/register.dto'
import { SendOtpDTO } from '../dtos/request/otp.dto'
import { ApiResponse } from '@/common/dtos/response.dto'

export class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
    }

    /**
     * Send OTP to email
     * POST /api/auth/send-otp
     */
    sendOtp = async (
        request: FastifyRequest<{ Body: SendOtpDTO }>,
        reply: FastifyReply
    ) => {
        await this.authService.sendOtp(request.body.email)
        return reply.send(ApiResponse.success(null, 'OTP sent successfully'))
    }

    /**
     * Register new user
     * POST /api/auth/register
     */
    register = async (
        request: FastifyRequest<{ Body: RegisterRequestDTO }>,
        reply: FastifyReply
    ) => {
        const result = await this.authService.register(request.body)

        this.setAuthCookies(reply, result.accessToken, result.refreshToken)

        return reply.code(201).send(ApiResponse.success(result.user, 'User registered successfully'))
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    login = async (
        request: FastifyRequest<{ Body: LoginRequestDTO }>,
        reply: FastifyReply
    ) => {
        const result = await this.authService.login(request.body)

        console.log('🔍 Login result:', result)
        console.log('👤 User from service:', result.user)
        console.log('🔐 isSuperAdmin:', result.user.isSuperAdmin)

        this.setAuthCookies(reply, result.accessToken, result.refreshToken)

        // Ensure user object is properly serialized
        const userResponse = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            phone: result.user.phone || null,
            tenantId: result.user.tenantId || null,
            isSuperAdmin: result.user.isSuperAdmin,
            roleId: result.user.roleId || null,
            roleName: result.user.roleName || null,
            isActive: result.user.isActive,
            createdAt: result.user.createdAt,
        }

        console.log('📤 Sending user response:', userResponse)

        return reply.send(ApiResponse.success(userResponse, 'Login successful'))
    }

    /**
     * Logout user
     * POST /api/auth/logout
     */
    logout = async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        if (request.user) {
            await this.authService.logout(request.user.userId) // userId is now string (UUID)
        }

        reply.clearCookie('accessToken', { path: '/' })
        reply.clearCookie('refreshToken', { path: '/' })

        return reply.send(ApiResponse.success(null, 'Logout successful'))
    }

    private setAuthCookies(reply: FastifyReply, accessToken: string, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === 'production'

        reply.setCookie('accessToken', accessToken, {
            path: '/',
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        reply.setCookie('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        })
    }

    /**
     * Get user profile
     * GET /api/auth/profile
     */
    getProfile = async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        if (!request.user) {
            return reply.code(401).send(ApiResponse.error('Unauthorized'))
        }

        const result = await this.authService.getProfile(request.user.userId) // userId is now string (UUID)
        return reply.send(ApiResponse.success(result))
    }
}
