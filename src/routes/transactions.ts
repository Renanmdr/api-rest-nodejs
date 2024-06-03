import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import {z} from 'zod';
import { checkSessionIdExist } from '../middlewares/check-session-id-exist';


export const transactionsRoutes = async (app: FastifyInstance ) => {
  app.get('/',{preHandler: [checkSessionIdExist]}, async (req) => {

    const sessionId = req.cookies.sessionId;


    const transactions = await knex('transactions').where('session_id', '=', sessionId).select('*');

    return {
      transactions
    };
  });

  app.get('/:id', { preHandler: [checkSessionIdExist] }, async (req) => {
    const getTransactionParamsSchema =  z.object({
      id: z.string().uuid(),
    });
    
    const { id } = getTransactionParamsSchema.parse(req.params);
    
    const sessionId = req.cookies.sessionId;

    const transaction = await knex('transactions').where({ session_id: sessionId, id: id }).first();

    return {
      transaction
    };
  });

  app.get('/summary', { preHandler: [checkSessionIdExist] }, async (req) => {
    const sessionId = req.cookies.sessionId;
    const summary = await knex('transactions').where('session_id', '=', sessionId).sum('amount', {as: 'amount'}).first();

    return {
      summary
    };
  });

  app.post('/', async (req, rep) => {
    // { title, amount, type: credit ou debit}

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])

    });

    const {title, amount, type} = createTransactionBodySchema.parse(req.body);
   
    let sessionId = req.cookies.sessionId;

    if(!sessionId){
      sessionId = crypto.randomUUID();

      rep.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
      });
    }
    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    });

    return rep.status(201).send();
      
  });
};