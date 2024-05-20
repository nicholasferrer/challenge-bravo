import fastify from 'fastify';
import app from './app';
import swagger from "@fastify/swagger";

const server = fastify({ logger: true });

server.register(swagger, {
    exposeRoute: true,
    routePrefix: "/docs",
    swagger: {
      info: { title: "challenge-bravo", version: "1.0.0" },
    },
  });

server.register(app);

server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
