# 🔴 Live Chart Updates Implementation

## Overview

The Axiom Trade Clone now supports **real-time chart updates** using TradingView Lightweight Charts with a custom React hook system. Charts smoothly animate as prices change without flickering or full redraws.

---

## 🎯 How It Works

### Architecture

```
Redux Store (3s updates)
       ↓
useLiveChartData Hook
       ↓
Chart Components (PriceChart, MiniChart)
       ↓
TradingView Lightweight Charts
```

### Data Flow

1. **Redux Updates**: `trading-table.tsx` updates token prices every 3 seconds via `simulatePriceUpdate()`
2. **Hook Detection**: `useLiveChartData` detects price changes with `useEffect`
3. **Data Append**: New price point is added to chart data array
4. **Chart Update**: Chart uses `.update()` method for smooth animation (not `.setData()`)
5. **FIFO Management**: Old data points are removed when `maxDataPoints` is reached

---

## 📦 Components

### 1. `useLiveChartData` Hook

**Location**: `hooks/use-live-chart-data.ts`

**Purpose**: Manages chart data lifecycle with automatic updates

**Props**:

```typescript
interface UseLiveChartDataOptions {
  token: Token; // Token to track
  maxDataPoints?: number; // Max data points (default: 100)
  updateInterval?: number; // Update interval in ms (default: 3000)
  initialDataPoints?: number; // Initial history points (default: 24)
}
```

**Returns**:

```typescript
{
  chartData: ChartDataPoint[];     // Current chart data
  appendDataPoint: (point) => void; // Manually add data point
}
```

**Example**:

```tsx
const { chartData } = useLiveChartData({
  token,
  maxDataPoints: 50,
  initialDataPoints: 24,
});
```

---

### 2. `PriceChart` Component

**Location**: `components/charts/price-chart.tsx`

**Purpose**: Full-featured TradingView chart for detail views

**Props**:

```typescript
interface PriceChartProps {
  data: { time: string; value: number }[];
  width?: number; // Default: 600
  height?: number; // Default: 300
  isPositive?: boolean; // Green (true) or Red (false)
  enableLiveUpdates?: boolean; // Enable smooth updates (default: false)
}
```

**Features**:

- Area chart with gradient fill
- Crosshair for price inspection
- Time scale with zoom/pan
- Dark theme matching Axiom
- Responsive resizing
- **Live updates** when `enableLiveUpdates={true}`

**Example**:

```tsx
<PriceChart
  data={chartData}
  width={800}
  height={400}
  isPositive={token.priceChange24h >= 0}
  enableLiveUpdates={true}
/>
```

---

### 3. `MiniChart` Component

**Location**: `components/charts/mini-chart.tsx`

**Purpose**: Compact chart for token cards

**Props**:

```typescript
interface MiniChartProps {
  data: { time: string; value: number }[];
  width?: number; // Default: 200
  height?: number; // Default: 80
  isPositive?: boolean; // Green/Red coloring
  enableLiveUpdates?: boolean; // Smooth updates (default: false)
}
```

**Features**:

- Minimal UI (no grid, scales, crosshair)
- No interactivity (handleScroll: false)
- Thin line (1.5px)
- Perfect for cards
- **Live updates** when enabled

**Example**:

```tsx
<MiniChart
  data={chartData}
  width={280}
  height={60}
  isPositive={isPositive}
  enableLiveUpdates={true}
/>
```

---

## 🚀 Implementation Examples

### Example 1: Token Card (Pulse Page)

✅ **Already Implemented** in `components/pulse/token-card.tsx`

```tsx
import { MiniChart } from "@/components/charts/mini-chart";
import { useLiveChartData } from "@/hooks/use-live-chart-data";

function TokenCard({ token }: { token: Token }) {
  const { chartData } = useLiveChartData({
    token,
    maxDataPoints: 50,
    initialDataPoints: 24,
  });

  return (
    <MiniChart
      data={chartData}
      enableLiveUpdates={true}
      isPositive={token.priceChange24h >= 0}
    />
  );
}
```

