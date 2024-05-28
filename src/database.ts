import {knex as setupKnex, Knex} from 'knex';

export const config: Knex.Config = {
  client: 'sqlite',
  useNullAsDefault: true,
  connection: {
    filename: './db/app.db'
  },
  migrations: {
    extension: 'ts',
    directory:'./db/migrations',
  }
};

export const knex = setupKnex(config);