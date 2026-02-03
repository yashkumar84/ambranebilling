import { z } from 'zod'

export const createPaymentSchema = z.object({
    orderId: z.string().uuid(),
    method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET']),
    amount: z.number().positive(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).default('PENDING'),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
})

export type CreatePaymentDTO = z.infer<typeof createPaymentSchema>
