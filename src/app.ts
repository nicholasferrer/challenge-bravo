import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import currencyRoutes from './routes/currencyRoute';
import { initializeCurrencies } from './services/currencyService';

export default async function app(server: FastifyInstance, opts: FastifyPluginOptions) {
    initializeCurrencies();
    server.register(currencyRoutes);
}
