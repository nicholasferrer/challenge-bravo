import axios from 'axios';

export type CurrencyType = 'FIAT' | 'CRYPTO' | 'FICTITIOUS';

interface Currency {
  code: string;
  type: CurrencyType;
  conversionRateToUSD?: number;
}

let currencies: Currency[] = [];

export function initializeCurrencies() {
  currencies = [
    { code: 'USD', type: 'FIAT' },
    { code: 'BRL', type: 'FIAT' },
    { code: 'EUR', type: 'FIAT' },
    { code: 'BTC', type: 'CRYPTO' },
    { code: 'ETH', type: 'CRYPTO' }
  ];
}

const exchangeRateAPI = 'https://v6.exchangerate-api.com/v6/edbc7ce270ca38c586e7b95f/latest/USD';

export async function getLiveRates() {
  try {
    const response = await axios.get(exchangeRateAPI);
    return response.data.conversion_rates;
  } catch (error) {
    throw new Error('Failed to fetch live rates');
  }
}

export async function convertCurrency(from: string, to: string, amount: number): Promise<number> {
  const fromCurrency = currencies.find(c => c.code === from);
  const toCurrency = currencies.find(c => c.code === to);

  if (!fromCurrency || !toCurrency) {
    throw new Error('Unsupported currency');
  }

  const rates = await getLiveRates();

  let fromRate: number;
  let toRate: number;

  if (fromCurrency.type === 'FICTITIOUS') {
    fromRate = fromCurrency.conversionRateToUSD!;
  } else {
    fromRate = rates[fromCurrency.code];
  }

  if (toCurrency.type === 'FICTITIOUS') {
    toRate = toCurrency.conversionRateToUSD!;
  } else {
    toRate = rates[toCurrency.code];
  }

  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return convertedAmount;
}

export function addCurrency(code: string, type: CurrencyType, conversionRateToUSD?: number) {
  console.log(`Adding currency: ${code}, type: ${type}, conversionRateToUSD: ${conversionRateToUSD}`);

  if (currencies.some(c => c.code === code)) {
    throw new Error('Currency already exists');
  }
  currencies.push({ code, type, conversionRateToUSD });
}

export function removeCurrency(code: string) {
  const index = currencies.findIndex(c => c.code === code);
  if (index === -1) {
    throw new Error('Currency not found');
  }
  currencies.splice(index, 1);
}

export function clearCurrencies() {
  currencies = [];
}
