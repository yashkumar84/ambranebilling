import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class OfferController {
    getAllOffers = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as { tenantId: string }

        try {
            const offers = await prisma.offer.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' }
            })

            return reply.send({
                success: true,
                data: offers
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    createOffer = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as { tenantId: string }
        const { title, description, code, discountValue, type, minOrderAmount, maxDiscount, expiryDate } = request.body as any

        try {
            const offer = await prisma.offer.create({
                data: {
                    tenantId,
                    title,
                    description,
                    code,
                    discountValue,
                    type,
                    minOrderAmount,
                    maxDiscount,
                    expiryDate: expiryDate ? new Date(expiryDate) : null
                }
            })

            return reply.code(201).send({
                success: true,
                data: offer,
                message: 'Marketing offer created successfully'
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    updateOffer = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as { tenantId: string }
        const { id } = request.params as { id: string }
        const data = request.body as any

        try {
            if (data.expiryDate) data.expiryDate = new Date(data.expiryDate)

            const offer = await prisma.offer.update({
                where: { id, tenantId },
                data
            })

            return reply.send({
                success: true,
                data: offer,
                message: 'Offer updated'
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

    deleteOffer = async (request: FastifyRequest, reply: FastifyReply) => {
        const { tenantId } = request.user as { tenantId: string }
        const { id } = request.params as { id: string }

        try {
            await prisma.offer.delete({
                where: { id, tenantId }
            })

            return reply.send({
                success: true,
                message: 'Offer deactivated/removed'
            })
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }
}
