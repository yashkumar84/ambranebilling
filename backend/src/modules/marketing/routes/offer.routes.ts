import { FastifyInstance } from 'fastify'
import { OfferController } from '../controllers/offer.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function offerRoutes(fastify: FastifyInstance) {
    const controller = new OfferController()

    // Protected Marketing routes
    fastify.register(async (instance) => {
        instance.addHook('preHandler', authMiddleware)

        instance.get('/', {
            schema: {
                description: 'Get all store offers',
                tags: ['Marketing'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: { type: 'array' }
                        }
                    }
                }
            },
            handler: controller.getAllOffers
        })

        instance.post('/', {
            schema: {
                description: 'Create a new marketing offer',
                tags: ['Marketing'],
                body: {
                    type: 'object',
                    required: ['title', 'discountValue', 'type'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        code: { type: 'string' },
                        discountValue: { type: 'number' },
                        type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
                        minOrderAmount: { type: 'number' },
                        maxDiscount: { type: 'number' },
                        expiryDate: { type: 'string', format: 'date-time' }
                    }
                }
            },
            handler: controller.createOffer
        })

        instance.patch('/:id', {
            schema: {
                description: 'Update a marketing offer',
                tags: ['Marketing'],
                params: {
                    type: 'object',
                    properties: { id: { type: 'string' } }
                }
            },
            handler: controller.updateOffer
        })

        instance.delete('/:id', {
            schema: {
                description: 'Deactivate/Delete a marketing offer',
                tags: ['Marketing'],
                params: {
                    type: 'object',
                    properties: { id: { type: 'string' } }
                }
            },
            handler: controller.deleteOffer
        })
    })
}
