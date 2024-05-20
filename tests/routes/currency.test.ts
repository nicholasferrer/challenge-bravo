import fastify, { FastifyInstance } from 'fastify';
import app from '../../src/app';

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
        code: 'GTA1',
        type: 'fictitious',
        conversionRateToUSD: 0.1
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('code', 'GTA1');
  });

  it('should remove a currency', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: '/currencies/GTA1'
    });

    expect(response.statusCode).toBe(204);
  });
});
