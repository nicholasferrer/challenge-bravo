"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const app_1 = __importDefault(require("../../src/app"));
describe('Currency Conversion API', () => {
    let server;
    beforeAll(async () => {
        server = (0, fastify_1.default)();
        server.register(app_1.default);
        await server.ready();
    });
    afterAll(() => {
        server.close();
    });
    it('should convert USD to BRL', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/convert?from=USD&to=BRL&amount=100'
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('convertedAmount');
    });
    it('should add a new currency', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/currencies',
            payload: {
                code: 'GOLD',
                type: 'FICTITIOUS',
                conversionRateToUSD: 0.1
            }
        });
        expect(response.statusCode).toBe(201);
        expect(response.json()).toHaveProperty('code', 'GOLD');
    });
    it('should remove a currency', async () => {
        const response = await server.inject({
            method: 'DELETE',
            url: '/currencies/GOLD'
        });
        expect(response.statusCode).toBe(204);
    });
});
