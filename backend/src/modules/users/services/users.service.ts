import { PrismaClient } from '@prisma/client'
import { UserResponseDTO } from '../../auth/dtos/response/auth.response.dto'
import { AppError } from '@/common/middleware/error.middleware'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export class UsersService {
    async getAllUsers(tenantId?: string, skip: number = 0, take: number = 20) {
        const whereClause = tenantId ? { tenantId } : {}

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                include: { role: true },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where: whereClause }),
        ])

        return {
            users: users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone || undefined,
                tenantId: user.tenantId || undefined,
                isSuperAdmin: user.isSuperAdmin,
                roleId: user.roleId || undefined,
                roleName: user.role?.name,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
            })),
            total,
        }
    }

    async getUserById(id: string, tenantId?: string): Promise<UserResponseDTO> {
        const whereClause = tenantId ? { id, tenantId } : { id }

        const user = await prisma.user.findFirst({
            where: whereClause,
            include: { role: true },
        })

        if (!user) {
            throw new AppError(404, 'User not found')
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || undefined,
            tenantId: user.tenantId || undefined,
            isSuperAdmin: user.isSuperAdmin,
            roleId: user.roleId || undefined,
            roleName: user.role?.name,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
        }
    }

    async createUser(
        tenantId: string | undefined,
        data: {
            email: string
            password: string
            name: string
            phone?: string
            roleId: string
        }
    ): Promise<UserResponseDTO> {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existing) {
            throw new AppError(409, 'User with this email already exists')
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        const user = await prisma.user.create({
            data: {
                tenantId,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                roleId: data.roleId,
                isSuperAdmin: false,
                isActive: true,
            },
            include: { role: true },
        })

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || undefined,
            tenantId: user.tenantId || undefined,
            isSuperAdmin: user.isSuperAdmin,
            roleId: user.roleId || undefined,
            roleName: user.role?.name,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
        }
    }

    async updateUser(
        id: string,
        tenantId: string | undefined,
        data: {
            name?: string
            phone?: string
            roleId?: string
            isActive?: boolean
            password?: string
        }
    ): Promise<UserResponseDTO> {
        const updateData: any = { ...data }

        // Hash password if provided
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: { role: true },
        })

        // Verify tenant ownership (skip for super admins)
        if (tenantId && user.tenantId !== tenantId) {
            throw new AppError(403, 'Forbidden')
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || undefined,
            tenantId: user.tenantId || undefined,
            isSuperAdmin: user.isSuperAdmin,
            roleId: user.roleId || undefined,
            roleName: user.role?.name,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
        }
    }

    async deleteUser(id: string, tenantId?: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) {
            throw new AppError(404, 'User not found')
        }

        // Verify tenant ownership (skip for super admins)
        if (tenantId && user.tenantId !== tenantId) {
            throw new AppError(403, 'Forbidden')
        }

        await prisma.user.delete({ where: { id } })
    }
}
