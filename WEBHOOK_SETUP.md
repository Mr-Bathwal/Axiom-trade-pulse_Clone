# 🚀 Mobula Webhook Integration - Real-Time Token Updates

This integration enables your Axiom Trade app to receive real-time notifications when new tokens are listed, just like the original Axiom Trade platform.

## 🎯 What's Included

1. **Webhook Endpoint** (`/api/broadcast`) - Receives webhooks from Mobula
2. **Token Poller** - Polls Mobula API for newly created tokens
3. **Pusher Integration** - Broadcasts new tokens to all connected clients in real-time
4. **Client Subscription** - Automatically updates the Pulse page when new tokens appear

## 📋 Prerequisites

- Node.js 18+ installed
- ngrok installed (for local webhook testing)
- Pusher account (free tier works fine)
- Your Next.js dev server running

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:

- `tsx` - TypeScript runner for the poller script
- `dotenv` - Environment variable loader
- Other dependencies already in package.json

### 2. Environment Variables

Your `.env.local` already has Pusher credentials:

```env
# Pusher Configuration (Server-side)
PUSHER_APP_ID=2075655
PUSHER_KEY=2f57459f215265543a03
PUSHER_SECRET=d63521ea02be7278dce9
PUSHER_CLUSTER=ap2

# Pusher Configuration (Client-side)
NEXT_PUBLIC_PUSHER_KEY=2f57459f215265543a03
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

✅ These are already configured and ready to use!

### 3. Start Your Development Server

```bash
npm run dev
# Or specify port
npx next dev -p 3002
```

### 4. Setup ngrok Tunnel (for Mobula Webhooks)

In a **new terminal**, start ngrok:

```bash
ngrok http 3002
```

You'll see output like:

```
Forwarding: https://565529ba71a2.ngrok-free.app -> http://localhost:3002
```

**Your webhook URL is:**

```
https://565529ba71a2.ngrok-free.app/api/broadcast
```

### 5. Configure Mobula Webhook

Go to Mobula Dashboard and register your webhook:

- **Webhook URL**: `https://565529ba71a2.ngrok-free.app/api/broadcast`
- **Events**: Select "New Token Listed" or similar
- **Method**: POST
- **Content-Type**: application/json

### 6. Start the Token Poller (Optional)

The poller actively fetches newly created tokens from Mobula API:

```bash
npm run poller
```

This will:

- Poll Mobula API every 30 seconds for newly created tokens
- Dedupe tokens to avoid broadcasting duplicates
- Push new tokens to all connected clients via Pusher

**Note:** The poller is **optional** if you're using Mobula webhooks. Use it as a backup or for more frequent updates.

## 🧪 Testing

### Test the Webhook Endpoint

```bash
# Test GET (health check)
curl https://565529ba71a2.ngrok-free.app/api/broadcast

# Test POST (simulate Mobula webhook)
curl -X POST https://565529ba71a2.ngrok-free.app/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "id": "test-token-123",
      "symbol": "TEST",
      "name": "Test Token",
      "price": 1.23,
      "priceChange24h": 5.67,
      "volume24h": 1000000,
      "marketCap": 50000000,
      "liquidity": 300000,
      "blockchain": "solana",
      "logo": "https://example.com/logo.png"
    }
  }'
```

### Monitor Incoming Webhooks

Open the ngrok web interface in your browser:

```
http://127.0.0.1:4040
```

This shows all incoming requests, their payloads, and responses - perfect for debugging!

### Check Browser Console

Open your Pulse page (`http://localhost:3002/pulse`) and check the browser console:

- You should see: `🔌 Connected to Pusher - listening for new tokens...`
- When a token arrives: `🆕 New token received via Pusher: TEST Test Token`

## 📁 File Structure

```
axiom-trade-clone/
├── app/
│   └── api/
│       └── broadcast/
│           └── route.ts           # Webhook endpoint (handles Mobula POSTs)
├── scripts/
│   └── mobula-poller.ts          # Background poller for new tokens
├── hooks/
│   └── use-pusher-updates.ts     # Client-side Pusher subscription
├── store/
│   └── tokensSlice.ts            # Redux store with addNewToken action
└── app/
    └── pulse/
        └── page.tsx              # Pulse page (wired to receive live updates)
```

