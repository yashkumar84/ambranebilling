import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CustomerService {
    async findAll(tenantId?: string, page: number = 1, limit: number = 20, search: string = '') {
        const skip = (page - 1) * limit
        const where: any = tenantId ? { tenantId } : {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.customer.count({ where }),
        ])

        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    async findById(id: string, tenantId?: string) {
        const whereClause = tenantId ? { id, tenantId } : { id }

        const customer = await prisma.customer.findFirst({
            where: whereClause,
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        })

        if (!customer) {
            throw new Error('Customer not found')
        }

        return customer
    }

    async create(data: any, tenantId?: string) {
        if (!tenantId) {
            throw new Error('Tenant ID is required to create a customer')
        }

        return await prisma.customer.create({
            data: {
                tenantId,
                name: data.name,
                phone: data.phone,
                email: data.email,
                address: data.address,
            },
        })
    }

    async update(id: string, data: any, tenantId?: string) {
        const whereClause = tenantId ? { id, tenantId } : { id }

        const customer = await prisma.customer.findFirst({
            where: whereClause,
        })

        if (!customer) {
            throw new Error('Customer not found')
        }

        return await prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                address: data.address,
            },
        })
    }

    async delete(id: string, tenantId?: string) {
        const whereClause = tenantId ? { id, tenantId } : { id }

        const customer = await prisma.customer.findFirst({
            where: whereClause,
        })

        if (!customer) {
            throw new Error('Customer not found')
        }

        await prisma.customer.delete({
            where: { id },
        })

        return { message: 'Customer deleted successfully' }
    }
}
