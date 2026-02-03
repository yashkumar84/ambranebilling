import { FastifyRequest, FastifyReply } from 'fastify'
import { config } from '@/config/env.config'
import { AppError } from './error.middleware'

const jwt = require('jsonwebtoken')

export interface JWTPayload {
    userId: string // UUID instead of number
    email: string
    tenantId?: string // Null for Super Admins
    isSuperAdmin: boolean
    roleId?: string
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: JWTPayload
    }
}

export async function authMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply
) {
    try {
        let token: string | null = request.headers.authorization?.startsWith('Bearer ')
            ? request.headers.authorization.substring(7)
            : null

        if (!token && request.cookies) {
            token = request.cookies.accessToken || null
        }

        if (!token) {
            throw new AppError(401, 'No token provided')
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload

        request.user = decoded
    } catch (error: any) {
        console.error('Auth Middleware Error:', error.message)
        if (error.name === 'JsonWebTokenError') {
            throw new AppError(401, `Invalid token: ${error.message}`)
        }
        if (error.name === 'TokenExpiredError') {
            throw new AppError(401, `Token expired at ${error.expiredAt}`)
        }
        throw new AppError(401, `Auth failed: ${error.message}`)
    }
}

/**
 * Require Super Admin
 * Use this for platform-level admin routes
 */
export function requireSuperAdmin() {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
        if (!request.user) {
            throw new AppError(401, 'Unauthorized')
        }

        if (!request.user.isSuperAdmin) {
            throw new AppError(403, 'Super Admin access required')
        }
    }
}
