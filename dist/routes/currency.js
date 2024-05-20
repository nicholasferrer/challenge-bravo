"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function currencyRoutes(server) {
    server.get('/convert', async (request, reply) => {
        const { from, to, amount } = request.query;
        // Implement conversion logic here
        const convertedAmount = amount * 5; // Dummy conversion rate
        return { convertedAmount };
    });
    server.post('/currencies', async (request, reply) => {
        const { code, type, conversionRateToUSD } = request.body;
        // Implement logic to add a currency
        reply.code(201).send({ code, type, conversionRateToUSD });
    });
    server.delete('/currencies/:code', async (request, reply) => {
        const { code } = request.params;
        // Implement logic to remove a currency
        reply.status(204).send();
    });
}
exports.default = currencyRoutes;
