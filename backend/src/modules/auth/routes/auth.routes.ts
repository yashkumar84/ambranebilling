import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { loginRequestSchema } from '../dtos/request/login.dto'
import { registerRequestSchema } from '../dtos/request/register.dto'
import { sendOtpSchema } from '../dtos/request/otp.dto'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function authRoutes(fastify: FastifyInstance) {
    const controller = new AuthController()

    // Send OTP
    fastify.post('/send-otp', {
        schema: {
            description: 'Send OTP to email',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' },
                },
            },
            response: {
                200: {
                    description: 'OTP sent successfully',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
            },
        },
        preValidation: async (request, reply) => {
            const result = sendOtpSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
        },
        handler: controller.sendOtp,
    })

    // Register
    fastify.post('/register', {
        schema: {
            description: 'Register a new user',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email', 'password', 'name', 'otpCode'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string', minLength: 2 },
                    phone: { type: 'string' },
                    role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'STAFF', 'WAITER'] },
                    otpCode: { type: 'string', minLength: 6, maxLength: 6 },
                },
            },
            response: {
                201: {
                    description: 'User registered successfully',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object', additionalProperties: true },
                        message: { type: 'string' },
                    },
                },
            },
        },
        preValidation: async (request, reply) => {
            // Validate with Zod
            const result = registerRequestSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.register,
    })

    // Login
    fastify.post('/login', {
        schema: {
            description: 'Login user',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                },
            },
            response: {
                200: {
                    description: 'Login successful',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object', additionalProperties: true },
                        message: { type: 'string' },
                    },
                },
            },
        },
        preValidation: async (request, reply) => {
            // Validate with Zod
            const result = loginRequestSchema.safeParse(request.body)
            if (!result.success) {
                return reply.code(400).send({
                    success: false,
                    error: 'Validation failed',
                    details: result.error.errors,
                })
            }
            request.body = result.data
        },
        handler: controller.login,
    })

    // Logout (protected route)
    fastify.post('/logout', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Logout user',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.logout,
    })

    // Get profile (protected route)
    fastify.get('/profile', {
        onRequest: [authMiddleware],
        schema: {
            description: 'Get user profile',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getProfile,
    })
}
