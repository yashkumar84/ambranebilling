export class PaymentResponseDTO {
    id: number
    orderId: number
    orderNumber?: string
    amount: number
    method: string
    status: string
    transactionId: string | null
    createdAt: Date
    updatedAt: Date

    constructor(data: any) {
        this.id = data.id
        this.orderId = data.orderId
        this.orderNumber = data.order?.orderNumber
        this.amount = data.amount
        this.method = data.method
        this.status = data.status
        this.transactionId = data.transactionId
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }
}
