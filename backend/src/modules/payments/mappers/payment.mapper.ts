import { PaymentResponseDTO } from '../dtos/response/payment.response.dto'

export class PaymentMapper {
    static toResponseDTO(payment: any): PaymentResponseDTO {
        return new PaymentResponseDTO(payment)
    }

    static toResponseDTOArray(payments: any[]): PaymentResponseDTO[] {
        return payments.map((payment: any) => this.toResponseDTO(payment))
    }
}
