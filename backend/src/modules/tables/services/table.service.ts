import { TableRepository } from '../repositories/table.repository'
import { TableMapper } from '../mappers/table.mapper'
import { CreateTableDTO } from '../dtos/request/create-table.dto'
import { UpdateTableDTO } from '../dtos/request/update-table.dto'
import { TableResponseDTO } from '../dtos/response/table.response.dto'
import { AppError } from '@/common/middleware/error.middleware'
import { PaginationDTO } from '@/common/dtos/pagination.dto'

export class TableService {
    private tableRepository: TableRepository

    constructor() {
        this.tableRepository = new TableRepository()
    }

    async getTables(
        tenantId: string,
        pagination: PaginationDTO,
        filters?: { status?: string }
    ) {
        const tables = await this.tableRepository.findAll({
            tenantId,
            status: filters?.status,
            skip: pagination.skip,
            take: pagination.limit,
        })

        const total = await this.tableRepository.count({
            tenantId,
            status: filters?.status,
        })

        return {
            items: TableMapper.toResponseDTOArray(tables),
            ...pagination.getMetadata(total),
        }
    }

    async getTable(id: string): Promise<TableResponseDTO> {
        const table = await this.tableRepository.findById(id)
        if (!table) {
            throw new AppError(404, 'Table not found')
        }
        return TableMapper.toResponseDTO(table)
    }

    async createTable(data: CreateTableDTO, tenantId: string): Promise<TableResponseDTO> {
        const table = await this.tableRepository.create({ ...data, tenantId })
        return TableMapper.toResponseDTO(table)
    }

    async updateTable(id: string, data: UpdateTableDTO): Promise<TableResponseDTO> {
        const existingTable = await this.tableRepository.findById(id)
        if (!existingTable) {
            throw new AppError(404, 'Table not found')
        }

        const updatedTable = await this.tableRepository.update(id, data)
        return TableMapper.toResponseDTO(updatedTable)
    }

    async deleteTable(id: string): Promise<void> {
        const existingTable = await this.tableRepository.findById(id)
        if (!existingTable) {
            throw new AppError(404, 'Table not found')
        }

        await this.tableRepository.delete(id)
    }

    async updateTableStatus(id: string, status: string): Promise<TableResponseDTO> {
        const table = await this.tableRepository.findById(id)
        if (!table) {
            throw new AppError(404, 'Table not found')
        }

        const updatedTable = await this.tableRepository.updateStatus(id, status)
        return TableMapper.toResponseDTO(updatedTable)
    }
}
