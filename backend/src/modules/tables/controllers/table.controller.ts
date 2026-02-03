import { FastifyRequest, FastifyReply } from 'fastify'
import { TableService } from '../services/table.service'
import { CreateTableDTO } from '../dtos/request/create-table.dto'
import { UpdateTableDTO } from '../dtos/request/update-table.dto'
import { ApiResponse } from '@/common/dtos/response.dto'
import { PaginationDTO } from '@/common/dtos/pagination.dto'

export class TableController {
    private tableService: TableService

    constructor() {
        this.tableService = new TableService()
        this.getTables = this.getTables.bind(this)
        this.getTable = this.getTable.bind(this)
        this.createTable = this.createTable.bind(this)
        this.updateTable = this.updateTable.bind(this)
        this.deleteTable = this.deleteTable.bind(this)
        this.updateTableStatus = this.updateTableStatus.bind(this)
    }

    async getTables(request: FastifyRequest, reply: FastifyReply) {
        const { page = 1, limit = 20, status } = request.query as any
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        const pagination = new PaginationDTO(page, limit)
        const result = await this.tableService.getTables(tenantId, pagination, {
            status,
        })

        return reply.code(200).send(ApiResponse.success(result, 'Tables retrieved successfully'))
    }

    async getTable(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const table = await this.tableService.getTable(id)
        return reply.code(200).send(ApiResponse.success(table, 'Table retrieved successfully'))
    }

    async createTable(request: FastifyRequest, reply: FastifyReply) {
        const data = request.body as CreateTableDTO
        const tenantId = (request as any).tenantId
        if (!tenantId) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }
        const table = await this.tableService.createTable(data, tenantId)
        return reply.code(201).send(ApiResponse.success(table, 'Table created successfully'))
    }

    async updateTable(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const data = request.body as UpdateTableDTO
        const table = await this.tableService.updateTable(id, data)
        return reply.code(200).send(ApiResponse.success(table, 'Table updated successfully'))
    }

    async deleteTable(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        await this.tableService.deleteTable(id)
        return reply.code(200).send(ApiResponse.success(null, 'Table deleted successfully'))
    }

    async updateTableStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any
        const { status } = request.body as any
        const table = await this.tableService.updateTableStatus(id, status)
        return reply.code(200).send(ApiResponse.success(table, 'Table status updated successfully'))
    }
}
