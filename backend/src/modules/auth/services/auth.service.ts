import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { LoginRequestDTO } from '../dtos/request/login.dto'
import { RegisterRequestDTO } from '../dtos/request/register.dto'
import { AuthResponseDTO, UserResponseDTO } from '../dtos/response/auth.response.dto'
import { AppError } from '@/common/middleware/error.middleware'
import { config } from '@/config/env.config'
import { redis } from '@/config/redis.config'

const jwt = require('jsonwebtoken')
const prisma = new PrismaClient()

// Memory fallback for OTPs when Redis is down in dev
const otpMemoryStore = new Map<string, string>()

export class AuthService {
    /**
     * Send OTP to email
     */
    async sendOtp(email: string): Promise<void> {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        try {
            // Store in Redis with 10-minute expiry
            const ttl = 10 * 60 // 10 minutes in seconds
            await redis.setex(`otp:${email}`, ttl, otp)

            console.log('------------------------------------------')
            console.log(`[REDIS] OTP for ${email}: ${otp}`)
            console.log('------------------------------------------')
        } catch (redisError) {
            console.warn('⚠️ Redis not available, using memory store fallback')
            otpMemoryStore.set(email, otp)

            // Auto-clear after 10 mins
            setTimeout(() => otpMemoryStore.delete(email), 10 * 60 * 1000)

            console.log('------------------------------------------')
            console.log(`[MEMORY] OTP for ${email}: ${otp}`)
            console.log('------------------------------------------')
        }

        // In production: Integration with SendGrid/SES would go here
    }

    async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
        // 1. Verify OTP
        let storedOtp: string | null = null
        try {
            storedOtp = await redis.get(`otp:${data.email}`)
        } catch (e) {
            console.warn('⚠️ Redis unreachable, checking memory store')
            storedOtp = otpMemoryStore.get(data.email) || null
        }

        if (!storedOtp || storedOtp !== data.otpCode) {
            throw new AppError(400, 'Invalid or expired Secure Access Key')
        }

        // 2. Clear OTP
        try {
            await redis.del(`otp:${data.email}`)
        } catch (e) {
            otpMemoryStore.delete(data.email)
        }

        // 3. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            throw new AppError(400, 'User with this email already exists')
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // 5. Create user (tenantId is null for new signups)
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                isActive: true,
                isSuperAdmin: false,
            }
        })

        // 6. Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(
            user.id,
            user.email,
            undefined,
            false,
            undefined
        )

        // 7. Store refresh token
        await this.storeRefreshToken(user.id, refreshToken)

        const userDTO: UserResponseDTO = {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || undefined,
            isSuperAdmin: false,
            isActive: true,
            createdAt: user.createdAt.toISOString(),
        }

        return new AuthResponseDTO(accessToken, refreshToken, userDTO)
    }

    /**
     * Login user
     */
    async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
        console.log('Login attempt for:', data.email)

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
                tenant: {
                    include: {
                        subscription: {
                            include: { plan: true },
                        },
                    },
                },
            },
        })

        console.log('User found in DB:', !!user)

        if (!user) {
            throw new AppError(401, 'Invalid credentials')
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError(403, 'Account is deactivated')
        }

        // Check if tenant is active (skip for Super Admins)
        if (!user.isSuperAdmin && user.tenant && !user.tenant.isActive) {
            throw new AppError(403, 'Your store has been deactivated. Please contact support.')
        }

        // Check subscription status (skip for Super Admins)
        if (!user.isSuperAdmin && user.tenant?.subscription) {
            const subscription = user.tenant.subscription
            if (subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') {
                throw new AppError(
                    402,
                    'Your subscription has expired. Please renew to continue.'
                )
            }
        }

        // Verify password
        console.log('Verifying password...')
        const isPasswordValid = await bcrypt.compare(data.password, user.password)
        console.log('Password valid:', isPasswordValid)

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials')
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        })

        // Generate tokens
        console.log('Generating tokens...')
        try {
            const { accessToken, refreshToken } = this.generateTokens(
                user.id,
                user.email,
                user.tenantId || undefined,
                user.isSuperAdmin,
                user.roleId || undefined
            )
            console.log('Tokens generated successfully')

            // Store refresh token in Redis
            console.log('Storing token in Redis...')
            await this.storeRefreshToken(user.id, refreshToken)
            console.log('Token stored in Redis')

            // Map to response DTO
            const userDTO: UserResponseDTO = {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone || undefined,
                tenantId: user.tenantId || undefined,
                isSuperAdmin: user.isSuperAdmin,
                roleId: user.roleId || undefined,
                roleName: user.role?.name,
                permissions: this.extractPermissions(user),
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
            }

            return new AuthResponseDTO(accessToken, refreshToken, userDTO)
        } catch (error: any) {
            console.error('Error during token generation or storage:', error)
            throw error
        }
    }

    /**
     * Logout user
     */
    async logout(userId: string): Promise<void> {
        // Remove refresh token from Redis
        await redis.del(`refresh_token:${userId}`)
    }

    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<UserResponseDTO> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
                tenant: {
                    include: {
                        subscription: {
                            include: { plan: true },
                        },
                    },
                },
            },
        })

        if (!user) {
            throw new AppError(404, 'User not found')
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || undefined,
            tenantId: user.tenantId || undefined,
            isSuperAdmin: user.isSuperAdmin,
            roleId: user.roleId || undefined,
            roleName: user.role?.name,
            permissions: this.extractPermissions(user),
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            tenant: user.tenant
                ? {
                    id: user.tenant.id,
                    businessName: user.tenant.businessName,
                    subscription: user.tenant.subscription
                        ? {
                            status: user.tenant.subscription.status,
                            planName: user.tenant.subscription.plan.name,
                            endDate: user.tenant.subscription.endDate.toISOString(),
                        }
                        : undefined,
                }
                : undefined,
        }
    }

    /**
     * Generate JWT tokens
     */
    private generateTokens(
        userId: string,
        email: string,
        tenantId?: string,
        isSuperAdmin: boolean = false,
        roleId?: string
    ) {
        const payload = {
            userId,
            email,
            tenantId,
            isSuperAdmin,
            roleId,
        }

        const accessToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN,
        })

        const refreshToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_REFRESH_EXPIRES_IN,
        })

        return { accessToken, refreshToken }
    }

    /**
     * Store refresh token in Redis
     */
    private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const key = `refresh_token:${userId}`
        const ttl = 30 * 24 * 60 * 60 // 30 days in seconds
        try {
            await redis.setex(key, ttl, refreshToken)
        } catch (error) {
            console.warn('⚠️ Failed to store refresh token in Redis, proceeding without persistence:', error)
        }
    }

    /**
     * Refresh user tokens with updated tenant context
     * Used after tenant creation to update JWT payload
     */
    async refreshUserTokens(userId: string, email: string, tenantId: string, roleId?: string) {
        const tokens = this.generateTokens(userId, email, tenantId, false, roleId)
        await this.storeRefreshToken(userId, tokens.refreshToken)
        return tokens
    }

    private extractPermissions(user: any): string[] {
        if (user.isSuperAdmin) {
            return ['*:*']
        }
        if (!user.role || !user.role.permissions) {
            return []
        }
        return user.role.permissions.map((rp: any) => `${rp.permission.resource}:${rp.permission.action}`)
    }
}
