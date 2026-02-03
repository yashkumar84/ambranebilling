import { z } from 'zod'

export const createPermissionSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    resource: z.string().min(2, 'Resource is required'),
    action: z.string().min(2, 'Action is required'),
})

export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>
