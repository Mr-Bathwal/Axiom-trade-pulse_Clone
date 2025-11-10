/**
 * Skeleton Loading Components
 * 
 * Provides shimmer/pulse loading states for various UI elements
 * to improve perceived performance during data fetching.
 * 
 * @usage
 * ```tsx
 * {isLoading ? <TableSkeleton /> : <Table data={data} />}
 * {isLoading ? <TokenCardSkeleton /> : <TokenCard token={token} />}
 * ```
 * 
 * @implements Progressive loading pattern for optimal UX
 * @performance Prevents layout shift by matching actual component dimensions
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Table Row Skeleton
 * 
 * Mimics the structure of a trading table row with shimmer effect
 * @param count - Number of skeleton rows to render (default: 5)
 */
export function TableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-[#0f0f14] border border-white/[0.08] rounded-lg"
        >
          {/* Favorite star */}
          <Skeleton className="h-4 w-4 rounded" />
          
          {/* Token logo and name */}
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          {/* Price and sparkline */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          
          {/* 24h change */}
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          {/* Volume */}
          <Skeleton className="h-5 w-24" />
          
          {/* Market Cap */}
          <Skeleton className="h-5 w-24" />
          
          {/* Liquidity */}
          <Skeleton className="h-5 w-24" />
          
          {/* Actions */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Token Card Skeleton (for Pulse page)
 * 
 * Matches the compact token card layout with shimmer effect
 * @param count - Number of skeleton cards to render (default: 3)
 */
export function TokenCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0f0f14] border border-white/[0.08] rounded-lg p-3"
        >
          {/* Header: Logo + Name + Time */}
          <div className="flex items-start gap-2 mb-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          
          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Navigation Skeleton
 * 
 * Loading state for navigation bars
 */
export function NavSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/[0.06]">
      <Skeleton className="h-8 w-8" />
      <div className="flex gap-6 flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/**
 * Pulse Page Skeleton
 * 
 * Full page loading state for Pulse page with 3-column layout
 */
export function PulsePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-16">
      {/* Header skeleton */}
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-32 rounded" />
          </div>
        </div>
      </div>
      
      {/* 3-column grid skeleton */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
        {Array.from({ length: 3 }).map((_, colIndex) => (
          <div key={colIndex} className="p-4">
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-28" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-8 rounded" />
                ))}
              </div>
            </div>
            
            {/* Token cards */}
            <TokenCardSkeleton count={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chart Skeleton
 * 
 * Loading state for price charts
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-12 rounded" />
        ))}
      </div>
    </div>
  );
}
