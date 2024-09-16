import express from 'express';
import compress from 'compression';
import path from 'path';
import cors from 'cors';
import http from 'http';
import { urlencoded, json } from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import logger from './lib/logger';
import { config } from './environment';
import { getTypeDefs, getResolvers } from './lib/graphql';
import { initDB, destroyDB } from './lib/dal';
import { getDemoContext } from './lib/context';
import { DemoContext } from './lib/common';
import { GraphQLError } from 'graphql';


async function main() {
  logger.info('Application launching...');

  logger.info('config: %j', config);

  logger.info('db initializing...');
  try {
    await initDB();
    logger.info('db initialized.');
  } catch (err) {
    logger.error('db initialization failed with error(%s).', err);
  }

  logger.info('express applicattion configuring...');
  const app: express.Application = express();
  const httpServer = http.createServer(app);

  app.use(compress());
  app.use(urlencoded({ extended: false }));
  app.use(json());

  const apolloServer = new ApolloServer<DemoContext>({
    typeDefs: getTypeDefs(),
    resolvers: getResolvers(),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await apolloServer.start();
  app.use(
    config.baseV0URL + '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(
      apolloServer,
      {
        context: async ({ req }) => {
          const demoContext = await getDemoContext(req);
          if (demoContext !== null) {
            return demoContext;
          }
          throw new GraphQLError('User is not authenticated', { extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } } });
        }
      }
    )
  );
  let staticFilesPath = path.join(__dirname, 'client');
  app.use(express.static(staticFilesPath));
  app.get('/*', (_req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'client') });
  });
  logger.info('express application configured.');

  logger.info('express application server configuring...');
  await new Promise<void>(
    (resolve) => httpServer.listen({ port: config.serverPort as number, host: config.serverAddress as string }, resolve)
  );
  logger.info('open your browser on https://%s:%d', config.serverAddress, config.serverPort);
  logger.info('application server configured.');

  process.on('SIGINT', function () {
    logger.info('Exiting...');
    httpServer.close((err?: Error) => {
      if (err) {
        logger.error('call httpServer.close failed with error(%s).', err);
      }
      destroyDB().catch((reason) => {
        logger.error('call destroyDB failed with error(%s).', reason);
      }).finally(() => {
        logger.info('Exit');
        process.exit();
      });
    });
  });
}

main().catch((err) => {
  logger.error('app.ts: got error(%s) and exit now.', err);
  process.exit(1);
});

