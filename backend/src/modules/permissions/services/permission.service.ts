import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PermissionService {
    async getAllPermissions() {
        return await prisma.permission.findMany({
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        })
    }

    async getPermissionById(id: string) {
        const permission = await prisma.permission.findUnique({
            where: { id },
        })

        if (!permission) {
            throw new Error('Permission not found')
        }

        return permission
    }

    async createPermission(data: { resource: string; action: string; description?: string }) {
        return await prisma.permission.create({
            data: {
                resource: data.resource,
                action: data.action,
                description: data.description,
                isSystem: false,
            },
        })
    }

    async updatePermission(id: string, data: { description?: string }) {
        const permission = await prisma.permission.findUnique({
            where: { id },
        })

        if (!permission) {
            throw new Error('Permission not found')
        }

        return await prisma.permission.update({
            where: { id },
            data: {
                description: data.description,
            },
        })
    }

    async deletePermission(id: string) {
        const permission = await prisma.permission.findUnique({
            where: { id },
        })

        if (!permission) {
            throw new Error('Permission not found')
        }

        if (permission.isSystem) {
            throw new Error('Cannot delete system permission')
        }

        await prisma.permission.delete({
            where: { id },
        })

        return { message: 'Permission deleted successfully' }
    }
}