## 🔄 How It Works

### Architecture Flow

```
Mobula API
    ↓
[Webhook POST] → /api/broadcast
    ↓
Transform to Token format
    ↓
Pusher.trigger('pulse', 'token.created')
    ↓
Pusher Cloud
    ↓
[WebSocket] → Client Browser
    ↓
usePusherTokenUpdates() hook
    ↓
dispatch(addNewToken(token))
    ↓
Redux Store Updated
    ↓
Pulse Page Re-renders with New Token
```

### Alternative: Polling Flow

```
scripts/mobula-poller.ts
    ↓
Fetch Mobula /api/1/market/query/tokens?sortBy=createdAt
    ↓
Dedupe new tokens
    ↓
Pusher.trigger('pulse', 'token.created')
    ↓
[Same as above...]
```

## 🛠️ Customization

### Change Poll Interval

Edit `scripts/mobula-poller.ts`:

```typescript
const POLL_INTERVAL = 30000; // 30 seconds (change this)
```

### Filter Tokens by Chain

Edit `scripts/mobula-poller.ts`:

```typescript
const BLOCKCHAIN = "solana"; // Change to 'ethereum', 'bsc', etc.
```

### Adjust Token Categories

New tokens default to `category: 'new'` (appear in "New Pairs" column).

To customize, edit `app/api/broadcast/route.ts`:

```typescript
const token = {
  // ...
  category: "new" as const, // Change to 'final-stretch' or 'migrated'
};
```

## 🐛 Troubleshooting

### No tokens appearing in Pulse page?

1. Check browser console for Pusher connection messages
2. Verify `.env.local` has correct Pusher keys
3. Test webhook with curl (see Testing section)
4. Check ngrok is forwarding correctly (visit http://127.0.0.1:4040)

### Poller not starting?

```bash
# Check environment variables
cat .env.local | grep PUSHER

# Run with verbose logging
npm run poller
```

### Pusher connection errors?

- Verify `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` in `.env.local`
- Check Pusher dashboard for connection logs
- Ensure Pusher cluster matches (yours is `ap2`)

### Webhook receiving 502/404?

- Ensure Next.js dev server is running on the same port as ngrok
- Verify the webhook URL path is `/api/broadcast`
- Check ngrok forwarding status

## 🚀 Production Deployment

For production:

1. **Replace ngrok** with a permanent domain
2. **Update webhook URL** in Mobula dashboard
3. **Run poller as a service** (PM2, systemd, or Docker)
4. **Use Redis** for distributed token deduping
5. **Add rate limiting** to webhook endpoint
6. **Monitor Pusher usage** and upgrade plan if needed

### Running Poller in Production

```bash
# Using PM2
pm2 start npm --name "mobula-poller" -- run poller
pm2 save
pm2 startup

# Using systemd
sudo nano /etc/systemd/system/mobula-poller.service
# [Add service configuration]
sudo systemctl enable mobula-poller
sudo systemctl start mobula-poller
```

## 📊 Monitoring

### Check Active Connections

Visit Pusher Dashboard to see:

- Connected clients
- Messages sent
- Connection errors

### Server Logs

```bash
# Next.js server logs
npm run dev

# Poller logs
npm run poller
```

Look for:

- `🚀 Broadcasting new token: SYMBOL`
- `✅ Broadcasted SYMBOL successfully`
- `🆕 New token received via Pusher: SYMBOL`

## 🎉 Success Indicators

When everything works:

1. ✅ Poller logs show tokens being fetched and broadcast
2. ✅ Browser console shows Pusher connection and token events
3. ✅ New tokens appear instantly in "New Pairs" column
4. ✅ ngrok web UI shows incoming webhook POSTs with 200 responses

## 💡 Next Steps

- Add visual notification toasts when tokens arrive
- Implement token filtering by chain/price/volume
- Add historical token discovery analytics
- Build admin dashboard to manage webhooks
- Add Telegram/Discord bot notifications

---

**Need help?** Check the logs, test with curl, and monitor the ngrok web UI at http://127.0.0.1:4040
