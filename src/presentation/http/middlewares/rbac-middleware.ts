import { FastifyRequest, FastifyReply } from "fastify";

export const requireRole = (allowedRoles : number[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user

        if(!user){2
            return reply.status(401).send({
                success: false,
                message: "Unauthorized: User payload missing",
            })
        }
        if (!allowedRoles.includes(user.roleId)){
            return reply.status(403).send({
                success: false,
                message: "Forbidden: You do not have permission to perform this action",
            })
        }

    }
}