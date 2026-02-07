import { FastifyInstance } from 'fastify'
import { ProductController } from '../controllers/product.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function productRoutes(fastify: FastifyInstance) {
    const controller = new ProductController()

    // All product routes require authentication
    fastify.addHook('onRequest', authMiddleware)

    // List all categories
    fastify.get('/categories', {
        handler: controller.getCategories,
    })

    // List all products for the tenant
    fastify.get('/', {
        schema: {
            description: 'List all products for the tenant',
            tags: ['Menu'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getProducts,
    })

    // List products by restaurant (for compatibility with frontend)
    fastify.get('/restaurant/:restaurantId', {
        schema: {
            description: 'List products for a specific restaurant',
            tags: ['Menu'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getProducts,
    })

    // Get single product
    fastify.get('/:id', {
        schema: {
            description: 'Get product by ID',
            tags: ['Menu'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.getProduct,
    })

    // Create product
    fastify.post('/', {
        schema: {
            description: 'Create new product',
            tags: ['Menu'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.createProduct,
    })

    // Update product
    fastify.put('/:id', {
        schema: {
            description: 'Update product',
            tags: ['Menu'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.updateProduct,
    })

    // Delete product
    fastify.delete('/:id', {
        schema: {
            description: 'Delete product',
            tags: ['Menu'],
            security: [{ bearerAuth: [] }],
        },
        handler: controller.deleteProduct,
    })
}
