export class TableResponseDTO {
    id: number
    number: string
    capacity: number
    status: string
    restaurantId: number
    createdAt: Date
    updatedAt: Date

    constructor(data: any) {
        this.id = data.id
        this.number = data.number
        this.capacity = data.capacity
        this.status = data.status
        this.restaurantId = data.restaurantId
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }
}
