import axios from 'axios';

export type CurrencyType = 'FIAT' | 'CRYPTO' | 'FICTITIOUS';

interface Currency {
  code: string;
  type: CurrencyType;
  conversionRateToUSD?: number;
}

interface Rates {
  USD: number;
  BRL: number;
  EUR: number;
  BTC: number;
  ETH: number;
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

const coinGeckoAPI = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,brl,eur';

export async function getLiveRates(): Promise<Rates> {
  try {
    const response = await axios.get(coinGeckoAPI);
    const rates = response.data;
    return {
      USD: 1, // USD is the base currency
      BRL: rates.bitcoin.brl / rates.bitcoin.usd,
      EUR: rates.bitcoin.eur / rates.bitcoin.usd,
      BTC: rates.bitcoin.usd,
      ETH: rates.ethereum.usd
    };
  } catch (error) {
    throw new Error('Failed to fetch live rates');
  }
}

export async function convertCurrency(from: string, to: string, amount: number): Promise<string> {
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
    fromRate = rates[fromCurrency.code as keyof Rates]; // Type assertion
  }

  if (toCurrency.type === 'FICTITIOUS') {
    toRate = toCurrency.conversionRateToUSD!;
  } else {
    toRate = rates[toCurrency.code as keyof Rates]; // Type assertion
  }

  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return `${convertedAmount}`;
}

export async function addCurrency(code: string, type: CurrencyType, conversionRateToUSD?: number) {
  console.log(`Adding currency: ${code}, type: ${type}, conversionRateToUSD: ${conversionRateToUSD}`);

  if (currencies.some(c => c.code === code)) {
    throw new Error('Currency already exists');
  }

  if (type !== 'FICTITIOUS') {
    const rates = await getLiveRates();
    conversionRateToUSD = rates[code as keyof Rates];
  }

  if (type === 'FICTITIOUS' && !conversionRateToUSD) {
    throw new Error('Conversion rate to USD is required for fictitious currencies');
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

export async function getCurrency(code: string): Promise<{ code: string; type: CurrencyType; unit: string } | undefined> {
    const currency = currencies.find(c => c.code === code);
    if (!currency) {
      return undefined;
    }

    let conversionRateToUSD = currency.conversionRateToUSD;

    if (currency.type !== 'FICTITIOUS') {
      const rates = await getLiveRates();
      conversionRateToUSD = rates[code as keyof Rates];
    }

    if (!conversionRateToUSD) {
      throw new Error(`Unable to find conversion rate for ${code}`);
    }

    return {
      code: currency.code,
      type: currency.type,
      unit: `${conversionRateToUSD} USD`
    };
  }

