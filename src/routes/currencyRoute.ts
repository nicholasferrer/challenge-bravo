import { FastifyInstance } from 'fastify';
import { convertCurrencyHandler, addCurrencyHandler, removeCurrencyHandler } from '../controllers/currencyController';

async function currencyRoutes(server: FastifyInstance) {
  server.get('/convert', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          amount: { type: 'string' }
        },
        required: ['from', 'to', 'amount']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            convertedAmount: { type: 'string' }
          }
        }
      }
    },
    handler: convertCurrencyHandler
  });

  server.post('/currencies', {
    schema: {
      body: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          type: { type: 'string', enum: ['FIAT', 'CRYPTO', 'FICTITIOUS'] },
          conversionRateToUSD: { type: 'number' }
        },
        required: ['code', 'type']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            type: { type: 'string' },
            conversionRateToUSD: { type: 'number' }
          }
        }
      }
    },
    handler: addCurrencyHandler
  });

  server.delete('/currencies/:code', {
    schema: {
      params: {
        type: 'object',
        properties: {
          code: { type: 'string' }
        },
        required: ['code']
      },
      response: {
        204: {
          type: 'null'
        }
      }
    },
    handler: removeCurrencyHandler
  });
}

export default currencyRoutes;
