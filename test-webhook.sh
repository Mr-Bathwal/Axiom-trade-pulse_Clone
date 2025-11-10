#!/bin/bash
# Quick test script to simulate a Mobula webhook
# Usage: ./test-webhook.sh

WEBHOOK_URL="https://565529ba71a2.ngrok-free.app/api/broadcast"

echo "🧪 Testing Mobula Webhook Integration"
echo "======================================"
echo ""
echo "📍 Webhook URL: $WEBHOOK_URL"
echo ""

# Test 1: Health check
echo "Test 1: Health Check (GET)"
echo "--------------------------"
curl -s "$WEBHOOK_URL" | jq '.'
echo ""

# Test 2: Simulate new token webhook
echo "Test 2: New Token Webhook (POST)"
echo "--------------------------------"
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "id": "test-token-' $(date +%s) '",
      "symbol": "MOON",
      "name": "Moon Token",
      "price": 0.0001234,
      "priceChange24h": 150.5,
      "volume24h": 5000000,
      "marketCap": 25000000,
      "liquidity": 1500000,
      "holders": 8500,
      "blockchain": "solana",
      "logo": "https://example.com/moon.png"
    }
  }' | jq '.'
echo ""

echo "✅ Test complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Check your browser console at http://localhost:3002/pulse"
echo "  2. You should see: '🆕 New token received via Pusher: MOON'"
echo "  3. The token should appear in the 'New Pairs' column"
echo ""
echo "🔍 Monitor webhooks in ngrok UI: http://127.0.0.1:4040"
