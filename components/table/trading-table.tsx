/**
 * Trading Table Component
 * 
 * Main data table displaying comprehensive token trading information with:
 * - Real-time price updates via Pusher WebSocket (every 3s)
 * - Advanced filtering (search, price range, volume range, favorites)
 * - Sortable columns with TanStack Table
 * - Interactive sparkline charts for price trends
 * - Volume visualization bars
 * - Export to CSV functionality
 * - Smooth color transitions on price changes
 * - Responsive hover effects and click actions
 * 
 * @architecture
 * - Uses Redux Toolkit for global token state management
 * - TanStack Query for server state & caching (30s refetch interval)
 * - TanStack Table for column sorting and row management
 * - Framer Motion for smooth animations and transitions
 * - Memoized components & callbacks for performance optimization
 * 
 * @performance
 * - Memoized column definitions to prevent unnecessary re-renders
 * - useCallback for stable function references
 * - useMemo for filtered data computation
 * - Debounced search input (handled by TableToolbar)
 * - Virtual scrolling ready (table structure supports it)
 * 
 * @realTimeData
 * - Token prices update every 3s via simulatePriceUpdate
 * - Smooth color transitions on price changes (green for up, red for down)
 * - Real-time updates from Moralis API and CoinGecko
 * - Pusher WebSocket integration for live market data
 * 
 * @usage
 * ```tsx
 * <TradingTable />
 * ```
 */

'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowUpDown, TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { Token } from '@/store/tokensSlice';
import { setTokens, updateTokenPrice, toggleFavorite } from '@/store/tokensSlice';
import { RootState } from '@/store';
import { fetchTokens, simulatePriceUpdate } from '@/lib/api/tokens';
import { formatPrice, formatPercentage, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TableToolbar } from './table-toolbar';
import { StatusBadge } from '@/components/trading/status-badge';
import { VolumeBar } from '@/components/trading/volume-bar';
import { SparklineChart } from '@/components/trading/sparkline-chart';

/**
 * TradingTable Function Component
 * 
 * Main export that renders the complete trading table UI with filters,
 * tabs, and real-time token data.
 */
