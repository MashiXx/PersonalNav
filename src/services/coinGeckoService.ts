interface PriceData {
  [coinId: string]: {
    usd: number;
  };
}

export class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private lastRequestTime = 0;
  private minRequestInterval = 2000; // 2 seconds between requests

  private async rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    const apiKey = process.env.COINGECKO_API_KEY;
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    return fetch(url, { headers });
  }

  async getPrice(coinId: string): Promise<number | null> {
    try {
      const url = `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`;
      const response = await this.rateLimitedFetch(url);

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as PriceData;

      if (data[coinId] && data[coinId].usd !== undefined) {
        return data[coinId].usd;
      }

      return null;
    } catch (error) {
      console.error('Error fetching price from CoinGecko:', error);
      return null;
    }
  }

  async getPrices(coinIds: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    if (coinIds.length === 0) {
      return prices;
    }

    try {
      const ids = coinIds.join(',');
      const url = `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd`;
      const response = await this.rateLimitedFetch(url);

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status}`);
        return prices;
      }

      const data = (await response.json()) as PriceData;

      for (const coinId of coinIds) {
        if (data[coinId] && data[coinId].usd !== undefined) {
          prices.set(coinId, data[coinId].usd);
        }
      }

      return prices;
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      return prices;
    }
  }
}
