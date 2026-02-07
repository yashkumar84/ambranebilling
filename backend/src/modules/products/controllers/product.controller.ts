import { FastifyReply, FastifyRequest } from 'fastify'
import { ProductService } from '../services/products.service'
import { ApiResponse } from '@/common/dtos/response.dto'

export class ProductController {
    private productService: ProductService

    constructor() {
        this.productService = new ProductService()
    }

    getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user.tenantId
        const { pageNum = 1, limitNum = 20, search = '' } = request.query as any

        try {
            const result = await this.productService.findAll(tenantId, Number(pageNum), Number(limitNum), search)
            return reply.send(ApiResponse.success(result))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    getProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user.tenantId
        const { id } = request.params as { id: string }

        try {
            const product = await this.productService.findById(id, tenantId)
            return reply.send(ApiResponse.success(product))
        } catch (error: any) {
            return reply.code(404).send(ApiResponse.error(error.message))
        }
    }

    createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user.tenantId
        const data = request.body as any

        try {
            const product = await this.productService.create(data, tenantId)
            return reply.code(201).send(ApiResponse.success(product, 'Product created successfully'))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    updateProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user.tenantId
        const { id } = request.params as { id: string }
        const data = request.body as any

        try {
            const product = await this.productService.update(id, data, tenantId)
            return reply.send(ApiResponse.success(product, 'Product updated successfully'))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string }
        const tenantId = (request as any).user.tenantId

        try {
            const result = await this.productService.delete(id, tenantId)
            return reply.send(ApiResponse.success(result, 'Product deleted successfully'))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    getCategories = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user.tenantId

        try {
            const categories = await this.productService.getCategories(tenantId)
            return reply.send(ApiResponse.success(categories))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }
}
