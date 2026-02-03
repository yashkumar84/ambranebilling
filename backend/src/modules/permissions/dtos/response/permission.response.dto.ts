export class PermissionResponseDTO {
    id: number
    name: string
    description: string | null
    resource: string
    action: string
    createdAt: Date
    updatedAt: Date

    constructor(data: any) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.resource = data.resource
        this.action = data.action
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }
}
