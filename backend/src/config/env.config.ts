import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3001'),
    HOST: z.string().default('0.0.0.0'),

    // Database
    DATABASE_URL: z.string(),

    // Redis
    REDIS_URL: z.string(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

    // Payment Gateways
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),

    // Third-party APIs
    ZOMATO_API_KEY: z.string().optional(),
    SWIGGY_API_KEY: z.string().optional(),

    // Notifications
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM_EMAIL: z.string().optional(),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
    RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),
})

export const config = envSchema.parse(process.env)

export type Config = z.infer<typeof envSchema>
