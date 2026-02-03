import { FastifyInstance } from 'fastify'
import { CustomerController } from '../controllers/customer.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function customerRoutes(fastify: FastifyInstance) {
    const controller = new CustomerController()

    fastify.addHook('onRequest', authMiddleware)

    fastify.get('/', controller.getAllCustomers)
    fastify.get('/:id', controller.getCustomerById)
    fastify.post('/', controller.createCustomer)
    fastify.put('/:id', controller.updateCustomer)
    fastify.delete('/:id', controller.deleteCustomer)
}
