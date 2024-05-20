import { FastifyInstance } from 'fastify';

async function currencyRoutes(server: FastifyInstance) {
  server.get('/convert', async (request, reply) => {
    const { from, to, amount } = request.query as { from: string, to: string, amount: number };

    const convertedAmount = amount * 5;
    return { convertedAmount };
  });

  server.post('/currencies', async (request, reply) => {
    const { code, type, conversionRateToUSD } = request.body as { code: string, type: string, conversionRateToUSD: number };

    reply.code(201).send({ code, type, conversionRateToUSD });
  });

  server.delete('/currencies/:code', async (request, reply) => {
    const { code } = request.params as { code: string };

    reply.status(204).send();
  });
}

export default currencyRoutes;
