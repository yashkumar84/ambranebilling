import { PermissionResponseDTO } from '../dtos/response/permission.response.dto'

export class PermissionMapper {
    static toResponseDTO(permission: any): PermissionResponseDTO {
        return new PermissionResponseDTO(permission)
    }

    static toResponseDTOArray(permissions: any[]): PermissionResponseDTO[] {
        return permissions.map((permission: any) => this.toResponseDTO(permission))
    }
}
