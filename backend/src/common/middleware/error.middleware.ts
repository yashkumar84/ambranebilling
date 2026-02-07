import { FastifyRequest, FastifyReply } from 'fastify'

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message)
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export async function errorHandler(
    error: Error | AppError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    request.log.error({
        err: error,
        url: request.url,
        method: request.method,
        user: (request as any).user, // Added user context for debugging 400s
    }, 'Error occurred')

    // Handle validation errors
    if (error.name === 'ZodError') {
        return reply.code(400).send({
            success: false,
            error: 'Validation failed',
            details: error,
        })
    }

    // Handle Fastify validation errors
    if ('validation' in error && error.validation) {
        return reply.code(400).send({
            success: false,
            error: 'Validation failed',
            details: error.validation,
        })
    }

    // Handle custom AppError
    if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
            success: false,
            error: error.message,
        })
    }

    // Handle Prisma errors
    if (error.constructor.name.includes('Prisma')) {
        return reply.code(500).send({
            success: false,
            error: 'Database error occurred',
        })
    }

    // Default error
    return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
    })
}
