import axios from 'axios';

export type CurrencyType = 'FIAT' | 'CRYPTO' | 'FICTITIOUS';

interface Currency {
  code: string;
  type: CurrencyType;
  conversionRateToUSD?: number;
}

interface Rates {
  [key: string]: { code: string; type: CurrencyType; unitToUSD: number };
}

let currencies: Currency[] = [];
let fiatRates: Rates = {};
let cryptoRates: Rates = {};
let symbolToIdMap: { [key: string]: string } = {};

const exchangeRateAPI = 'https://v6.exchangerate-api.com/v6/edbc7ce270ca38c586e7b95f/latest/USD';
const coinPriceGeckoAPI = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
const symbolCoinGeckoAPI = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc';

export async function initializeRates() {
  try {
    // Fetch FIAT rates
    const fiatResponse = await axios.get(exchangeRateAPI);
    const fiatRatesData = fiatResponse.data.conversion_rates;
    fiatRates = Object.keys(fiatRatesData).reduce((acc, code) => {
      acc[code] = { code, type: 'FIAT' as CurrencyType, unitToUSD: fiatRatesData[code] };
      return acc;
    }, {} as Rates);

    // Fetch symbol to ID mapping for CRYPTO
    const symbolResponse = await axios.get(symbolCoinGeckoAPI);
    const symbolData = symbolResponse.data;
    symbolToIdMap = symbolData.reduce((acc: { [key: string]: string }, item: { id: string; symbol: string }) => {
      acc[item.symbol.toUpperCase()] = item.id;
      return acc;
    }, {});

    // Fetch CRYPTO rates using the symbol to ID mapping
    const cryptoSymbols = Object.values(symbolToIdMap).join(',');
    const cryptoResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbols}&vs_currencies=usd`);
    const cryptoRatesData = cryptoResponse.data;

    cryptoRates = Object.keys(symbolToIdMap).reduce((acc, symbol) => {
      const id = symbolToIdMap[symbol];
      if (cryptoRatesData[id] && cryptoRatesData[id].usd !== undefined) {
        acc[symbol] = { code: symbol, type: 'CRYPTO' as CurrencyType, unitToUSD: cryptoRatesData[id].usd };
      }
      return acc;
    }, {} as Rates);

    currencies = [
      { code: 'USD', type: 'FIAT' as CurrencyType, conversionRateToUSD: fiatRates['USD']?.unitToUSD },
      { code: 'BRL', type: 'FIAT' as CurrencyType, conversionRateToUSD: fiatRates['BRL']?.unitToUSD },
      { code: 'EUR', type: 'FIAT' as CurrencyType, conversionRateToUSD: fiatRates['EUR']?.unitToUSD },
      { code: 'BTC', type: 'CRYPTO' as CurrencyType, conversionRateToUSD: cryptoRates['BTC']?.unitToUSD },
      { code: 'ETH', type: 'CRYPTO' as CurrencyType, conversionRateToUSD: cryptoRates['ETH']?.unitToUSD }
    ].filter(currency => currency.conversionRateToUSD !== undefined);

  } catch (error) {
    throw new Error('Failed to initialize rates');
  }
}

export async function convertCurrency(from: string, to: string, amount: number): Promise<string> {
  const fromCurrency = currencies.find(c => c.code === from);
  const toCurrency = currencies.find(c => c.code === to);

  if (!fromCurrency || !toCurrency) {
    throw new Error('Unsupported currency');
  }

  let fromRate: number;
  let toRate: number;

  if (fromCurrency.type === 'FICTITIOUS') {
    fromRate = fromCurrency.conversionRateToUSD!;
  } else if (fiatRates[fromCurrency.code]) {
    fromRate = fiatRates[fromCurrency.code].unitToUSD;
  } else {
    fromRate = cryptoRates[fromCurrency.code].unitToUSD;
  }

  if (toCurrency.type === 'FICTITIOUS') {
    toRate = toCurrency.conversionRateToUSD!;
  } else if (fiatRates[toCurrency.code]) {
    toRate = fiatRates[toCurrency.code].unitToUSD;
  } else {
    toRate = cryptoRates[toCurrency.code].unitToUSD;
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

  if (type === 'FICTITIOUS') {
    if (!conversionRateToUSD) {
      throw new Error('Conversion rate to USD is required for fictitious currencies');
    }
    currencies.push({ code, type, conversionRateToUSD });
    return;
  }

  if (type === 'FIAT') {
    if (!fiatRates[code]) {
      // Fetch updated FIAT rates
      const fiatResponse = await axios.get(exchangeRateAPI);
      const fiatRatesData = fiatResponse.data.conversion_rates;
      fiatRates = Object.keys(fiatRatesData).reduce((acc, fiatCode) => {
        acc[fiatCode] = { code: fiatCode, type: 'FIAT', unitToUSD: fiatRatesData[fiatCode] };
        return acc;
      }, {} as Rates);

      console.log("Updated fiatRates", fiatRates);

      if (!fiatRates[code]) {
        throw new Error('Unable to find conversion rate for the given FIAT code');
      }
    }

    conversionRateToUSD = fiatRates[code].unitToUSD;
    currencies.push({ code, type, conversionRateToUSD });
    return;
  }

  if (type === 'CRYPTO') {
    if (!cryptoRates[code]) {
      // Fetch symbol to ID mapping for CRYPTO
      const symbolResponse = await axios.get(symbolCoinGeckoAPI);
      const symbolData = symbolResponse.data;
      symbolToIdMap = symbolData.reduce((acc: { [key: string]: string }, item: { id: string; symbol: string }) => {
        acc[item.symbol.toUpperCase()] = item.id;
        return acc;
      }, {});

      console.log("Updated symbolToIdMap", symbolToIdMap);

      const cryptoId = symbolToIdMap[code];
      if (!cryptoId) {
        throw new Error('Unable to find ID for the given CRYPTO symbol');
      }

      // Fetch updated CRYPTO rates
      const cryptoResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
      const cryptoRatesData = cryptoResponse.data;

      if (!cryptoRatesData[cryptoId] || cryptoRatesData[cryptoId].usd === undefined) {
        throw new Error('Unable to find conversion rate for the given CRYPTO code');
      }

      cryptoRates[code] = { code, type: 'CRYPTO', unitToUSD: cryptoRatesData[cryptoId].usd };
      console.log("Updated cryptoRates", cryptoRates);
    }

    conversionRateToUSD = cryptoRates[code].unitToUSD;
    currencies.push({ code, type, conversionRateToUSD });
  }
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
    if (fiatRates[code]) {
      conversionRateToUSD = fiatRates[code].unitToUSD;
    } else if (cryptoRates[code]) {
      conversionRateToUSD = cryptoRates[code].unitToUSD;
    } else {
      throw new Error(`Unable to find conversion rate for ${code}`);
    }
  }

  return {
    code: currency.code,
    type: currency.type,
    unit: `${conversionRateToUSD} USD`
  };
}

export async function getAllCurrencies(): Promise<{ code: string; type: CurrencyType; unit: string }[]> {
  return currencies.map(currency => {
    let conversionRateToUSD = currency.conversionRateToUSD;

    if (currency.type !== 'FICTITIOUS') {
      if (fiatRates[currency.code]) {
        conversionRateToUSD = fiatRates[currency.code].unitToUSD;
      } else if (cryptoRates[currency.code]) {
        conversionRateToUSD = cryptoRates[currency.code].unitToUSD;
      } else {
        throw new Error(`Unable to find conversion rate for ${currency.code}`);
      }
    }

    return {
      code: currency.code,
      type: currency.type,
      unit: `${conversionRateToUSD} USD`
    };
  });
}

initializeRates().catch(error => console.error(error));
