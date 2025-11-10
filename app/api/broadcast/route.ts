import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// Initialize Pusher server instance
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Broadcast API is working! Use POST to receive webhooks.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Broadcast GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📨 Received webhook from Mobula:', JSON.stringify(body, null, 2));

    // Extract token data from Mobula webhook payload
    // Mobula webhook structure may vary - adapt based on actual payload
    const tokenData = body.data || body;
    
    // Transform to your Token interface format
    const token = {
      id: tokenData.id || tokenData.address || String(Date.now()),
      symbol: tokenData.symbol?.toUpperCase() || 'UNKNOWN',
      name: tokenData.name || 'New Token',
      price: tokenData.price || 0,
      priceChange24h: tokenData.priceChange24h || 0,
      volume24h: tokenData.volume24h || tokenData.volume || 0,
      marketCap: tokenData.marketCap || tokenData.market_cap || 0,
      liquidity: tokenData.liquidity || (tokenData.volume24h || 0) * 0.3,
      holders: tokenData.holders || Math.floor(Math.random() * 10000),
      chain: tokenData.blockchain || tokenData.chain || 'solana',
      logo: tokenData.logo || tokenData.image || '',
      category: 'new' as const, // New tokens go to "New Pairs"
    };

    console.log('🚀 Broadcasting new token to Pusher:', token.symbol);

    // Trigger Pusher event to all connected clients
    await pusher.trigger('pulse', 'token.created', token);

    return NextResponse.json({
      success: true,
      message: 'Token broadcasted successfully',
      token: token.symbol,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Broadcast POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to broadcast', details: String(error) },
      { status: 500 }
    );
  }
}
