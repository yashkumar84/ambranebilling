import { prisma } from '@/config/database.config'
import { CreateTableDTO } from '../dtos/request/create-table.dto'
import { UpdateTableDTO } from '../dtos/request/update-table.dto'

export class TableRepository {
    async findAll(filters?: {
        tenantId?: string
        status?: string
        skip?: number
        take?: number
    }) {
        return prisma.table.findMany({
            where: {
                tenantId: filters?.tenantId,
                status: filters?.status as any,
            },
            skip: filters?.skip || 0,
            take: filters?.take || 50,
            orderBy: { number: 'asc' },
        })
    }

    async findById(id: string) {
        return prisma.table.findUnique({
            where: { id },
            include: {
                orders: {
                    where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        })
    }

    async create(data: CreateTableDTO & { tenantId: string }) {
        return prisma.table.create({
            data,
        })
    }

    async update(id: string, data: UpdateTableDTO) {
        return prisma.table.update({
            where: { id },
            data,
        })
    }

    async delete(id: string) {
        return prisma.table.delete({
            where: { id },
        })
    }

    async count(filters?: { tenantId?: string; status?: string }): Promise<number> {
        return prisma.table.count({
            where: {
                tenantId: filters?.tenantId,
                status: filters?.status as any,
            },
        })
    }

    async updateStatus(id: string, status: string) {
        return prisma.table.update({
            where: { id },
            data: { status: status as any },
        })
    }
}
