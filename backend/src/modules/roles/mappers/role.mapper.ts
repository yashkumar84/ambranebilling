import { RoleResponseDTO } from '../dtos/response/role.response.dto'

export class RoleMapper {
    static toResponseDTO(role: any): RoleResponseDTO {
        return new RoleResponseDTO(role)
    }

    static toResponseDTOArray(roles: any[]): RoleResponseDTO[] {
        return roles.map((role: any) => this.toResponseDTO(role))
    }
}
