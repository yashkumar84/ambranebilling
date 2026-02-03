import { prisma } from '@/config/database.config'
import { CreateRoleDTO } from '../dtos/request/create-role.dto'

export class RoleRepository {
    async findAll(filters?: { skip?: number; take?: number }) {
        return prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            skip: filters?.skip || 0,
            take: filters?.take || 100,
            orderBy: { name: 'asc' },
        })
    }

    async findById(id: string) {
        return prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        })
    }

    async create(data: CreateRoleDTO) {
        return prisma.role.create({
            data,
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        })
    }

    async update(id: string, data: Partial<CreateRoleDTO>) {
        return prisma.role.update({
            where: { id },
            data,
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        })
    }

    async delete(id: string) {
        return prisma.role.delete({
            where: { id },
        })
    }

    async assignPermissions(roleId: string, permissionIds: string[]) {
        // Remove existing permissions
        await prisma.rolePermission.deleteMany({
            where: { roleId },
        })

        // Add new permissions
        await prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId: string) => ({
                roleId,
                permissionId,
            })),
        })

        return this.findById(roleId)
    }

    async removePermission(roleId: string, permissionId: string) {
        await prisma.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId,
            },
        })

        return this.findById(roleId)
    }

    async count(): Promise<number> {
        return prisma.role.count()
    }
}
