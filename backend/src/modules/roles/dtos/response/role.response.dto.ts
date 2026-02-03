export class RoleResponseDTO {
    id: number
    name: string
    description: string | null
    isSystem: boolean
    permissions: PermissionInRoleDTO[]
    createdAt: Date
    updatedAt: Date

    constructor(data: any) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.isSystem = data.isSystem
        this.permissions = data.permissions?.map((rp: any) => new PermissionInRoleDTO(rp.permission)) || []
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }
}

export class PermissionInRoleDTO {
    id: number
    name: string
    resource: string
    action: string

    constructor(data: any) {
        this.id = data.id
        this.name = data.name
        this.resource = data.resource
        this.action = data.action
    }
}
