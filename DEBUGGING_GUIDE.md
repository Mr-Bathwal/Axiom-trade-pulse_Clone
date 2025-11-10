# 🔍 Pusher WebSocket Debugging Guide

## Quick Reference for Console Messages

### ✅ Good Messages (Everything Working)

```
🔑 Pusher credentials: { key: '...', cluster: 'ap2' }
🔄 Connecting to Pusher...
📊 Subscriber count: 1
📡 Subscribing to "pulse" channel...
✅ Connected to Pusher - listening for new tokens...
✅ Successfully subscribed to "pulse" channel
```

### ⚠️ Warning Messages (Non-Critical)

```
⚠️ Disconnected from Pusher
```

**What it means**: Temporary disconnection, Pusher will auto-reconnect
**Action**: Usually nothing - wait for reconnection

```
⚠️ Pusher connection unavailable
```

**What it means**: Network issues or Pusher is temporarily unreachable
**Action**: Check your internet connection

### ❌ Error Messages (Needs Attention)

```
❌ Pusher connection failed
```

**What it means**: Connection completely failed
**Possible causes**:

- Invalid credentials
- Blocked by firewall
- Network issues
  **Action**: Check environment variables in `.env.local`

```
❌ Failed to subscribe to "pulse" channel
```

**What it means**: Channel subscription failed
**Possible causes**:

- Channel doesn't exist
- Permission issues
  **Action**: Verify channel name is correct in code

```
❌ Pusher error: [error details]
```

**What it means**: Specific error from Pusher
**Action**: Read the error details and Google if needed

## Connection States

Pusher goes through these states:

1. **initialized** → Just created, not yet connecting
2. **connecting** → Attempting to establish WebSocket connection
3. **connected** ✅ → Connected successfully
4. **unavailable** ⚠️ → Connection lost, will retry
5. **failed** ❌ → Connection failed, no more retries
6. **disconnected** → Manually disconnected

You'll see state changes like:

```
🔄 Pusher state: initialized → connecting
🔄 Pusher state: connecting → connected
```

## Troubleshooting Steps

### 1. If No Console Messages Appear

**Problem**: Page loads but no Pusher messages  
**Solution**:

1. Make sure you're on http://localhost:3002/pulse
2. Open console (F12) BEFORE loading the page
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check if `usePusherTokenUpdates()` is being called in `app/pulse/page.tsx`

### 2. If "Connection Failed" Error

**Problem**: `❌ Pusher connection failed`  
**Solution**:

**Step 1**: Verify environment variables

```bash
# Check .env.local has these:
NEXT_PUBLIC_PUSHER_KEY=2f57459f215265543a03
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

**Step 2**: Restart dev server

```bash
# Kill server
taskkill //F //IM node.exe  # Windows
# OR
killall node  # Mac/Linux

# Start fresh
npm run dev -- -p 3002
```

**Step 3**: Clear Next.js cache

```bash
rm -rf .next
npm run dev -- -p 3002
```

**Step 4**: Test credentials with standalone HTML

1. Open `test-pusher-connection.html` in browser
2. If this works but Next.js doesn't → env var issue
3. If this fails too → credential issue

### 3. If Connection Keeps Dropping

**Problem**: Connects then immediately disconnects  
**Solution**:

**Check subscriber count logs**:

```
📊 Subscriber count: 1
📊 Subscriber count after unmount: 0
```

If you see rapid up/down:

- React Strict Mode is causing double renders
- This is normal in development
- The 100ms grace period should handle it

If it's constantly disconnecting:

- Check network stability
- Verify firewall isn't blocking WebSocket
- Try different network (mobile hotspot to test)

### 4. If Channel Subscription Fails

**Problem**: Connected to Pusher but channel subscription fails  
**Solution**:

Verify in `hooks/use-pusher-updates.ts`:

```typescript
channelInstance = pusherInstance.subscribe("pulse");
```

And in `app/api/broadcast/route.ts`:

```typescript
await pusher.trigger("pulse", "token.created", token);
```

Channel names MUST match exactly!

### 5. If No Tokens Appear

**Problem**: Everything connects but no tokens show up  
**Solution**:

**Step 1**: Test with curl

```bash
curl -X POST http://localhost:3002/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{"data":{"symbol":"TEST","name":"Test Token"}}'
```

**Step 2**: Check console for token received message

```
🆕 New token received via Pusher: TEST Test Token
```

**Step 3**: Check Redux

- Open Redux DevTools
- Look for `tokens/addNewToken` action
- Verify token is being added to state

**Step 4**: Check if component is filtering

- Open `app/pulse/page.tsx`
- Verify `category: 'new'` tokens appear in correct column
- Check useMemo filters

## Testing Commands

### Test API Endpoint

```bash
# Test GET
curl http://localhost:3002/api/broadcast