---

### Example 2: Token Detail Modal

```tsx
import { PriceChart } from "@/components/charts/price-chart";
import { useLiveChartData } from "@/hooks/use-live-chart-data";

function TokenDetailModal({ token, isOpen, onClose }) {
  const { chartData } = useLiveChartData({
    token,
    maxDataPoints: 100,
    initialDataPoints: 48, // 48 hours
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{token.name} Price Chart</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <PriceChart
            data={chartData}
            width={800}
            height={400}
            isPositive={token.priceChange24h >= 0}
            enableLiveUpdates={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Example 3: Multiple Timeframes

```tsx
import { useState } from "react";
import { PriceChart } from "@/components/charts/price-chart";
import { useLiveChartData } from "@/hooks/use-live-chart-data";

type Timeframe = "1H" | "24H" | "7D" | "30D";

function MultiTimeframeChart({ token }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("24H");

  const config = {
    "1H": { maxDataPoints: 60, initialDataPoints: 60 },
    "24H": { maxDataPoints: 100, initialDataPoints: 24 },
    "7D": { maxDataPoints: 168, initialDataPoints: 168 },
    "30D": { maxDataPoints: 720, initialDataPoints: 720 },
  };

  const { chartData } = useLiveChartData({
    token,
    ...config[timeframe],
  });

  return (
    <div>
      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-4">
        {(["1H", "24H", "7D", "30D"] as Timeframe[]).map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? "default" : "outline"}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <PriceChart data={chartData} enableLiveUpdates={true} />
    </div>
  );
}
```

---

### Example 4: Manual Data Control

```tsx
function ManualUpdateChart({ token }) {
  const { chartData, appendDataPoint } = useLiveChartData({
    token,
    maxDataPoints: 100,
  });

  const simulatePriceSpike = () => {
    appendDataPoint({
      time: new Date().toISOString(),
      value: token.price * 1.05, // +5% spike
    });
  };

  return (
    <div>
      <PriceChart data={chartData} enableLiveUpdates={true} />
      <Button onClick={simulatePriceSpike}>Simulate +5% Price Spike</Button>
    </div>
  );
}
```

---

## 🔌 WebSocket Integration (Future)

### Pusher WebSocket Example

```tsx
import { useEffect } from "react";
import Pusher from "pusher-js";

function WebSocketChart({ token }) {
  const { chartData, appendDataPoint } = useLiveChartData({ token });

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`token-${token.id}`);

    channel.bind("price-update", (data) => {
      appendDataPoint({
        time: data.timestamp,
        value: data.price,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [token.id, appendDataPoint]);

  return <PriceChart data={chartData} enableLiveUpdates={true} />;
}
```

### Backend WebSocket Broadcaster

```typescript
// app/api/broadcast/route.ts
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
});

export async function POST(req: Request) {
  const { tokenId, price, timestamp } = await req.json();

  await pusher.trigger(`token-${tokenId}`, "price-update", {
    price,
    timestamp,
  });

  return Response.json({ success: true });
}
```

---

## ⚡ Performance Optimization

### 1. Memoization

```tsx
import { memo } from "react";

const OptimizedChart = memo(
  ({ token }) => {
    const { chartData } = useLiveChartData({ token });
    return <MiniChart data={chartData} enableLiveUpdates={true} />;
  },
  (prev, next) => prev.token.price === next.token.price
);
```

### 2. Virtual Scrolling (for many charts)

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedChartList({ tokens }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      {virtualizer.getVirtualItems().map((item) => (
        <div key={item.key} style={{ height: item.size }}>
          <TokenCard token={tokens[item.index]} />
        </div>
      ))}
    </div>
  );
}
```

### 3. Debounce High-Frequency Updates

