import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TenantService {
    async createTenant(data: any, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    businessName: data.businessName,
                    businessType: data.businessType,
                    address: data.address,
                    phone: data.phone,
                    gstNumber: data.gstNumber,
                    email: data.businessEmail || null,
                    currency: data.currency || 'INR',
                    timezone: data.timezone || 'Asia/Kolkata',
                    logoUrl: data.logoUrl || null,
                    isActive: false, // Inactive until payment is verified
                }
            })

            // 2. Create Default Settings
            await tx.tenantSettings.create({
                data: {
                    tenantId: tenant.id
                }
            })

            // 3. Create Subscription (14-day trial for the chosen plan)
            const plan = await tx.subscriptionPlan.findFirst({
                where: { name: { contains: data.planId, mode: 'insensitive' } }
            })

            const endDate = new Date()
            endDate.setDate(endDate.getDate() + 14)

            await tx.tenantSubscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: plan?.id || (await tx.subscriptionPlan.findFirst())?.id || '',
                    status: 'TRIAL', // Trial status with isActive: false until payment
                    startDate: new Date(),
                    endDate: endDate
                }
            })

            // 4. Update User with tenantId and Role
            // Get the TENANT_OWNER role id (seeded)
            const ownerRole = await tx.role.findFirst({
                where: { tenantId: null, name: 'TENANT_OWNER' }
            })

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    tenantId: tenant.id,
                    roleId: ownerRole?.id
                }
            })

            return { tenant, user: updatedUser }
        })
    }
}
