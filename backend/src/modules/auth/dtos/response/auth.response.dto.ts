export class UserResponseDTO {
    id!: string
    email!: string
    name!: string
    phone?: string
    tenantId?: string
    isSuperAdmin!: boolean
    roleId?: string
    roleName?: string
    permissions?: string[]
    isActive!: boolean
    createdAt!: string
    tenant?: {
        id: string
        businessName: string
        subscription?: {
            status: string
            planName: string
            endDate: string
        }
    }
}

export class AuthResponseDTO {
    accessToken!: string
    refreshToken!: string
    user!: UserResponseDTO

    constructor(accessToken: string, refreshToken: string, user: UserResponseDTO) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.user = user
    }
}
