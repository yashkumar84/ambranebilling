import { PrismaClient } from '@prisma/client'

export class TenantService {
    private prisma: PrismaClient

    constructor() {
        this.prisma = new PrismaClient()
    }

    createTenant = async (data: any, ownerId: string) => {
        const { businessName, businessType, subdomain, gstNumber, address, phone, email } = data

        return await this.prisma.$transaction(async (tx) => {
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

            // 2. Create Default Settings
            await tx.tenantSettings.create({
                data: {
                    tenantId: tenant.id
                }
            })

            // 3. Create Subscription (14-day trial for the chosen plan)
            let plan = await tx.subscriptionPlan.findFirst({
                where: { name: { contains: data.planId || 'Starter', mode: 'insensitive' } }
            })

            // Fallback to first available plan if specific one not found
            if (!plan) {
                plan = await tx.subscriptionPlan.findFirst({
                    where: { isActive: true }
                })
            }

            const endDate = new Date()
            endDate.setDate(endDate.getDate() + 7)

            await tx.tenantSubscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: plan?.id || '',
                    status: 'TRIAL',
                    startDate: new Date(),
                    endDate: endDate
                }
            })

            // 4. Update User with tenantId and Role
            const ownerRole = await tx.role.findFirst({
                where: { tenantId: null, name: 'TENANT_OWNER' }
            })

            const updatedUser = await tx.user.update({
                where: { id: ownerId },
                data: {
                    tenantId: tenant.id,
                    roleId: ownerRole?.id
                }
            })

            return { tenant, user: updatedUser }
        })
    }

    getTenantById = async (id: string) => {
        return await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                settings: true,
                subscription: {
                    include: { plan: true }
                }
            }
        })
    }

    getTenantByOwnerId = async (ownerId: string) => {
        const user = await this.prisma.user.findUnique({
            where: { id: ownerId },
            select: { tenantId: true }
        })
        if (!user?.tenantId) return null
        return this.getTenantById(user.tenantId)
    }

    updateTenant = async (id: string, data: any) => {
        return await this.prisma.tenant.update({
            where: { id },
            data: {
                businessName: data.businessName,
                businessType: data.businessType,
                address: data.address,
                phone: data.phone,
                email: data.email,
                gstNumber: data.gstNumber,
            }
        })
    }
}
