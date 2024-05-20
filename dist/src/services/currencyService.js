"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCurrency = exports.addCurrency = exports.convertCurrency = exports.getLiveRates = void 0;
const axios_1 = __importDefault(require("axios"));
const currencies = [
    { code: 'USD', type: 'FIAT' },
    { code: 'BRL', type: 'FIAT' },
    { code: 'EUR', type: 'FIAT' },
    { code: 'BTC', type: 'CRYPTO' },
    { code: 'ETH', type: 'CRYPTO' },
    { code: 'GOLD', type: 'FICTITIOUS', conversionRateToUSD: 0.1 },
];
const exchangeRateAPI = 'https://v6.exchangerate-api.com/v6/edbc7ce270ca38c586e7b95f/latest/USD';
async function getLiveRates() {
    const response = await axios_1.default.get(exchangeRateAPI);
    return response.data.conversion_rates;
}
exports.getLiveRates = getLiveRates;
async function convertCurrency(from, to, amount) {
    const fromCurrency = currencies.find(c => c.code === from);
    const toCurrency = currencies.find(c => c.code === to);
    if (!fromCurrency || !toCurrency) {
        throw new Error('Unsupported currency');
    }
    const rates = await getLiveRates();
    let fromRate;
    let toRate;
    if (fromCurrency.type === 'FICTITIOUS') {
        fromRate = fromCurrency.conversionRateToUSD;
    }
    else {
        fromRate = rates[fromCurrency.code];
    }
    if (toCurrency.type === 'FICTITIOUS') {
        toRate = toCurrency.conversionRateToUSD;
    }
    else {
        toRate = rates[toCurrency.code];
    }
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;
    return convertedAmount;
}
exports.convertCurrency = convertCurrency;
function addCurrency(code, type, conversionRateToUSD) {
    if (currencies.some(c => c.code === code)) {
        throw new Error('Currency already exists');
    }
    currencies.push({ code, type, conversionRateToUSD });
}
exports.addCurrency = addCurrency;
function removeCurrency(code) {
    const index = currencies.findIndex(c => c.code === code);
    if (index === -1) {
        throw new Error('Currency not found');
    }
    currencies.splice(index, 1);
}
exports.removeCurrency = removeCurrency;
