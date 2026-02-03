import { z } from 'zod'

export const registerRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'WAITER']).optional(),
    otpCode: z.string().length(6, 'OTP must be 6 digits'),
})

export type RegisterRequestDTO = z.infer<typeof registerRequestSchema>
