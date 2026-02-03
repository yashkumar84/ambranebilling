export class OrderItemResponseDTO {
    id: number
    menuItemId: number
    menuItemName?: string
    quantity: number
    price: number
    subtotal: number
    notes: string | null

    constructor(data: any) {
        this.id = data.id
        this.menuItemId = data.menuItemId
        this.menuItemName = data.menuItem?.name
        this.quantity = data.quantity
        this.price = data.price
        this.subtotal = data.subtotal
        this.notes = data.notes
    }
}

export class OrderResponseDTO {
    id: number
    orderNumber: string
    tableId: number | null
    tableNumber?: string
    customerId: number | null
    customerName?: string
    userId: number
    userName?: string
    status: string
    subtotal: number
    tax: number
    discount: number
    total: number
    notes: string | null
    restaurantId: number
    items: OrderItemResponseDTO[]
    createdAt: Date
    updatedAt: Date

    constructor(data: any) {
        this.id = data.id
        this.orderNumber = data.orderNumber
        this.tableId = data.tableId
        this.tableNumber = data.table?.number
        this.customerId = data.customerId
        this.customerName = data.customer?.name
        this.userId = data.userId
        this.userName = data.user?.name
        this.status = data.status
        this.subtotal = data.subtotal
        this.tax = data.tax
        this.discount = data.discount
        this.total = data.total
        this.notes = data.notes
        this.restaurantId = data.restaurantId
        this.items = data.items?.map((item: any) => new OrderItemResponseDTO(item)) || []
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }
}
