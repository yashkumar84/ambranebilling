import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ProductService {
    async findAll(tenantId: string, page: number = 1, limit: number = 20, search: string = '') {
        const skip = (page - 1) * limit
        const where: any = { tenantId }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    variants: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ])

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    async findById(id: string, tenantId: string) {
        const product = await prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                variants: true,
            },
        })

        if (!product) {
            throw new Error('Product not found')
        }

        return product
    }

    async create(data: any, tenantId: string) {
        return await prisma.product.create({
            data: {
                tenantId,
                name: data.name,
                sku: data.sku,
                description: data.description,
                category: data.category,
                sellingPrice: data.price || data.sellingPrice,
                currentStock: data.stock || 0,
                baseUnit: data.unit || 'PCS',
                isActive: data.isActive ?? true,
            },
        })
    }
    async update(id: string, data: any, tenantId: string) {
        const product = await prisma.product.findFirst({
            where: { id, tenantId },
        })

        if (!product) {
            throw new Error('Product not found')
        }

        return await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                sku: data.sku,
                description: data.description,
                category: data.category,
                sellingPrice: data.price || data.sellingPrice,
                currentStock: data.stock || data.currentStock,
                baseUnit: data.unit || data.baseUnit,
                isActive: data.isActive,
            },
        })
    }

    async delete(id: string, tenantId: string) {
        const product = await prisma.product.findFirst({
            where: { id, tenantId },
        })

        if (!product) {
            throw new Error('Product not found')
        }

        await prisma.product.delete({
            where: { id },
        })

        return { message: 'Product deleted successfully' }
    }
}
