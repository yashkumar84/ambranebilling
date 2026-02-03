import { FastifyReply, FastifyRequest } from 'fastify'
import { CustomerService } from '../services/customer.service'

export class CustomerController {
    private customerService: CustomerService

    constructor() {
        this.customerService = new CustomerService()
    }

    getAllCustomers = async (request: FastifyRequest, reply: FastifyReply) => {
        // Super admins can access all customers, regular users need tenant context
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            return reply.code(403).send({ error: 'Tenant context required' })
        }

        const { page = 1, limit = 20, search = '' } = request.query as { page?: number; limit?: number; search?: string }
        const result = await this.customerService.findAll(request.tenantId || '', page, limit, search)
        return reply.code(200).send({
            success: true,
            data: result.customers,
            pagination: result.pagination
        })
    }

    getCustomerById = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            return reply.code(403).send({ error: 'Tenant context required' })
        }

        const { id } = request.params as { id: string }
        const customer = await this.customerService.findById(id, request.tenantId || '')
        return reply.code(200).send({
            success: true,
            data: customer
        })
    }

    createCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            return reply.code(403).send({ error: 'Tenant context required' })
        }

        const customer = await this.customerService.create(request.body, request.tenantId || '')
        return reply.code(201).send({
            success: true,
            data: customer,
            message: 'Customer created successfully'
        })
    }

    updateCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            return reply.code(403).send({ error: 'Tenant context required' })
        }

        const { id } = request.params as { id: string }
        const customer = await this.customerService.update(id, request.body, request.tenantId || '')
        return reply.code(200).send({
            success: true,
            data: customer,
            message: 'Customer updated successfully'
        })
    }

    deleteCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.tenantId && !request.user?.isSuperAdmin) {
            return reply.code(403).send({ error: 'Tenant context required' })
        }

        const { id } = request.params as { id: string }
        await this.customerService.delete(id, request.tenantId || '')
        return reply.code(200).send({
            success: true,
            message: 'Customer deleted successfully'
        })
    }
}
