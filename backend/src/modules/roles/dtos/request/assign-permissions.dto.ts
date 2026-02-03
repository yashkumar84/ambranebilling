import { z } from 'zod'

export const assignPermissionsSchema = z.object({
    permissionIds: z.array(z.string().uuid()).min(1, 'At least one permission is required'),
})

export type AssignPermissionsDTO = z.infer<typeof assignPermissionsSchema>
