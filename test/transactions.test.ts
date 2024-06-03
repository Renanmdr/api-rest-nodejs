import { afterAll, beforeAll, describe, it, expect, beforeEach} from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
    
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {

    await supertest(app.server).post('/transactions').send({
      title: 'New transactions',
      amount: 5000,
      type: 'credit'
    }).expect(201);
    
    
  });

  it('should be able to list all transactions', async () => {
    const createtransactionResponse = await supertest(app.server).post('/transactions').send({
      title: 'New transactions',
      amount: 5000,
      type: 'credit'
    });

    // const cookies = createtransactionResponse.get('Set-Cookie');
    const cookies2 = createtransactionResponse.headers['set-cookie'];

    // console.log(cookies);

    const listTransactionsResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies2).expect(200);
   
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({ title: 'New transactions', amount: 5000 })
    ]);


  });

  it('should be able to get especific transaction', async () => {
    const createtransactionResponse = await supertest(app.server).post('/transactions').send({
      title: 'New transactions',
      amount: 5000,
      type: 'credit'
    });

    

    const cookies2 = createtransactionResponse.headers['set-cookie'];

   

    const listTransactionsResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies2).expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;


    const GettransactionResponse = await supertest(app.server).get(`/transactions/${transactionId}`).set('Cookie', cookies2).expect(200);

    expect(GettransactionResponse.body.transaction).toEqual(
      expect.objectContaining({ title: 'New transactions', amount: 5000 })
    );


  });

  it('should be able to get the summary', async () => {
    const createtransactionResponse = await supertest(app.server).post('/transactions').send({
      title: 'New transactions',
      amount: 5000,
      type: 'credit'
    });

    
    const cookies2 = createtransactionResponse.headers['set-cookie'];

   
    await supertest(app.server).post('/transactions').set('Cookie', cookies2).send({
      title: 'New transactions 2',
      amount: 2000,
      type: 'debit'
    });
    const summaryResponse = await supertest(app.server).get('/transactions/summary').set('Cookie', cookies2).expect(200);

    expect(summaryResponse.body.summary).toEqual({amount: 3000 });


  });
});