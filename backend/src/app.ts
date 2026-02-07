import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import cookie from '@fastify/cookie'
import { config } from './config/env.config'
import { errorHandler } from './common/middleware/error.middleware'

// Import routes
import authRoutes from './modules/auth/routes/auth.routes'

const app = Fastify({
    logger: {
        level: config.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: config.NODE_ENV !== 'production' ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        } : undefined,
    },
    ajv: {
        customOptions: {
            removeAdditional: true,
            coerceTypes: true,
            useDefaults: true,
        },
    },
})

// Register plugins
app.register(cookie, {
    secret: config.JWT_SECRET, // using JWT secret for cookie signing
    parseOptions: {}
})

app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
})

app.register(helmet, {
    contentSecurityPolicy: false,
})

app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW,
})

// Swagger documentation
app.register(swagger, {
    openapi: {
        info: {
            title: 'Ambrane Billing API',
            description: 'Restaurant billing system API documentation',
            version: '1.0.0',
        },
        servers: [
            {
                url: `http://${config.HOST}:${config.PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
})

app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
    },
})

// Health check
app.get('/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }
})

// Register routes
app.register(authRoutes, { prefix: '/api/auth' })

// Super Admin routes
import superAdminRoutes from './modules/super-admin/routes/super-admin.routes'
app.register(superAdminRoutes, { prefix: '/api/super-admin' })

// Import table routes
import tableRoutes from './modules/tables/routes/table.routes'
app.register(tableRoutes, { prefix: '/api/tables' })

// Import order routes
import orderRoutes from './modules/orders/routes/order.routes'
app.register(orderRoutes, { prefix: '/api/orders' })

// Import payment routes
import paymentRoutes from './modules/payments/routes/payment.routes'
app.register(paymentRoutes, { prefix: '/api/payments' })

// Import permission routes
import permissionRoutes from './modules/permissions/routes/permission.routes'
app.register(permissionRoutes, { prefix: '/api/permissions' })

// Import user routes
import usersRoutes from './modules/users/routes/users.routes'
app.register(usersRoutes, { prefix: '/api/users' })

// Import customer routes
import customerRoutes from './modules/customers/routes/customer.routes'
app.register(customerRoutes, { prefix: '/api/customers' })

// Import role routes
import roleRoutes from './modules/roles/routes/role.routes'
app.register(roleRoutes, { prefix: '/api/roles' })

// Import product/menu routes
import productRoutes from './modules/products/routes/product.routes'
app.register(productRoutes, { prefix: '/api/menu' })

// Import public routes (QR ordering)
import publicRoutes from './modules/products/routes/public.routes'
app.register(publicRoutes, { prefix: '/api/public' })

// Import tenants routes (Onboarding)
import tenantsRoutes from './modules/tenants/routes/tenants.routes'
app.register(tenantsRoutes, { prefix: '/api/tenants' })

// Import subscription routes
import subscriptionRoutes from './modules/subscriptions/routes/subscription.routes'
app.register(subscriptionRoutes, { prefix: '/api/subscriptions' })

// Import analytics routes
import analyticsRoutes from './modules/analytics/routes/analytics.routes'
app.register(analyticsRoutes, { prefix: '/api/analytics' })

// Import marketing routes
import marketingRoutes from './modules/marketing/routes/offer.routes'
app.register(marketingRoutes, { prefix: '/api/marketing' })

// Error handler
app.setErrorHandler(errorHandler)

export { app }
