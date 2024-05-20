import fastify, { FastifyInstance } from 'fastify';
import app from '../../src/app';
import { initializeCurrencies, clearCurrencies } from '../../src/services/currencyService';

describe('Currency Conversion API', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = fastify();
    server.register(app);
    await server.ready();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    clearCurrencies();
    initializeCurrencies();
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

    if (response.statusCode !== 201) {
      console.error('Response:', response.json());
    }

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('code', 'GOLD');
  });

  it('should remove a currency', async () => {
    await server.inject({
      method: 'POST',
      url: '/currencies',
      payload: {
        code: 'GOLD',
        type: 'FICTITIOUS',
        conversionRateToUSD: 0.1
      }
    });

    const response = await server.inject({
      method: 'DELETE',
      url: '/currencies/GOLD'
    });

    expect(response.statusCode).toBe(204);
  });
});
