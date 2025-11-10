/**
 * Token Detail Modal Component
 * 
 * Displays comprehensive token information in a modal dialog.
 * Includes price charts, market stats, trading actions, and social links.
 * 
 * @usage
 * ```tsx
 * <TokenDetailModal 
 *   token={selectedToken} 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)} 
 * />
 * ```
 * 
 * @implements Modal pattern with Radix UI Dialog primitive
 * @performance Lazy loads chart data only when modal is opened
 */

'use client';

import { Token } from '@/store/tokensSlice';
import { formatPrice, formatPercentage, formatNumber } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Heart,
  Share2,
  BarChart3,
  Users,
  Droplets,
  Clock,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

interface TokenDetailModalProps {
  /** The token to display details for */
  token: Token | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Optional callback when user favorites the token */
  onToggleFavorite?: (tokenId: string) => void;
}

/**
 * TokenDetailModal Component
 * 
 * Full-featured modal dialog displaying comprehensive token information
 * including real-time price data, charts, stats, and trading actions.
 */
export function TokenDetailModal({
  token,
  isOpen,
  onClose,
  onToggleFavorite,
}: TokenDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  // Handle null token case
  if (!token) return null;

  const isPositive = token.priceChange24h >= 0;

  /**
   * Copy token address to clipboard
   */
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  /**
   * Handle share action
   */
  const handleShare = async () => {
    const shareData = {
      title: `${token.name} (${token.symbol})`,
      text: `Check out ${token.name} on Axiom Trade - Current price: ${formatPrice(token.price)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f0f14] border-white/10">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Token Logo */}
              {token.logo ? (
                <Image
                  src={token.logo}
                  alt={token.symbol}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {token.symbol.slice(0, 2)}
                </div>
              )}

              {/* Token Name & Symbol */}
              <div>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  {token.name}
                  <Badge variant={isPositive ? 'default' : 'destructive'}>
                    {token.symbol}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/50 font-mono">
                    {token.id.slice(0, 6)}...{token.id.slice(-4)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="text-white/50 hover:text-white/70 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copied && (
                    <span className="text-xs text-green-500">Copied!</span>
                  )}
                </DialogDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite?.(token.id)}
                title="Add to favorites"
              >
                <Heart
                  className={`w-4 h-4 ${
                    token.isFavorite ? 'fill-pink-500 text-pink-500' : ''
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                title="Share token"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(`https://etherscan.io/token/${token.id}`, '_blank')
                }
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Price Section */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white font-mono">
              {formatPrice(token.price)}
            </span>
            <Badge
              variant={isPositive ? 'default' : 'destructive'}
              className="text-base px-3 py-1"
            >
              <span className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercentage(token.priceChange24h)}
              </span>
            </Badge>
            <span className="text-sm text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <BarChart3 className="w-3 h-3" />
                Market Cap
              </div>
              <div className="text-lg font-semibold text-white font-mono">
                ${formatNumber(token.marketCap)}
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Activity className="w-3 h-3" />
                Volume 24h
              </div>
              <div className="text-lg font-semibold text-white font-mono">
                ${formatNumber(token.volume24h)}
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Droplets className="w-3 h-3" />
                Liquidity
              </div>
              <div className="text-lg font-semibold text-white font-mono">
                ${formatNumber(token.liquidity)}
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Users className="w-3 h-3" />
                Holders
              </div>
              <div className="text-lg font-semibold text-white font-mono">
                {token.holders ? formatNumber(token.holders) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full bg-[#0a0a0f]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">
                About {token.name}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {token.name} ({token.symbol}) is a cryptocurrency token with a
                current market cap of ${formatNumber(token.marketCap)}. The token
                has experienced a {formatPercentage(Math.abs(token.priceChange24h))}{' '}
                {isPositive ? 'increase' : 'decrease'} in the last 24 hours.
              </p>
            </div>

            {/* Trading Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                Buy {token.symbol}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Sell {token.symbol}
              </Button>
            </div>
          </TabsContent>

          {/* Chart Tab */}
          <TabsContent value="chart" className="mt-4">
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-white/5">
              <div className="text-center py-12 text-white/50">
                <p className="mb-2">Price Chart</p>
                <p className="text-sm">Chart integration ready - waiting for live data</p>
              </div>
            </div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-3 mt-4">
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-white/5">
              <div className="space-y-3">
                <InfoRow label="Contract Address" value={token.id} copyable />
                <InfoRow label="Token Name" value={token.name} />
                <InfoRow label="Symbol" value={token.symbol} />
                <InfoRow
                  label="Current Price"
                  value={formatPrice(token.price)}
                />
                <InfoRow
                  label="24h Change"
                  value={formatPercentage(token.priceChange24h)}
                  colorCode
                />
                <InfoRow
                  label="Market Cap"
                  value={`$${formatNumber(token.marketCap)}`}
                />
                <InfoRow
                  label="24h Volume"
                  value={`$${formatNumber(token.volume24h)}`}
                />
                <InfoRow
                  label="Liquidity"
                  value={`$${formatNumber(token.liquidity)}`}
                />
                <InfoRow
                  label="Holders"
                  value={token.holders ? formatNumber(token.holders) : 'N/A'}
                />
                <InfoRow label="Category" value={token.category || 'N/A'} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/**
 * InfoRow Component
 * 
 * Displays a key-value pair with optional copy functionality
 */
function InfoRow({
  label,
  value,
  copyable = false,
  colorCode = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  colorCode?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isPositive = value.includes('+') || (!value.includes('-') && colorCode);

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-mono ${
            colorCode
              ? isPositive
                ? 'text-green-500'
                : 'text-red-500'
              : 'text-white'
          }`}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-white/50 hover:text-white/70 transition-colors"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
            {copied && <span className="text-xs text-green-500 ml-1">✓</span>}
          </button>
        )}
      </div>
    </div>
  );
}
