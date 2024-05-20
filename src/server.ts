import fastify from 'fastify';
import app from './app';

const server = fastify({ logger: true });

server.register(app);

server.listen(3000, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
