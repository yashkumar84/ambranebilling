import { z } from 'zod'

export const updateOrderSchema = z.object({
    status: z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    notes: z.string().optional(),
    discount: z.number().min(0).optional(),
})

export type UpdateOrderDTO = z.infer<typeof updateOrderSchema>
