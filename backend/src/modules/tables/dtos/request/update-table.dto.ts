import { z } from 'zod'

export const updateTableSchema = z.object({
    number: z.string().min(1).optional(),
    capacity: z.number().int().positive().optional(),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']).optional(),
})

export type UpdateTableDTO = z.infer<typeof updateTableSchema>
