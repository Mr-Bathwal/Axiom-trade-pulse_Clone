/**
 * Token Quick Info Popover Component
 * 
 * Displays condensed token information in a popover when hovering over tokens.
 * Provides quick access to key metrics without opening the full modal.
 * 
 * @usage
 * ```tsx
 * <TokenQuickInfo token={token}>
 *   <button>Hover me</button>
 * </TokenQuickInfo>
 * ```
 * 
 * @implements Popover pattern with Radix UI Popover primitive
 * @performance Lazy renders content only when popover is triggered
 */

'use client';

import { Token } from '@/store/tokensSlice';
import { formatPrice, formatPercentage, formatNumber } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Droplets,
  Users,
  ExternalLink,
} from 'lucide-react';

interface TokenQuickInfoProps {
  /** The token to display information for */
  token: Token;
  /** Children element that triggers the popover */
  children: React.ReactNode;
  /** Optional callback when user clicks "View Details" */
  onViewDetails?: () => void;
}

/**
 * TokenQuickInfo Popover Component
 * 
 * Renders a hoverable/clickable trigger that displays a popover
 * with condensed token information on interaction.
 * 
 * @example
 * ```tsx
 * <TokenQuickInfo token={token} onViewDetails={() => openModal(token)}>
 *   <span className="cursor-pointer hover:underline">
 *     {token.symbol}
 *   </span>
 * </TokenQuickInfo>
 * ```
 */
export function TokenQuickInfo({
  token,
  children,
  onViewDetails,
}: TokenQuickInfoProps) {
  const isPositive = token.priceChange24h >= 0;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 bg-[#0f0f14] border-white/10 p-0 overflow-hidden"
        sideOffset={5}
      >
        {/* Header with gradient background */}
        <div className="bg-linear-to-r from-[#5b8def]/20 to-purple-600/20 p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Token Logo */}
            {token.logo ? (
              <Image
                src={token.logo}
                alt={token.symbol}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {token.symbol.slice(0, 2)}
              </div>
            )}

            {/* Token Name & Symbol */}
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">
                {token.name}
              </div>
              <div className="text-xs text-white/60">{token.symbol}</div>
            </div>

            {/* External Link */}
            <a
              href={`https://etherscan.io/token/${token.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white/70 transition-colors"
              title="View on Etherscan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Price Section */}
        <div className="p-4 space-y-3">
          <div>
            <div className="text-xs text-white/50 mb-1">Current Price</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {formatPrice(token.price)}
              </span>
              <Badge
                variant={isPositive ? 'default' : 'destructive'}
                className="text-xs"
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {formatPercentage(token.priceChange24h)}
              </Badge>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <QuickStat
              icon={<BarChart3 className="w-3 h-3" />}
              label="Market Cap"
              value={`$${formatNumber(token.marketCap)}`}
            />
            <QuickStat
              icon={<Activity className="w-3 h-3" />}
              label="Volume 24h"
              value={`$${formatNumber(token.volume24h)}`}
            />
            <QuickStat
              icon={<Droplets className="w-3 h-3" />}
              label="Liquidity"
              value={`$${formatNumber(token.liquidity)}`}
            />
            <QuickStat
              icon={<Users className="w-3 h-3" />}
              label="Holders"
              value={token.holders ? formatNumber(token.holders) : 'N/A'}
            />
          </div>

          {/* Category Badge */}
          {token.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Category:</span>
              <Badge variant="outline" className="text-xs capitalize">
                {token.category.replace('-', ' ')}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <Button
              size="sm"
              className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-semibold"
            >
              Quick Buy
            </Button>
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={onViewDetails}
              >
                View Details
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0a0a0f] border-t border-white/10">
          <div className="text-[10px] text-white/40 text-center">
            Live data • Updates every 3s via Pusher
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * QuickStat Component
 * 
 * Displays a single metric in the quick info popover
 */
function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#0a0a0f] rounded-lg p-2 border border-white/5">
      <div className="flex items-center gap-1 text-white/50 text-[10px] mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xs font-semibold text-white font-mono truncate">
        {value}
      </div>
    </div>
  );
}
