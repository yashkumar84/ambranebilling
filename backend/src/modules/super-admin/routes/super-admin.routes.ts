import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, requireSuperAdmin } from '@/common/middleware/auth.middleware'

const prisma = new PrismaClient()

export default async function superAdminRoutes(fastify: FastifyInstance) {
    // All routes require authentication and Super Admin role
    fastify.addHook('onRequest', authMiddleware)
    fastify.addHook('onRequest', requireSuperAdmin())

    // ============================================
    // TENANT MANAGEMENT
    // ============================================

    /**
     * Create New Tenant (Store)
     * POST /api/super-admin/tenants
     */
    fastify.post('/tenants', async (request, reply) => {
        const {
            businessName,
            businessType,
            subdomain,
            gstNumber,
            address,
            phone,
            email,
            planId,
            ownerName,
            ownerEmail,
            ownerPassword,
        } = request.body as any

        try {
            // Create tenant with subscription and owner user in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // 1. Create tenant
                const tenant = await tx.tenant.create({
                    data: {
                        businessName,
                        businessType,
                        subdomain,
                        gstNumber,
                        address,
                        phone,
                        email,
                        isActive: true,
                    },
                })

                // 2. Create tenant settings with defaults
                await tx.tenantSettings.create({
                    data: {
                        tenantId: tenant.id,
                    },
                })

                // 3. Create subscription (14-day trial)
                const plan = await tx.subscriptionPlan.findUnique({
                    where: { id: planId },
                })

                if (!plan) {
                    throw new Error('Invalid plan ID')
                }

                const startDate = new Date()
                const endDate = new Date()
                endDate.setDate(endDate.getDate() + 14) // 14-day trial

                await tx.tenantSubscription.create({
                    data: {
                        tenantId: tenant.id,
                        planId: plan.id,
                        status: 'TRIAL',
                        startDate,
                        endDate,
                        autoRenew: true,
                    },
                })

                // 4. Create owner role for this tenant
                const ownerRole = await tx.role.create({
                    data: {
                        tenantId: tenant.id,
                        name: 'Owner',
                        description: 'Store owner with full access',
                        isSystemRole: false,
                    },
                })

                // 5. Assign all permissions to owner role
                const allPermissions = await tx.permission.findMany({
                    where: { isSystem: true },
                })

                await tx.rolePermission.createMany({
                    data: allPermissions.map((perm) => ({
                        roleId: ownerRole.id,
                        permissionId: perm.id,
                    })),
                })

                // 6. Create owner user
                const bcrypt = require('bcryptjs')
                const hashedPassword = await bcrypt.hash(ownerPassword, 10)

                const owner = await tx.user.create({
                    data: {
                        tenantId: tenant.id,
                        email: ownerEmail,
                        password: hashedPassword,
                        name: ownerName,
                        roleId: ownerRole.id,
                        isSuperAdmin: false,
                        isActive: true,
                    },
                })

                return { tenant, owner }
            })

            return reply.code(201).send({
                message: 'Tenant created successfully',
                tenant: result.tenant,
                owner: {
                    id: result.owner.id,
                    email: result.owner.email,
                    name: result.owner.name,
                },
            })
        } catch (error: any) {
            request.log.error(error)
            return reply.code(500).send({
                error: 'Failed to create tenant',
                message: error.message,
            })
        }
    })

    /**
     * List All Tenants
     * GET /api/super-admin/tenants
     */
    fastify.get('/tenants', async (request, reply) => {
        const { page = 1, limit = 20, search = '' } = request.query as any

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const skip = (pageNum - 1) * limitNum

        const [tenants, total] = await Promise.all([
            prisma.tenant.findMany({
                where: {
                    OR: [
                        { businessName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                    ],
                },
                include: {
                    subscription: {
                        include: { plan: true },
                    },
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            orders: true,
                        },
                    },
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.tenant.count({
                where: {
                    OR: [
                        { businessName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                    ],
                },
            }),
        ])

        return reply.send({
            tenants,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        })
    })

    /**
     * Get Tenant Details
     * GET /api/super-admin/tenants/:id
     */
    fastify.get('/tenants/:id', async (request, reply) => {
        const { id } = request.params as { id: string }

        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                subscription: {
                    include: { plan: true },
                },
                settings: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        orders: true,
                        customers: true,
                    },
                },
            },
        })

        if (!tenant) {
            return reply.code(404).send({ error: 'Tenant not found' })
        }

        return reply.send(tenant)
    })

    /**
     * Activate Tenant
     * PUT /api/super-admin/tenants/:id/activate
     */
    fastify.put('/tenants/:id/activate', async (request, reply) => {
        const { id } = request.params as { id: string }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: { isActive: true },
        })

        return reply.send({
            message: 'Tenant activated successfully',
            tenant,
        })
    })

    /**
     * Deactivate Tenant
     * PUT /api/super-admin/tenants/:id/deactivate
     */
    fastify.put('/tenants/:id/deactivate', async (request, reply) => {
        const { id } = request.params as { id: string }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: { isActive: false },
        })

        return reply.send({
            message: 'Tenant deactivated successfully',
            tenant,
        })
    })

    /**
     * Delete Tenant
     * DELETE /api/super-admin/tenants/:id
     */
    fastify.delete('/tenants/:id', async (request, reply) => {
        const { id } = request.params as { id: string }

        await prisma.tenant.delete({
            where: { id },
        })

        return reply.send({
            message: 'Tenant deleted successfully',
        })
    })

    // ============================================
    // TENANT STAFF & PRODUCT MANAGEMENT (Admin Support)
    // ============================================

    /**
     * List Tenant Staff
     * GET /api/super-admin/tenants/:id/staff
     */
    fastify.get('/tenants/:id/staff', async (request, reply) => {
        const { id } = request.params as { id: string }
        const staff = await prisma.user.findMany({
            where: { tenantId: id },
            include: { role: true },
        })
        return reply.send(staff)
    })

    /**
     * Add Tenant Staff
     * POST /api/super-admin/tenants/:id/staff
     */
    fastify.post('/tenants/:id/staff', async (request, reply) => {
        const { id } = request.params as { id: string }
        const { name, email, password, roleId } = request.body as any
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                tenantId: id,
                name,
                email,
                password: hashedPassword,
                roleId,
                isSuperAdmin: false,
            },
        })
        return reply.code(201).send(user)
    })

    /**
     * List Tenant Products
     * GET /api/super-admin/tenants/:id/products
     */
    fastify.get('/tenants/:id/products', async (request, reply) => {
        const { id } = request.params as { id: string }
        const products = await prisma.product.findMany({
            where: { tenantId: id },
        })
        return reply.send(products)
    })

    /**
     * Add Tenant Product
     * POST /api/super-admin/tenants/:id/products
     */
    fastify.post('/tenants/:id/products', async (request, reply) => {
        const { id } = request.params as { id: string }
        const data = request.body as any
        const product = await prisma.product.create({
            data: {
                ...data,
                tenantId: id,
            },
        })
        return reply.code(201).send(product)
    })

    // ============================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================

    /**
     * List All Subscriptions
     * GET /api/super-admin/subscriptions
     */
    fastify.get('/subscriptions', async (request, reply) => {
        const { status } = request.query as { status?: string }

        const subscriptions = await prisma.tenantSubscription.findMany({
            where: status ? { status: status as any } : undefined,
            include: {
                tenant: {
                    select: {
                        id: true,
                        businessName: true,
                        email: true,
                        _count: {
                            select: {
                                users: true,
                                products: true,
                                orders: true,
                            },
                        },
                    },
                },
                plan: true,
            },
            orderBy: { endDate: 'asc' },
        })

        return reply.send(subscriptions)
    })

    /**
     * Update Subscription
     * PUT /api/super-admin/subscriptions/:id
     */
    fastify.put('/subscriptions/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const { planId, status, endDate } = request.body as any

        const subscription = await prisma.tenantSubscription.update({
            where: { id },
            data: {
                ...(planId && { planId }),
                ...(status && { status }),
                ...(endDate && { endDate: new Date(endDate) }),
            },
            include: { plan: true, tenant: true },
        })

        return reply.send({
            message: 'Subscription updated successfully',
            subscription,
        })
    })

    fastify.get('/plans', async (_request, reply) => {
        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { priceMonthly: 'asc' },
        })

        return reply.send(plans)
    })

    /**
     * Create Subscription Plan
     * POST /api/super-admin/plans
     */
    fastify.post('/plans', async (request, reply) => {
        const data = request.body as any
        const plan = await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                priceMonthly: data.priceMonthly,
                priceYearly: data.priceYearly,
                maxUsers: data.maxUsers,
                maxProducts: data.maxProducts,
                maxBillsPerMonth: data.maxBillsPerMonth,
                features: data.features || {},
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        })
        return reply.code(201).send(plan)
    })

    /**
     * Update Subscription Plan
     * PUT /api/super-admin/plans/:id
     */
    fastify.put('/plans/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const data = request.body as any
        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.priceMonthly !== undefined && { priceMonthly: data.priceMonthly }),
                ...(data.priceYearly !== undefined && { priceYearly: data.priceYearly }),
                ...(data.maxUsers !== undefined && { maxUsers: data.maxUsers }),
                ...(data.maxProducts !== undefined && { maxProducts: data.maxProducts }),
                ...(data.maxBillsPerMonth !== undefined && { maxBillsPerMonth: data.maxBillsPerMonth }),
                ...(data.features && { features: data.features }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        })
        return reply.send(plan)
    })

    /**
     * Delete Subscription Plan
     * DELETE /api/super-admin/plans/:id
     */
    fastify.delete('/plans/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        await prisma.subscriptionPlan.delete({
            where: { id },
        })
        return reply.send({ message: 'Plan deleted successfully' })
    })

    /**
     * Platform Analytics
     * GET /api/super-admin/analytics
     */
    fastify.get('/analytics', async (_request, reply) => {
        const [
            totalTenants,
            activeTenants,
            totalUsers,
            totalOrders,
            subscriptionsByPlan,
            revenueByPlan,
        ] = await Promise.all([
            prisma.tenant.count(),
            prisma.tenant.count({ where: { isActive: true } }),
            prisma.user.count({ where: { isSuperAdmin: false } }),
            prisma.order.count(),
            prisma.tenantSubscription.groupBy({
                by: ['planId'],
                _count: true,
            }),
            prisma.subscriptionPlan.findMany({
                include: {
                    _count: {
                        select: { subscriptions: true },
                    },
                },
            }),
        ])

        // Calculate MRR (Monthly Recurring Revenue)
        const activeSubscriptions = await prisma.tenantSubscription.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true },
        })

        const mrr = activeSubscriptions.reduce((sum, sub) => {
            return sum + Number(sub.plan.priceMonthly)
        }, 0)

        return reply.send({
            totalTenants,
            activeTenants,
            totalUsers,
            totalOrders,
            mrr,
            subscriptionsByPlan,
            revenueByPlan: revenueByPlan.map((plan) => ({
                planName: plan.name,
                subscribers: plan._count.subscriptions,
                monthlyRevenue: Number(plan.priceMonthly) * plan._count.subscriptions,
            })),
        })
    })
}
