import { FastifyRequest, FastifyReply } from 'fastify';
import { convertCurrency, addCurrency, removeCurrency, CurrencyType } from '../services/currencyService';

interface ConvertCurrencyQuery {
  from: string;
  to: string;
  amount: string;
}

interface AddCurrencyBody {
  code: string;
  type: string;
  conversionRateToUSD?: number;
}

export async function convertCurrencyHandler(request: FastifyRequest<{ Querystring: ConvertCurrencyQuery }>, reply: FastifyReply) {
  const { from, to, amount } = request.query;

  try {
    const convertedAmount = await convertCurrency(from, to, parseFloat(amount));
    reply.send({ convertedAmount });
  } catch (error) {
    reply.status(400).send({ error: (error as Error).message });
  }
}

export async function addCurrencyHandler(request: FastifyRequest<{ Body: AddCurrencyBody }>, reply: FastifyReply) {
  const { code, type, conversionRateToUSD } = request.body;

  if (!['FIAT', 'CRYPTO', 'FICTITIOUS'].includes(type)) {
    reply.status(400).send({ error: 'Invalid currency type' });
    return;
  }

  try {
    addCurrency(code, type as CurrencyType, conversionRateToUSD);
    reply.code(201).send({ code, type, conversionRateToUSD });
  } catch (error) {
    reply.status(400).send({ error: (error as Error).message });
  }
}

export async function removeCurrencyHandler(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
  const { code } = request.params;

  try {
    removeCurrency(code);
    reply.status(204).send();
  } catch (error) {
    reply.status(400).send({ error: (error as Error).message });
  }
}
