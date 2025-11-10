import { Token } from '@/store/tokensSlice';

/**
 * Client-side token fetching
 * Uses Next.js API routes to avoid CORS issues with CoinGecko
 */

// Fallback mock data
const MOCK_TOKENS: Token[] = [
  { id: '1', symbol: 'SOL', name: 'Solana', price: 144.32, priceChange24h: 5.23, volume24h: 2450000000, marketCap: 65000000000, liquidity: 1200000000, chain: 'solana', holders: 50000, category: 'migrated', logo: '' },
  { id: '2', symbol: 'BONK', name: 'Bonk', price: 0.000021, priceChange24h: -3.45, volume24h: 125000000, marketCap: 1500000000, liquidity: 45000000, chain: 'solana', holders: 35000, category: 'final-stretch', logo: '' },
  { id: '3', symbol: 'JUP', name: 'Jupiter', price: 0.8506, priceChange24h: 12.34, volume24h: 89000000, marketCap: 950000000, liquidity: 32000000, chain: 'solana', holders: 28000, category: 'migrated', logo: '' },
  { id: '4', symbol: 'WIF', name: 'dogwifhat', price: 2.41, priceChange24h: 8.92, volume24h: 178000000, marketCap: 2200000000, liquidity: 67000000, chain: 'solana', holders: 42000, category: 'new', logo: '' },
  { id: '5', symbol: 'PYTH', name: 'Pyth Network', price: 0.4069, priceChange24h: -1.23, volume24h: 45000000, marketCap: 580000000, liquidity: 23000000, chain: 'solana', holders: 18000, category: 'migrated', logo: '' },
];

export async function fetchTokens(): Promise<Token[]> {
  console.log('📡 fetchTokens called - using API route to avoid CORS');
  
  try {
    // Call our Next.js API route (server-side, no CORS issues)
    const response = await fetch('/api/tokens', {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fetched tokens from API:', data.length, 'tokens');
      return data;
    } else {
      console.warn(`⚠️ API returned ${response.status}, using fallback`);
    }
  } catch (error) {
    console.error('❌ Error fetching tokens from API:', error);
  }
  
  // Fallback to mock data
  console.log('⚠️ Using mock data fallback');
  return MOCK_TOKENS;
}

export function simulatePriceUpdate(token: Token): { price: number; priceChange24h: number } {
  const priceChange = (Math.random() - 0.5) * 0.02;
  const newPrice = token.price * (1 + priceChange);
  const newPriceChange24h = token.priceChange24h + (Math.random() - 0.5) * 0.5;
  
  return { 
    price: newPrice, 
    priceChange24h: newPriceChange24h 
  };
}