```tsx
import { useDebouncedValue } from "@/hooks/use-debounced-value";

function DebouncedChart({ token }) {
  const debouncedToken = useDebouncedValue(token, 500); // 500ms debounce
  const { chartData } = useLiveChartData({ token: debouncedToken });

  return <MiniChart data={chartData} enableLiveUpdates={true} />;
}
```

---

## ✅ Current Status

### Completed Features

✅ **useLiveChartData Hook**

- Auto-detects token price changes
- Manages data point lifecycle
- FIFO queue (maxDataPoints limit)
- Generates initial historical data

✅ **PriceChart Component**

- Live update mode (`enableLiveUpdates`)
- Smooth `.update()` instead of `.setData()`
- Responsive sizing
- Dark theme

✅ **MiniChart Component**

- Live update support
- Compact design for cards
- No interactivity

✅ **TokenCard Integration**

- Pulse page cards show live charts
- Updates every 3 seconds
- Green/red conditional coloring

### Pending Enhancements

⏳ **WebSocket Integration**

- Real-time price streaming
- Sub-second updates
- Pusher/Socket.io setup

⏳ **Candlestick Charts**

- OHLC data structure
- Volume histogram
- Candlestick series

⏳ **Technical Indicators**

- Moving Averages (SMA, EMA)
- RSI, MACD, Bollinger Bands
- Overlay on chart

⏳ **Drawing Tools**

- Trend lines
- Fibonacci retracements
- Support/resistance markers

⏳ **Price Alerts**

- Set threshold alerts
- Visual markers on chart
- Toast notifications

---

## 🧪 Testing

### 1. Browser Console

```javascript
// Open http://localhost:3002/pulse
// Watch charts update every 3 seconds

// Check Redux state
$r.store.getState().tokens.tokens[0].price;

// Manually trigger update
$r.store.dispatch({
  type: "tokens/updateTokenPrice",
  payload: { id: "1", price: 150, priceChange24h: 10 },
});
```

### 2. React DevTools

1. Select `TokenCard` component
2. Watch `chartData` prop update
3. Verify `data.length` increases
4. Check `enableLiveUpdates={true}`

### 3. Redux DevTools

1. Monitor `tokens/updateTokenPrice` actions
2. Filter by `price` field
3. See 3-second interval pattern

---

## 🐛 Troubleshooting

### Chart Not Updating

**Problem**: Chart shows static data

**Solutions**:

1. Check `enableLiveUpdates={true}` is set
2. Verify Redux updates: Redux DevTools → `tokens/updateTokenPrice`
3. Check `useLiveChartData` hook is used
4. Console log `chartData.length` to verify growth

### Chart Flickering

**Problem**: Chart redraws completely on update

**Solutions**:

1. Ensure `enableLiveUpdates={true}`
2. Check `.update()` is called (not `.setData()`)
3. Verify `lastDataLengthRef` tracking

### Performance Issues

**Problem**: Lag with many charts

**Solutions**:

1. Reduce `maxDataPoints` (default: 100 → 50)
2. Implement memoization
3. Use virtual scrolling
4. Debounce updates

---

## 📚 References

- [TradingView Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Query](https://tanstack.com/query/latest)
- [Pusher Channels](https://pusher.com/docs/channels/)

---

## 🎯 Next Steps

1. **Test Current Implementation**

   - Open http://localhost:3002/pulse
   - Watch charts update every 3 seconds
   - Verify smooth animations

2. **Add Token Detail Modal**

   - Full PriceChart (800x400)
   - Timeframe selector
   - Volume display

3. **Integrate WebSocket**

   - Set up Pusher channel
   - Broadcast price updates
   - Sub-second chart updates

4. **Add Candlestick View**
   - OHLC data structure
   - Volume histogram
   - Toggle area/candlestick

---

**Status**: ✅ **Live chart updates are now functional!**

Charts on the Pulse page update automatically every 3 seconds as token prices change in Redux. The updates are smooth with no flickering thanks to TradingView's `.update()` method.
