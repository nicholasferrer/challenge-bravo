import dotenv from 'dotenv';
dotenv.config();

import cluster from 'cluster';
import os from 'os';
import fastify from 'fastify';
import app from './app';
import swagger from "@fastify/swagger";

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const server = fastify({
    logger: true,
    maxParamLength: 1000,
    connectionTimeout: 60000,
    keepAliveTimeout: 60000,
    maxRequestsPerSocket: 100
  });

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
}
