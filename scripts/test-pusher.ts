#!/usr/bin/env tsx
/**
 * Test Pusher WebSocket Connection and Broadcasting
 * 
 * This script tests the complete Pusher flow:
 * 1. Verifies Pusher credentials
 * 2. Broadcasts a test token via API
 * 3. Verifies the broadcast succeeds
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

console.log('🧪 Testing Pusher WebSocket Setup\n');
console.log('═'.repeat(60));

// Check environment variables
console.log('\n1️⃣ Checking Environment Variables...\n');

const requiredEnvVars = [
  'PUSHER_APP_ID',
  'PUSHER_KEY',
  'PUSHER_SECRET',
  'PUSHER_CLUSTER',
  'NEXT_PUBLIC_PUSHER_KEY',
  'NEXT_PUBLIC_PUSHER_CLUSTER'
];

let allEnvVarsPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allEnvVarsPresent = false;
  }
});

if (!allEnvVarsPresent) {
  console.error('\n❌ Some environment variables are missing!');
  console.log('\nPlease add them to .env.local:\n');
  console.log('NEXT_PUBLIC_PUSHER_KEY=2f57459f215265543a03');
  console.log('NEXT_PUBLIC_PUSHER_CLUSTER=ap2');
  console.log('PUSHER_APP_ID=2075655');
  console.log('PUSHER_KEY=2f57459f215265543a03');
  console.log('PUSHER_SECRET=d63521ea02be7278dce9');
  console.log('PUSHER_CLUSTER=ap2');
  process.exit(1);
}

// Test API endpoint
console.log('\n2️⃣ Testing API Endpoints...\n');

async function testAPI() {
  try {
    // Test GET endpoint
    console.log('Testing GET /api/broadcast...');
    const getResponse = await fetch('http://localhost:3002/api/broadcast');
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getData);

    // Test token broadcast
    console.log('\n3️⃣ Broadcasting Test Token via POST...\n');
    
    const testToken = {
      id: `test-${Date.now()}`,
      symbol: 'TEST',
      name: 'Test Token',
      price: 1.23,
      priceChange24h: 5.67,
      volume24h: 1000000,
      marketCap: 50000000,
      liquidity: 300000,
      holders: 1234,
      blockchain: 'solana',
      logo: 'https://via.placeholder.com/32',
      category: 'new'
    };

    console.log('Test token payload:', testToken);
    
    const postResponse = await fetch('http://localhost:3002/api/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: testToken })
    });

    const postData = await postResponse.json();
    
    if (postData.success) {
      console.log('\n✅ Token broadcasted successfully!');
      console.log('Response:', postData);
      console.log('\n🎉 All tests passed! Pusher WebSocket setup is working correctly.');
      console.log('\n📝 Next steps:');
      console.log('   1. Open http://localhost:3002/pulse in your browser');
      console.log('   2. Open the browser console (F12)');
      console.log('   3. You should see: ✅ Connected to Pusher - listening for new tokens...');
      console.log('   4. Run: npm run poller');
      console.log('   5. Watch for new tokens appearing in real-time!');
    } else {
      console.error('\n❌ Failed to broadcast token:', postData);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ API Test Failed:', error);
    console.log('\n💡 Make sure the Next.js dev server is running:');
    console.log('   npm run dev -- -p 3002');
    process.exit(1);
  }
}

testAPI();
