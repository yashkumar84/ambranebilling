import { z } from 'zod'

export const createTableSchema = z.object({
    number: z.string().min(1, 'Table number is required'),
    capacity: z.number().int().positive('Capacity must be positive'),
    restaurantId: z.number().int().positive(),
})

export type CreateTableDTO = z.infer<typeof createTableSchema>
