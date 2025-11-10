#!/bin/bash
# Register Mobula Webhook using curl
# Based on Mobula documentation

MOBULA_API_KEY="8512c155-07c4-449b-9184-db1bedfac1b7"
WEBHOOK_URL="https://565529ba71a2.ngrok-free.app/api/broadcast"

echo "🚀 Registering Webhook with Mobula API"
echo "======================================"
echo ""
echo "📍 Webhook URL: $WEBHOOK_URL"
echo "🔑 API Key: ${MOBULA_API_KEY:0:8}..."
echo ""

# Register webhook
echo "📤 Sending registration request..."
echo ""

curl -X POST 'https://api.mobula.io/indexing/stream/webhook' \
  -H 'Content-Type: application/json' \
  -d "{
    \"name\": \"Axiom Trade - New Token Alerts\",
    \"chainIds\": [\"solana:solana\"],
    \"events\": [\"swap\"],
    \"apiKey\": \"$MOBULA_API_KEY\",
    \"url\": \"$WEBHOOK_URL\"
  }" | jq '.' || echo ""

echo ""
echo ""
echo "✅ Registration attempt complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Check the response above for success/error"
echo "  2. If successful, your webhook is now active"
echo "  3. Keep Next.js server running (port 3002)"
echo "  4. Keep ngrok running"
echo "  5. Open http://localhost:3002/pulse"
echo "  6. Watch for new tokens!"
echo ""
echo "🔍 Monitor incoming webhooks: http://127.0.0.1:4040"
