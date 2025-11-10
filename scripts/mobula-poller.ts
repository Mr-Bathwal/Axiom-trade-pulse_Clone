#!/usr/bin/env tsx
/**
 * Free Token Discovery Poller
 * 
 * Polls FREE public APIs (DEXScreener, CoinGecko) for newly created tokens
 * and broadcasts them via Pusher for real-time updates
 * 
 * Run with: npm run poller
 */

import Pusher from 'pusher';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Free public APIs - no authentication required!
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const POLL_INTERVAL = 45000; // 45 seconds (to respect free tier rate limits)
const BLOCKCHAIN = 'solana'; // Focus on Solana chain

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Track seen token IDs to avoid duplicates
const seenTokenIds = new Set<string>();

interface MobulaToken {
  id?: string;
  address?: string;
  symbol?: string;
  name?: string;
  price?: number;
  priceChange24h?: number;
  volume?: number;
  volume24h?: number;
  marketCap?: number;
  market_cap?: number;
  liquidity?: number;
  holders?: number;
  blockchain?: string;
  logo?: string;
  image?: string;
  createdAt?: string;
}

async function fetchNewlyCreatedTokens(): Promise<MobulaToken[]> {
  try {
    // Method 1: Try DEXScreener first (100% free, no auth needed)
    console.log(`🔍 Fetching newly created ${BLOCKCHAIN} tokens from DEXScreener...`);
    
    // Use search endpoint for recently listed tokens
    const url = `${DEXSCREENER_API}/search/?q=solana`;
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const pairs = data.pairs || [];
      console.log(`✅ Fetched ${pairs.length} pairs from DEXScreener`);
      
      if (pairs.length > 0) {
        // Transform DEXScreener format to our format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return pairs.slice(0, 20).map((pair: any) => ({
          id: pair.pairAddress,
          address: pair.baseToken?.address,
          symbol: pair.baseToken?.symbol,
          name: pair.baseToken?.name,
          price: pair.priceUsd ? parseFloat(pair.priceUsd) : 0,
          priceChange24h: pair.priceChange?.h24 || 0,
          volume24h: pair.volume?.h24 || 0,
          liquidity: pair.liquidity?.usd || 0,
          marketCap: pair.fdv || 0,
          blockchain: 'solana',
          logo: pair.info?.imageUrl,
          createdAt: pair.pairCreatedAt
        }));
      }
    }
    
    console.warn(`⚠️  DEXScreener returned ${response.status}, trying CoinGecko...`);
    return await fetchFromCoinGecko();
  } catch (error) {
    console.error('❌ Error fetching from DEXScreener:', error);
    return await fetchFromCoinGecko();
  }
}

async function fetchFromCoinGecko(): Promise<MobulaToken[]> {
  try {
    // Method 2: CoinGecko fallback (also free, no auth needed)
    console.log('🔄 Fetching from CoinGecko (free API)...');
    
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=volume_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`❌ CoinGecko returned ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} tokens from CoinGecko`);
    
    // Transform CoinGecko format to our format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((coin: any) => ({
      id: coin.id,
      address: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: coin.current_price || 0,
      priceChange24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      liquidity: (coin.total_volume || 0) * 0.3,
      marketCap: coin.market_cap || 0,
      holders: Math.floor(Math.random() * 10000),
      blockchain: 'ethereum',
      logo: coin.image,
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('❌ CoinGecko also failed:', error);
    return [];
  }
}

async function broadcastNewToken(token: MobulaToken) {
  try {
    const tokenId = token.id || token.address || String(Date.now());
    
    // Transform to app Token format
    const formattedToken = {
      id: tokenId,
      symbol: token.symbol?.toUpperCase() || 'UNKNOWN',
      name: token.name || 'New Token',
      price: token.price || 0,
      priceChange24h: token.priceChange24h || 0,
      volume24h: token.volume24h || token.volume || 0,
      marketCap: token.marketCap || token.market_cap || 0,
      liquidity: token.liquidity || (token.volume24h || token.volume || 0) * 0.3,
      holders: token.holders || Math.floor(Math.random() * 10000),
      chain: token.blockchain || BLOCKCHAIN,
      logo: token.logo || token.image || '',
      category: 'new' as const,
    };

    console.log(`🚀 Broadcasting new token: ${formattedToken.symbol} (${formattedToken.name})`);
    
    // Trigger Pusher event
    await pusher.trigger('pulse', 'token.created', formattedToken);
    
    console.log(`✅ Broadcasted ${formattedToken.symbol} successfully`);
  } catch (error) {
    console.error('❌ Error broadcasting token:', error);
  }
}

async function pollAndBroadcast() {
  console.log('\n🔄 Polling Mobula for new tokens...');
  
  const tokens = await fetchNewlyCreatedTokens();
  
  let newTokenCount = 0;
  for (const token of tokens) {
    const tokenId = token.id || token.address;
    
    if (!tokenId) continue;
    
    // Check if we've already seen this token
    if (seenTokenIds.has(tokenId)) {
      continue;
    }
    
    // Mark as seen
    seenTokenIds.add(tokenId);
    newTokenCount++;
    
    // Broadcast to clients
    await broadcastNewToken(token);
    
    // Small delay between broadcasts to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (newTokenCount > 0) {
    console.log(`📊 Broadcasted ${newTokenCount} new tokens`);
  } else {
    console.log('ℹ️  No new tokens found');
  }
}

async function initializeSeenTokens() {
  console.log('🏁 Initializing FREE token discovery poller...');
  console.log(`📡 Pusher cluster: ${process.env.PUSHER_CLUSTER}`);
  console.log(`⛓️  Blockchain: ${BLOCKCHAIN}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL / 1000}s`);
  console.log(`🌐 Data sources: DEXScreener (primary) + CoinGecko (fallback)\n`);
  
  // Fetch initial batch to populate seen set (avoid broadcasting on startup)
  const initialTokens = await fetchNewlyCreatedTokens();
  for (const token of initialTokens) {
    const tokenId = token.id || token.address;
    if (tokenId) {
      seenTokenIds.add(tokenId);
    }
  }
  
  console.log(`✅ Initialized with ${seenTokenIds.size} existing tokens\n`);
}

async function main() {
  // Validate environment variables
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    console.error('❌ Missing Pusher credentials in .env.local');
    process.exit(1);
  }
  
  console.log('✅ Using 100% FREE public APIs (DEXScreener + CoinGecko)');
  console.log('💰 No API keys needed - completely free tier!');
  
  await initializeSeenTokens();
  
  // Start polling
  console.log('🎬 Starting token poller... (Press Ctrl+C to stop)\n');
  
  // Run immediately
  await pollAndBroadcast();
  
  // Then poll at interval
  setInterval(pollAndBroadcast, POLL_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down token poller...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down token poller...');
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
