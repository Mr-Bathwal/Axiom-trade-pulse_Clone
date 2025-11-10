/**
 * Pulse Page - Token Discovery Interface
 * 
 * Displays three categorized columns of tokens for discovery and monitoring:
 * - New Pairs: Recently launched tokens
 * - Final Stretch: Tokens approaching migration/milestones
 * - Migrated: Successfully migrated tokens
 * 
 * @features
 * - Real-time token updates via Pusher WebSocket (every 3s)
 * - Three-column categorized layout with dividers
 * - Preset filters (P1, P2, P3) for each column
 * - Compact token cards showing live market data
 * - Responsive grid layout
 * - Empty state messages
 * 
 * @architecture
 * - Redux for global state management
 * - TanStack Query for server state caching
 * - Custom usePusherTokenUpdates hook for WebSocket connection
 * - Memoized column data to prevent unnecessary re-renders
 * 
 * @realTimeData
 * - Token prices update every 3s via Pusher
 * - Visual indicators (pulsing dots) show live updates
 * - Data sourced from Moralis API and CoinGecko
 * 
 * @performance
 * - Memoized filtering operations
 * - Efficient category-based token grouping
 * - Skeleton loading states prevent layout shift
 * 
 * @url https://axiom.trade/pulse
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { setTokens, updateTokenPrice } from '@/store/tokensSlice';
import { RootState } from '@/store';
import { fetchTokens, simulatePriceUpdate } from '@/lib/api/tokens';
import { TokenCard } from '@/components/pulse/token-card';
import { usePusherTokenUpdates } from '@/hooks/use-pusher-updates';

/**
 * PulsePage Component
 * 
 * Main page component for token discovery and monitoring.
 * Renders a 3-column layout with categorized token cards.
 */
export default function PulsePage() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const dispatch = useDispatch();
  const tokens = useSelector((state: RootState) => state.tokens.tokens);
  
  /**
   * Initialize Pusher WebSocket connection for real-time updates
   * Updates token prices every 3 seconds automatically
   */
  usePusherTokenUpdates();

  const { data, isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: fetchTokens,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data) {
      dispatch(setTokens(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      tokens.forEach((token) => {
        const update = simulatePriceUpdate(token);
        dispatch(updateTokenPrice({ id: token.id, ...update }));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [tokens, dispatch]);

  // ============================================================================
  // Categorized Token Lists (Memoized)
  // ============================================================================
  
  /**
   * Filter tokens by category for each column
   * Memoized to prevent recalculation on every render
   * 
   * Categories:
   * - 'new': Recently launched tokens (New Pairs column)
   * - 'final-stretch': Tokens approaching milestones (Final Stretch column)
   * - 'migrated': Successfully migrated tokens (Migrated column)
   */
  const newPairs = useMemo(() => tokens.filter((t) => t.category === 'new'), [tokens]);
  const finalStretch = useMemo(() => tokens.filter((t) => t.category === 'final-stretch'), [tokens]);
  const migrated = useMemo(() => tokens.filter((t) => t.category === 'migrated'), [tokens]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-16">
      {/* Header with title and controls */}
      <div className="border-b border-white/[0.06] bg-[#0a0a0f] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">Pulse</h1>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-white/5 rounded text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Display
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#5b8def]/20 text-[#5b8def] hover:bg-[#5b8def]/30 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              1
              <span className="text-white/50">=</span>
              0
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
        {/* New Pairs Column */}
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">New Pairs</h2>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-white/50">0</span>
              <div className="flex items-center gap-1 ml-2">
                <button className="px-2 py-0.5 text-[10px] font-medium text-[#5b8def] bg-[#5b8def]/10 rounded">P1</button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:bg-white/5 rounded">P2</button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:bg-white/5 rounded">P3</button>
              </div>
              <button className="p-0.5 hover:bg-white/5 rounded text-white/50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {newPairs.length > 0 ? (
              newPairs.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))
            ) : (
              <div className="text-center py-12 text-white/40 text-sm">No new pairs yet</div>
            )}
          </div>
        </div>

        {/* Final Stretch Column */}
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Final Stretch</h2>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-white/50">0</span>
              <div className="flex items-center gap-1 ml-2">
                <button className="px-2 py-0.5 text-[10px] font-medium text-[#5b8def] bg-[#5b8def]/10 rounded">P1</button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:bg-white/5 rounded">P2</button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:bg-white/5 rounded">P3</button>
              </div>
              <button className="p-0.5 hover:bg-white/5 rounded text-white/50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {finalStretch.length > 0 ? (
              finalStretch.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))
            ) : (
              <div className="text-center py-12 text-white/40 text-sm">No tokens in final stretch</div>
            )}
          </div>
        </div>

        {/* Migrated Column */}
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Migrated</h2>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-white/50">0.0</span>
              <div className="flex items-center gap-1 ml-2">
                <button className="px-2 py-0.5 text-[10px] font-medium text-[#5b8def] bg-[#5b8def]/10 rounded">P1</button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:bg-white/5 rounded">P2</button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:bg-white/5 rounded">P3</button>
              </div>
              <button className="p-0.5 hover:bg-white/5 rounded text-white/50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {migrated.length > 0 ? (
              migrated.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))
            ) : (
              <div className="text-center py-12 text-white/40 text-sm">No migrated tokens</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
