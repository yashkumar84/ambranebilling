import { z } from 'zod'

const orderItemSchema = z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    notes: z.string().optional(),
})

export const createOrderSchema = z.object({
    tableId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']).default('DINE_IN'),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    discount: z.number().min(0).default(0),
    taxRate: z.number().min(0).default(0),
    paymentMethod: z.string().optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).default('PENDING'),
})

export type CreateOrderDTO = z.infer<typeof createOrderSchema>
export type OrderItemDTO = z.infer<typeof orderItemSchema>
