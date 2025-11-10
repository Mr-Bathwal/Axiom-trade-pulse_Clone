import { NextResponse } from 'next/server';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

const TOKEN_IDS = [
  'solana',
  'bonk',
  'jupiter-exchange-solana',
  'dogwifcoin',
  'pyth-network',
  'marinade-staked-sol',
  'orca',
  'serum',
  'raydium',
  'step-finance',
  'saber',
  'marinade',
  'cashio-dollar',
  'port-finance',
  'solend',
  'king-of-legends',
  'star-atlas',
  'bonfida',
  'medibloc',
  'samoyedcoin',
  'lux',
  'bash',
  'the-graph',
  'flux-token',
  'nodeai',
];

export async function GET() {
  try {
    const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${TOKEN_IDS.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Minimal type for CoinGecko response we use here
    type CoinGeckoCoin = {
      id: string;
      symbol: string;
      name: string;
      current_price?: number;
      price_change_percentage_24h?: number;
      total_volume?: number;
      market_cap?: number;
      image?: string;
    };

    // Transform to match our Token interface
    // Distribute tokens into three categories for the Pulse view
    const total = (data as CoinGeckoCoin[]).length;
    const tokens = (data as CoinGeckoCoin[]).map((coin, index) => {
      let category: 'new' | 'final-stretch' | 'migrated' = 'migrated';
      if (index < Math.floor(total / 3)) category = 'new';
      else if (index < Math.floor((2 * total) / 3)) category = 'final-stretch';

      return {
        id: String(index + 1),
        symbol: coin.symbol?.toUpperCase() ?? '',
        name: coin.name ?? '',
        price: coin.current_price ?? 0,
        priceChange24h: coin.price_change_percentage_24h ?? 0,
        volume24h: coin.total_volume ?? 0,
        marketCap: coin.market_cap ?? 0,
        liquidity: coin.total_volume ?? 0,
        holders: Math.floor(Math.random() * 100000), // Mock data
        chain: 'solana',
        logo: coin.image ?? '',
        category,
      };
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    
    // Return mock data on error
    const mockTokens = [
      { id: '1', symbol: 'SOL', name: 'Solana', price: 166.88, priceChange24h: 2.11, volume24h: 5430000000, marketCap: 92090000000, liquidity: 1630000000, holders: 50000, chain: 'solana', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', category: 'migrated' },
      { id: '2', symbol: 'JUP', name: 'Jupiter', price: 0.3582, priceChange24h: 0.33, volume24h: 36190000, marketCap: 1140000000, liquidity: 10860000, holders: 30000, chain: 'solana', logo: 'https://assets.coingecko.com/coins/images/10365/small/jupiter.png', category: 'final-stretch' },
      { id: '3', symbol: 'BONK', name: 'Bonk', price: 0.000013, priceChange24h: 1.33, volume24h: 136260000, marketCap: 1090000000, liquidity: 40730000, holders: 25000, chain: 'solana', logo: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg', category: 'new' },
    ];

    return NextResponse.json(mockTokens);
  }
}