# Expected: {"success":true,"message":"Broadcast API is working!..."}
```

### Test Broadcasting

```bash
# Broadcast test token
curl -X POST http://localhost:3002/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{"data":{"symbol":"TEST","name":"Test Token","price":1.0,"category":"new"}}'

# Expected: {"success":true,"message":"Token broadcasted successfully"...}
```

### Test Token API

```bash
# Get tokens
curl http://localhost:3002/api/tokens | head -c 500

# Expected: [{"id":"1","symbol":"SOL"...}]
```

### Run Automated Test

```bash
npm run test-pusher
```

### Run Token Poller

```bash
npm run poller
```

## Environment Check

Run this in Node.js to verify environment variables:

```javascript
console.log({
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  PUSHER_APP_ID: process.env.PUSHER_APP_ID,
  PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
});
```

Or check in browser console:

```javascript
console.log({
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});
```

## Pusher Dashboard

Check your Pusher dashboard: https://dashboard.pusher.com/

1. Go to your app (ID: 2075655)
2. Click "Debug Console"
3. You should see:
   - Connection events
   - Channel subscriptions
   - Messages being triggered

## Network Tab

Open Chrome DevTools → Network → WS (WebSockets):

**Good**:

- Status: 101 Switching Protocols
- Type: websocket
- Name: ws-ap2.pusher.com

**Bad**:

- Status: Failed
- Error message in red

Click on the WebSocket connection to see:

- **Messages**: All Pusher protocol messages
- **Timing**: Connection establishment time
- **Frames**: Raw WebSocket frames

## Common Issues & Solutions

| Symptom                  | Cause              | Solution                                     |
| ------------------------ | ------------------ | -------------------------------------------- |
| No console logs          | Hook not running   | Check if `usePusherTokenUpdates()` is called |
| "Invalid key"            | Wrong credentials  | Verify `.env.local`                          |
| CORS errors              | API route issue    | All APIs should go through `/api/*`          |
| Connection timeout       | Firewall/Network   | Check firewall, try different network        |
| Rapid connect/disconnect | React Strict Mode  | Normal in dev, won't happen in prod          |
| Channel not found        | Name mismatch      | Verify channel names match in client/server  |
| Token not showing        | Redux/Filter issue | Check Redux DevTools & component filters     |

## Quick Health Check

Run these commands in sequence:

```bash
# 1. Check server is running
curl http://localhost:3002/api/tokens | head -c 100

# 2. Check broadcast API
curl http://localhost:3002/api/broadcast

# 3. Test broadcasting
curl -X POST http://localhost:3002/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{"data":{"symbol":"TEST","name":"Test"}}'

# 4. Check environment
cat .env.local | grep PUSHER
```

All should succeed with 200 status!

## Support

If you've tried everything and it's still not working:

1. **Check Pusher Status**: https://status.pusher.com/
2. **Check Pusher Logs**: Dashboard → Debug Console
3. **Enable Pusher Logging**: Already enabled in dev mode
4. **Check Browser Console**: Look for any JavaScript errors
5. **Check Network Tab**: Look for failed WebSocket connections

---

**With all the logging now in place, you should have full visibility into what's happening with Pusher!** 🔍
