"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const currencyService_1 = require("../services/currencyService");
async function currencyRoutes(server) {
    server.get('/convert', async (request, reply) => {
        const { from, to, amount } = request.query;
        try {
            const convertedAmount = await (0, currencyService_1.convertCurrency)(from, to, parseFloat(amount));
            return { convertedAmount };
        }
        catch (error) {
            reply.status(400).send({ error: error.message });
        }
    });
    server.post('/currencies', async (request, reply) => {
        const { code, type, conversionRateToUSD } = request.body;
        try {
            (0, currencyService_1.addCurrency)(code, type, conversionRateToUSD);
            reply.code(201).send({ code, type, conversionRateToUSD });
        }
        catch (error) {
            reply.status(400).send({ error: error.message });
        }
    });
    server.delete('/currencies/:code', async (request, reply) => {
        const { code } = request.params;
        try {
            (0, currencyService_1.removeCurrency)(code);
            reply.status(204).send();
        }
        catch (error) {
            reply.status(400).send({ error: error.message });
        }
    });
}
exports.default = currencyRoutes;
