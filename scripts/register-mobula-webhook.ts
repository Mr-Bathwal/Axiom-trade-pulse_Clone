#!/usr/bin/env tsx
/**
 * Register Webhook with Mobula API
 * 
 * This script registers your ngrok webhook URL with Mobula
 * Run with: npx tsx scripts/register-mobula-webhook.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MOBULA_API_KEY = process.env.MOBULA_API_KEY;
const NGROK_URL = 'https://565529ba71a2.ngrok-free.app/api/broadcast';

// Mobula webhook registration endpoint
const MOBULA_WEBHOOK_ENDPOINT = 'https://api.mobula.io/indexing/stream/webhook';

interface WebhookConfig {
  name: string;
  chainIds: string[];
  events: string[];
  filters?: Record<string, unknown>;
  apiKey: string;
  url: string;
}

async function registerWebhook() {
  console.log('🚀 Registering Webhook with Mobula API');
  console.log('=====================================\n');

  if (!MOBULA_API_KEY) {
    console.error('❌ Error: MOBULA_API_KEY not found in .env.local');
    console.error('Please add: MOBULA_API_KEY=8512c155-07c4-449b-9184-db1bedfac1b7');
    process.exit(1);
  }

  console.log(`📍 Webhook URL: ${NGROK_URL}`);
  console.log(`🔑 API Key: ${MOBULA_API_KEY.substring(0, 8)}...`);
  console.log(`📡 Endpoint: ${MOBULA_WEBHOOK_ENDPOINT}\n`);

  const webhookConfig: WebhookConfig = {
    name: 'Axiom Trade - New Token Alerts',
    chainIds: ['solana:solana'], // Focus on Solana chain
    events: ['swap'], // Listen for swap events (indicates new token activity)
    filters: {
      // You can add filters here based on Mobula's documentation
      // For example: minimum liquidity, minimum volume, etc.
    },
    apiKey: MOBULA_API_KEY,
    url: NGROK_URL,
  };

  try {
    console.log('📤 Sending registration request...\n');
    console.log('Payload:', JSON.stringify(webhookConfig, null, 2));
    console.log('');

    const response = await fetch(MOBULA_WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookConfig),
    });

    const responseText = await response.text();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      console.log('✅ Webhook registered successfully!\n');
      
      try {
        const data = JSON.parse(responseText);
        console.log('Response:', JSON.stringify(data, null, 2));
      } catch {
        console.log('Response:', responseText);
      }

      console.log('\n🎉 Success! Your webhook is now active.');
      console.log('\n📝 Next steps:');
      console.log('  1. Keep your Next.js dev server running (port 3002)');
      console.log('  2. Keep ngrok running');
      console.log('  3. Open http://localhost:3002/pulse');
      console.log('  4. Watch for new tokens to appear automatically!');
      console.log('\n🔍 Monitor webhooks at: http://127.0.0.1:4040 (ngrok UI)');
    } else {
      console.error('❌ Failed to register webhook\n');
      console.error('Response:', responseText);
      
      console.log('\n💡 Troubleshooting:');
      console.log('  - Verify your Mobula API key is correct');
      console.log('  - Check that ngrok is still running');
      console.log('  - Ensure the webhook URL is accessible');
      console.log('  - Review Mobula API documentation for required fields');
      
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error registering webhook:', error);
    console.log('\n💡 Make sure:');
    console.log('  1. You have internet connectivity');
    console.log('  2. ngrok is running and forwarding to localhost:3002');
    console.log('  3. Your Mobula API key is valid');
    process.exit(1);
  }
}

// Run the registration
registerWebhook().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
