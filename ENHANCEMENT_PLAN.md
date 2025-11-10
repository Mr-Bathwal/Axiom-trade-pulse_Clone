# Axiom-Like Enhancement Plan

## Phase 1: Visual Enhancements (Quick Wins) 🎨

### Table Improvements

- [ ] Add sparkline charts to price column (react-sparklines)
- [ ] Add volume bars (visual progress indicators)
- [ ] Add status badges ("🔥 Hot", "📈 Rising", "❄️ Cold")
- [ ] Add quick action buttons (Buy/Sell) in each row
- [ ] Improve price change display with colored backgrounds
- [ ] Add liquidity depth indicators

### Card Improvements

- [ ] Add mini area charts to TokenCard
- [ ] Add "Trade Now" button with hover effect
- [ ] Add badge for category (New/Trending/Hot)
- [ ] Improve hover animations (scale + glow)
- [ ] Add percentage change bars

### Layout Changes

- [ ] Add persistent watchlist sidebar (favorites)
- [ ] Add market stats bar at top (total volume, market cap)
- [ ] Add trending section above table
- [ ] Improve responsive breakpoints

## Phase 2: Functional Enhancements 🔧

### Token Details Modal

```tsx
// Click any token row/card to open
<TokenDetailsModal>
  - Full price chart (7d, 30d, 90d) - Trading volume chart - Market stats grid -
  Recent transactions mockup - Social links - Add to favorites - Quick trade
  button
</TokenDetailsModal>
```

### Advanced Filters

- [ ] Time range selector (1h, 24h, 7d, 30d)
- [ ] Price range slider (min/max)
- [ ] Volume range slider
- [ ] Market cap filter
- [ ] Chain filter (multi-chain support)
- [ ] Sort by: Price, Volume, Market Cap, Change%

### Search Enhancements

- [ ] Fuzzy search (typo tolerance)
- [ ] Search by contract address
- [ ] Recent searches dropdown
- [ ] Search suggestions

## Phase 3: Data & Performance 📈

### CoinGecko Optimization

- [ ] Increase token count to 50-100
- [ ] Add pagination/infinite scroll
- [ ] Add token categories (DeFi, Gaming, Meme)
- [ ] Cache API responses (IndexedDB)
- [ ] Rate limiting protection

### Real-Time Updates

- [ ] WebSocket for live prices (Binance/CoinGecko)
- [ ] Animated price transitions
- [ ] Flash animations on price change
- [ ] Audio alerts (optional)

### Performance

- [ ] Virtual scrolling (react-window)
- [ ] Memoize components (React.memo)
- [ ] Lazy load images
- [ ] Code splitting
- [ ] Service worker for offline support

## Phase 4: Trading Features 💰

### Trade Modal (Mockup)

```tsx
<TradeModal token={selectedToken}>
  - Market/Limit order toggle - Amount input with max button - Price calculator
  - Slippage settings - Gas fee estimate - Confirm trade button - Recent orders
  list
</TradeModal>
```

### Portfolio Tracker

- [ ] Connect wallet button (MetaMask/Phantom)
- [ ] Portfolio value display
- [ ] Token holdings list
- [ ] P&L calculator
- [ ] Transaction history

## Phase 5: Advanced Features 🚀

### Charts

- [ ] TradingView lightweight charts
- [ ] Volume histogram
- [ ] Order book depth chart
- [ ] Liquidity heatmap

### Analytics

- [ ] Top gainers/losers widget
- [ ] Volume leaders
- [ ] Market sentiment indicators
- [ ] Token comparison tool

### Customization

- [ ] Dark/light theme toggle
- [ ] Customizable columns
- [ ] Save layout preferences
- [ ] Export to CSV/JSON

## Color Scheme Refinement 🎨

### Current Colors

```css
--background: #0a0a0f
--card: #13131a
--border: #1f1f2e
--purple: #a855f7
--pink: #ec4899
```

### Axiom-Inspired Palette

```css
--background: #0d0d0d (slightly lighter)
--card: #1a1a1a (more contrast)
--border: #2d2d2d (visible borders)
--accent-primary: #3b82f6 (professional blue)
--accent-secondary: #8b5cf6 (purple)
--success: #10b981 (green)
--danger: #ef4444 (red)
--warning: #f59e0b (orange)
```

### Typography

- **Headers**: Inter Bold (current: ✅)
- **Body**: Inter Regular
- **Monospace** (prices): JetBrains Mono / Roboto Mono

## Component Structure Changes

### New Components to Create

```
components/
├── trading/
│   ├── sparkline-chart.tsx      # Mini price charts
│   ├── volume-bar.tsx            # Visual volume indicator
│   ├── status-badge.tsx          # Hot/Rising/Cold badges
│   ├── quick-actions.tsx         # Buy/Sell buttons
│   └── liquidity-indicator.tsx   # Depth visualization
├── modal/
│   ├── token-details-modal.tsx   # Full token info
│   ├── trade-modal.tsx           # Trading interface
│   └── settings-modal.tsx        # User preferences
├── widgets/
│   ├── market-stats-bar.tsx      # Top stats bar
│   ├── trending-section.tsx      # Hot tokens
│   ├── watchlist-sidebar.tsx     # Favorites panel
│   └── price-alert-widget.tsx    # Alert notifications
└── charts/
    ├── area-chart.tsx            # Token price chart
    ├── volume-chart.tsx          # Volume histogram
    └── depth-chart.tsx           # Order book depth
```

## Dependencies to Add

```json
{
  "react-sparklines": "^1.7.0", // Mini charts
  "recharts": "^2.10.0", // Full charts
  "framer-motion": "^11.2.12", // Already installed ✅
  "react-window": "^1.8.10", // Virtual scrolling
  "date-fns": "^3.0.0", // Date formatting
  "numeral": "^2.0.6", // Number formatting
  "react-hot-toast": "^2.4.1", // Notifications
  "zustand": "^4.5.0", // Optional: lighter state
  "@tanstack/react-virtual": "^3.0.1" // Virtual scrolling
}
```

## Implementation Priority

**Week 1: Visual Polish**

1. Add sparkline charts to table
2. Add volume bars
3. Add status badges
4. Improve card designs
5. Add market stats bar

**Week 2: Modal & Interactions**

1. Create TokenDetailsModal
2. Add quick action buttons
3. Improve hover effects
4. Add toast notifications
5. Enhanced search

**Week 3: Data & Performance**

1. Increase token count to 100
2. Add virtual scrolling
3. Optimize CoinGecko calls
4. Add WebSocket updates
5. Memoize components

**Week 4: Advanced Features**

1. Add TradingView charts
2. Create trade modal mockup
3. Add portfolio tracker
4. Implement price alerts
5. Final polish & testing

## Success Metrics

- **Visual**: Looks professional like Axiom.trade ✨
- **Performance**: <100ms interactions, smooth scrolling 🚀
- **Features**: All core trading data visible 📊
- **UX**: Intuitive navigation, clear hierarchy 🎯
- **Mobile**: Fully responsive, touch-optimized 📱

## Notes

- **Don't copy Uniswap**: Different purpose (swap vs trade)
- **Focus on data density**: More info, less whitespace
- **Professional aesthetic**: Blue/purple instead of pink/purple
- **Real trading features**: Charts, orders, portfolio
- **Keep dual-page**: Table (trading) + Pulse (overview)

---

**Next Step:** Start with Phase 1 (Visual Enhancements) - highest impact, lowest effort.