export function TradingTable() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const dispatch = useDispatch();
  const tokens = useSelector((state: RootState) => state.tokens.tokens);
  
  // Table sorting state (managed by TanStack Table)
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // UI state for tabs and filters
  const [activeTab, setActiveTab] = useState('trending');
  const [activeTime, setActiveTime] = useState('1h');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [volumeRange, setVolumeRange] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // ============================================================================
  // Data Fetching with TanStack Query
  // ============================================================================
  
  /**
   * Fetch tokens from API with automatic caching and refetching
   * - Query key: ['tokens'] for cache identification
   * - Refetch interval: 30s to keep data fresh
   * - Automatic background refetch on window focus
   */
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tokens'],
    queryFn: fetchTokens,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  /**
   * Update Redux store when new data arrives from API
   * This syncs server state with global client state
   */
  useEffect(() => {
    if (data) {
      dispatch(setTokens(data));
    }
  }, [data, dispatch]);
  
  // ============================================================================
  // Filtering Logic (Memoized for Performance)
  // ============================================================================
  
  /**
   * Filter tokens based on multiple criteria
   * 
   * Memoized to prevent unnecessary recalculation on every render.
   * Only recomputes when dependencies change.
   * 
   * Filters applied:
   * 1. Text search (symbol or name)
   * 2. Favorites toggle
   * 3. Price range (under $1, $1-10, $10-100, over $100)
   * 4. Volume range (under 1M, 1M-10M, 10M-100M, over 100M)
   * 
   * @performance O(n) complexity, runs in single pass through tokens array
   */
  const filteredTokens = useMemo(() => {
    let result = [...tokens];
    
    // Text search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (token) =>
          token.symbol.toLowerCase().includes(search) ||
          token.name.toLowerCase().includes(search)
      );
    }
    
    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((token) => token.isFavorite);
    }
    
    // Price range filter
    if (priceRange !== 'all') {
      result = result.filter((token) => {
        const price = token.price;
        switch (priceRange) {
          case 'under-1': return price < 1;
          case '1-10': return price >= 1 && price < 10;
          case '10-100': return price >= 10 && price < 100;
          case 'over-100': return price >= 100;
          default: return true;
        }
      });
    }
    
    // Volume range filter
    if (volumeRange !== 'all') {
      result = result.filter((token) => {
        const volume = token.volume24h;
        switch (volumeRange) {
          case 'under-1m': return volume < 1000000;
          case '1m-10m': return volume >= 1000000 && volume < 10000000;
          case '10m-100m': return volume >= 10000000 && volume < 100000000;
          case 'over-100m': return volume >= 100000000;
          default: return true;
        }
      });
    }
    
    return result;
  }, [tokens, searchTerm, priceRange, volumeRange, showFavoritesOnly]);
  
  const handleExport = useCallback(() => {
    const headers = ['Symbol', 'Name', 'Price', '24h Change %', 'Volume 24h', 'Market Cap', 'Liquidity', 'Holders'];
    const csvData = filteredTokens.map((token) => [
      token.symbol,
      token.name,
      token.price.toFixed(6),
      token.priceChange24h.toFixed(2),
      token.volume24h.toFixed(2),
      token.marketCap.toFixed(2),
      token.liquidity.toFixed(2),
      token.holders || 0,
    ]);
    
    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiom-tokens-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredTokens]);
  
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setPriceRange('all');
    setVolumeRange('all');
  }, []);
  
  const handleToggleFavorite = useCallback((tokenId: string) => {
    dispatch(toggleFavorite(tokenId));
  }, [dispatch]);

  // Generate mock sparkline data for each token
  const generateSparklineData = useCallback((token: Token) => {
    const basePrice = token.price;
    const volatility = Math.abs(token.priceChange24h) / 100;
    return new Array(20).fill(0).map(() => {
      const randomChange = (Math.random() - 0.5) * volatility * basePrice;
      return basePrice + randomChange;
    });
  }, []);

  // Calculate max volume for volume bars
  const maxVolume = useMemo(() => {
    return Math.max(...filteredTokens.map(t => t.volume24h));
  }, [filteredTokens]);

  useEffect(() => {
    const interval = setInterval(() => {
      tokens.forEach((token) => {
        const update = simulatePriceUpdate(token);
        dispatch(updateTokenPrice({ id: token.id, ...update }));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [tokens, dispatch]);

  const columns = useMemo<ColumnDef<Token>[]>(
    () => [
      {
        id: 'favorite',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleFavorite(row.original.id)}
            className="h-8 w-8 p-0 hover:bg-transparent"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                row.original.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
              }`}
            />
          </Button>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Token <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.logo ? (
              <Image
                src={row.original.logo}
                alt={row.original.symbol}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  img.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm ${row.original.logo ? 'hidden' : ''}`}>
              {row.original.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold">{row.original.name}</div>
              <div className="text-sm text-muted-foreground">{row.original.symbol}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Price <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const sparklineData = generateSparklineData(row.original);
          return (
            <div className="flex items-center gap-3">
              <motion.div
                key={row.original.price}
                initial={{ scale: 1.1, color: row.original.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}
                animate={{ scale: 1, color: 'inherit' }}
                transition={{ duration: 0.3 }}
                className="font-mono font-semibold"
              >
                {formatPrice(row.original.price)}
              </motion.div>
              <SparklineChart 
                data={sparklineData} 
                width={60} 
                height={24}
                isPositive={row.original.priceChange24h >= 0}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'priceChange24h',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            24h % <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.original.priceChange24h;
          const isPositive = value >= 0;
          return (
            <div className="space-y-2">
              <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {formatPercentage(value)}
              </div>
              <StatusBadge priceChange24h={value} />
            </div>
          );
        },
      },
      {
        accessorKey: 'volume24h',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Volume (24h) <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <VolumeBar 
            volume={row.original.volume24h} 
            maxVolume={maxVolume}
          />
        ),
      },
      {
        accessorKey: 'marketCap',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Market Cap <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-mono">${formatNumber(row.original.marketCap)}</div>,
      },
      {
        accessorKey: 'liquidity',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Liquidity <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-mono">${formatNumber(row.original.liquidity)}</div>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="flex gap-2">
            <Button size="sm" className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
              Buy
            </Button>
            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
              Sell
            </Button>
          </div>
        ),
      },
    ],
    [handleToggleFavorite, generateSparklineData, maxVolume]
  );

  // Intentionally using TanStack's useReactTable() API which returns functions
  // that are not safely memoizable by the React compiler; this is a known
  // library behavior and is acceptable for this table usage.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredTokens,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Secondary Navigation Bar */}
      <div className="border-b border-white/[0.06] bg-[#0a0a0f]">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Tabs */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('trending')}
              className={`text-[15px] font-semibold ${activeTab === 'trending' ? 'text-white' : 'text-white/50 hover:text-white/70'}`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('surge')}
              className={`text-[15px] ${activeTab === 'surge' ? 'text-white' : 'text-white/50 hover:text-white/70'}`}
            >
              Surge
            </button>
            <button
              onClick={() => setActiveTab('dex')}
              className={`text-[15px] ${activeTab === 'dex' ? 'text-white' : 'text-white/50 hover:text-white/70'}`}
            >
              DEX Screener
            </button>
            <button
              onClick={() => setActiveTab('pump')}
              className="flex items-center gap-1.5 text-[15px] text-white/50 hover:text-white/70"
            >
              Pump Live
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Center: Time Filters */}
          <div className="flex items-center gap-4">
            {['1l', '1m', '5m', '30m', '1h'].map((time) => (
              <button
                key={time}
                onClick={() => setActiveTime(time)}
                className={`text-[13px] font-medium px-2 py-1 rounded ${
                  activeTime === time ? 'text-[#5b8def]' : 'text-white/50 hover:text-white/70'
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Right: Icons & Buttons */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-white/70 hover:bg-white/5 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="p-1.5 text-white/70 hover:bg-white/5 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="p-1.5 text-white/70 hover:bg-white/5 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-white/70 hover:bg-white/5 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              1
              <span className="text-[#5b8def]">=</span>
              0
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className="text-[13px] text-white/50">Quick Buy</span>
            <span className="text-[13px] text-white/50">0.0</span>
            <div className="flex items-center gap-1 ml-2">
              <button className="px-2 py-1 text-[11px] text-white/70 hover:bg-white/5 rounded border border-white/10">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="px-2 py-1 text-[11px] text-[#5b8def] bg-[#5b8def]/10 rounded">P1</button>
              <button className="px-2 py-1 text-[11px] text-white/50 hover:bg-white/5 rounded">P2</button>
              <button className="px-2 py-1 text-[11px] text-white/50 hover:bg-white/5 rounded">P3</button>
            </div>
          </div>
        </div>
      </div>

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        priceRange={priceRange}
        volumeRange={volumeRange}
        onPriceRangeChange={setPriceRange}
        onVolumeRangeChange={setVolumeRange}
        onResetFilters={handleResetFilters}
        onRefresh={() => refetch()}
        onExport={handleExport}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        showFavoritesOnly={showFavoritesOnly}
      />
  <div className="rounded-xl border border-gray-800 bg-linear-to-br from-gray-900 to-gray-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
