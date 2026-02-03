import { TableResponseDTO } from '../dtos/response/table.response.dto'

export class TableMapper {
    static toResponseDTO(table: any): TableResponseDTO {
        return new TableResponseDTO({
            id: table.id,
            number: table.number,
            capacity: table.capacity,
            status: table.status,
            restaurantId: table.restaurantId,
            createdAt: table.createdAt,
            updatedAt: table.updatedAt,
        })
    }

    static toResponseDTOArray(tables: any[]): TableResponseDTO[] {
        return tables.map((table: any) => this.toResponseDTO(table))
    }
}
