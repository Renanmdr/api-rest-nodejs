import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';

export async function checkSessionIdExist(req: FastifyRequest, rep: FastifyReply) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return rep.status(401).send({
      error: 'Unauthorized'
    });
  }
}