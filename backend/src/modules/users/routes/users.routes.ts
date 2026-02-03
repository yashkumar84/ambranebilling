import { FastifyInstance } from 'fastify'
import { UsersController } from '../controllers/users.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function usersRoutes(fastify: FastifyInstance) {
    const controller = new UsersController()

    // All routes are protected
    fastify.addHook('onRequest', authMiddleware)

    fastify.get('/', controller.getAllUsers)
    fastify.get('/:id', controller.getUserById)
    fastify.post('/', controller.createUser)
    fastify.put('/:id', controller.updateUser)
    fastify.delete('/:id', controller.deleteUser)
}
