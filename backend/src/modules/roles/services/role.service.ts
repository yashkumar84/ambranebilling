import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class RoleService {
    async findAll(tenantId: string) {
        return await prisma.role.findMany({
            where: { tenantId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async findById(id: string, tenantId: string) {
        const role = await prisma.role.findFirst({
            where: { id, tenantId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        })

        if (!role) {
            throw new Error('Role not found')
        }

        return role
    }

    async create(data: any, tenantId: string, userId: string) {
        return await prisma.role.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                createdBy: userId,
                isSystemRole: false,
            },
        })
    }

    async update(id: string, data: any, tenantId: string) {
        const role = await prisma.role.findFirst({
            where: { id, tenantId },
        })

        if (!role) {
            throw new Error('Role not found')
        }

        if (role.isSystemRole) {
            throw new Error('Cannot update system role')
        }

        return await prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
            },
        })
    }

    async delete(id: string, tenantId: string) {
        const role = await prisma.role.findFirst({
            where: { id, tenantId },
        })

        if (!role) {
            throw new Error('Role not found')
        }

        if (role.isSystemRole) {
            throw new Error('Cannot delete system role')
        }

        await prisma.role.delete({
            where: { id },
        })

        return { message: 'Role deleted successfully' }
    }

    async assignPermissions(roleId: string, permissionIds: string[], tenantId: string) {
        const role = await prisma.role.findFirst({
            where: { id: roleId, tenantId },
        })

        if (!role) {
            throw new Error('Role not found')
        }

        // Delete existing permissions
        await prisma.rolePermission.deleteMany({
            where: { roleId },
        })

        // Create new permissions
        await prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
                roleId,
                permissionId,
            })),
        })

        return { message: 'Permissions assigned successfully' }
    }

    async removePermission(roleId: string, permissionId: string, tenantId: string) {
        const role = await prisma.role.findFirst({
            where: { id: roleId, tenantId },
        })

        if (!role) {
            throw new Error('Role not found')
        }

        await prisma.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId,
            },
        })

        return { message: 'Permission removed successfully' }
    }
}
