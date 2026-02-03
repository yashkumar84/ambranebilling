import { OrderResponseDTO } from '../dtos/response/order.response.dto'

export class OrderMapper {
    static toResponseDTO(order: any): OrderResponseDTO {
        return new OrderResponseDTO(order)
    }

    static toResponseDTOArray(orders: any[]): OrderResponseDTO[] {
        return orders.map((order: any) => this.toResponseDTO(order))
    }
}
