import { FastifyReply, FastifyRequest } from 'fastify'
import { ProductService } from '../services/products.service'

export class ProductController {
    private productService: ProductService

    constructor() {
        this.productService = new ProductService()
    }

    getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as any
        const { pageNum = 1, limitNum = 20, search = '' } = request.query as any

        try {
            const result = await this.productService.findAll(tenantId, Number(pageNum), Number(limitNum), search)
            return reply.send({
                success: true,
                data: result
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    getProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as any
        const { id } = request.params as { id: string }

        try {
            const product = await this.productService.findById(id, tenantId)
            return reply.send({
                success: true,
                data: product
            })
        } catch (error: any) {
            return reply.code(404).send({
                success: false,
                message: error.message
            })
        }
    }

    createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as any
        const data = request.body as any

        try {
            const product = await this.productService.create(data, tenantId)
            return reply.code(201).send({
                success: true,
                data: product
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    updateProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as any
        const { id } = request.params as { id: string }
        const data = request.body as any

        try {
            const product = await this.productService.update(id, data, tenantId)
            return reply.send({
                success: true,
                data: product
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as any
        const { id } = request.params as { id: string }

        try {
            const result = await this.productService.delete(id, tenantId)
            return reply.send({
                success: true,
                message: result.message
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }
}
