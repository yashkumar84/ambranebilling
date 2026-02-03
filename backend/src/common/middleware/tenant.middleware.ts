import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend FastifyRequest to include tenant context
declare module 'fastify' {
    interface FastifyRequest {
        tenantId?: string
    }
}

/**
 * Tenant Isolation Middleware
 * 
 * Automatically extracts tenant_id from authenticated user and adds it to request context.
 * Super Admins can optionally switch tenants via X-Tenant-Id header.
 */
export async function tenantIsolationMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Skip for unauthenticated routes
    if (!request.user) {
        return
    }

    // Super Admins can access any tenant
    if (request.user.isSuperAdmin) {
        // Allow tenant switching via header
        const targetTenant = request.headers['x-tenant-id'] as string
        if (targetTenant) {
            request.tenantId = targetTenant
            request.log.info({ tenantId: targetTenant }, 'Super Admin accessing tenant')
        }
        return
    }

    // Regular users are locked to their tenant
    if (!request.user.tenantId) {
        return reply.code(403).send({
            error: 'Forbidden',
            message: 'User does not belong to any tenant',
        })
    }

    request.tenantId = request.user.tenantId
}

/**
 * Subscription Check Middleware
 * 
 * Validates that the tenant has an active subscription.
 * Enforces grace period and hard blocks on expiry.
 */
export async function subscriptionCheckMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Skip for Super Admins
    if (request.user?.isSuperAdmin) {
        return
    }

    // Skip if no tenant context
    if (!request.tenantId) {
        return
    }

    // Fetch active subscription
    const subscription = await prisma.tenantSubscription.findUnique({
        where: { tenantId: request.tenantId },
        include: { plan: true },
    })

    if (!subscription) {
        return reply.code(402).send({
            error: 'Payment Required',
            message: 'No active subscription found. Please subscribe to a plan.',
        })
    }

    // Check subscription status
    if (subscription.status === 'EXPIRED') {
        return reply.code(402).send({
            error: 'Subscription Expired',
            message: 'Your subscription has expired. Please renew to continue.',
        })
    }

    if (subscription.status === 'CANCELLED') {
        return reply.code(402).send({
            error: 'Subscription Cancelled',
            message: 'Your subscription has been cancelled.',
        })
    }

    // Grace period warning
    if (subscription.status === 'GRACE_PERIOD') {
        const daysLeft = Math.ceil(
            (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        reply.header('X-Subscription-Warning', `Expires in ${daysLeft} days`)
    }

    // Attach subscription to request for feature checks
    request.subscription = subscription
}

/**
 * Feature Gate Middleware Factory
 * 
 * Creates middleware that checks if a feature is enabled in the subscription plan.
 */
export function requireFeature(featureName: string) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Skip for Super Admins
        if (request.user?.isSuperAdmin) {
            return
        }

        const subscription = request.subscription
        if (!subscription) {
            return reply.code(402).send({
                error: 'Payment Required',
                message: 'No active subscription found.',
            })
        }

        const features = subscription.plan.features as Record<string, boolean>
        if (!features[featureName]) {
            return reply.code(403).send({
                error: 'Feature Not Available',
                message: `Feature '${featureName}' is not available in your plan. Please upgrade.`,
                upgradeUrl: '/upgrade',
            })
        }
    }
}

/**
 * Permission Check Middleware Factory
 * 
 * Creates middleware that checks if the user has a specific permission.
 */
export function requirePermission(resource: string, action: string) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Skip for Super Admins (they have all permissions)
        if (request.user?.isSuperAdmin) {
            return
        }

        if (!request.user?.roleId) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'User has no role assigned.',
            })
        }

        // Fetch user's role with permissions
        const role = await prisma.role.findUnique({
            where: { id: request.user.roleId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        })

        if (!role) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'User role not found.',
            })
        }

        // Check if permission exists
        const hasPermission = role.permissions.some(
            (rp) => rp.permission.resource === resource && rp.permission.action === action
        )

        if (!hasPermission) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: `Missing permission: ${resource}:${action}`,
            })
        }
    }
}

/**
 * Usage Limit Check Middleware
 * 
 * Checks if tenant has exceeded their plan limits (users, products, bills).
 */
export async function checkUsageLimits(
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Skip for Super Admins
    if (request.user?.isSuperAdmin) {
        return
    }

    if (!request.tenantId || !request.subscription) {
        return
    }

    const plan = request.subscription.plan

    // Check user limit (for POST /users)
    if (request.method === 'POST' && request.url.includes('/users')) {
        const userCount = await prisma.user.count({
            where: { tenantId: request.tenantId },
        })

        if (userCount >= plan.maxUsers) {
            return reply.code(403).send({
                error: 'Limit Exceeded',
                message: `You have reached the maximum number of users (${plan.maxUsers}) for your plan.`,
                upgradeUrl: '/upgrade',
            })
        }
    }

    // Check product limit (for POST /products)
    if (request.method === 'POST' && request.url.includes('/products')) {
        const productCount = await prisma.product.count({
            where: { tenantId: request.tenantId },
        })

        if (productCount >= plan.maxProducts) {
            return reply.code(403).send({
                error: 'Limit Exceeded',
                message: `You have reached the maximum number of products (${plan.maxProducts}) for your plan.`,
                upgradeUrl: '/upgrade',
            })
        }
    }

    // Check monthly bill limit (for POST /orders)
    if (request.method === 'POST' && request.url.includes('/orders')) {
        if (plan.maxBillsPerMonth) {
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const billCount = await prisma.order.count({
                where: {
                    tenantId: request.tenantId,
                    createdAt: { gte: startOfMonth },
                },
            })

            if (billCount >= plan.maxBillsPerMonth) {
                return reply.code(403).send({
                    error: 'Limit Exceeded',
                    message: `You have reached the maximum number of bills (${plan.maxBillsPerMonth}) for this month.`,
                    upgradeUrl: '/upgrade',
                })
            }
        }
    }
}

// Extend FastifyRequest to include subscription
declare module 'fastify' {
    interface FastifyRequest {
        subscription?: {
            id: string
            status: string
            endDate: Date
            plan: {
                id: string
                name: string
                features: any
                maxUsers: number
                maxProducts: number
                maxBillsPerMonth: number | null
            }
        }
    }
}
