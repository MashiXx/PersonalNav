export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  rateToVND: number;
}

export const currencies: CurrencyConfig[] = [
  { code: 'VND', name: 'Dong Viet Nam', symbol: '₫', locale: 'vi-VN', rateToVND: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', rateToVND: 25000 },
];

export function getCurrencies(): CurrencyConfig[] {
  return currencies;
}

export function convertToVND(amount: number, currencyCode: string): number {
  const currency = currencies.find(c => c.code === currencyCode);
  const rate = currency ? currency.rateToVND : 1;
  return amount * rate;
}

export function formatByCurrency(value: number, currencyCode: string): string {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code }).format(value);
}
