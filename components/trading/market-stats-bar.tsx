'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Token } from '@/store/tokensSlice';
import { formatNumber } from '@/lib/utils';

interface MarketStatsBarProps {
  tokens: Token[];
}

export function MarketStatsBar({ tokens }: MarketStatsBarProps) {
  const stats = useMemo(() => {
    const totalVolume = tokens.reduce((sum, token) => sum + token.volume24h, 0);
    const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCap, 0);
    const gainers = tokens.filter(t => t.priceChange24h > 0).length;
    const losers = tokens.filter(t => t.priceChange24h < 0).length;
    const avgChange = tokens.reduce((sum, token) => sum + token.priceChange24h, 0) / tokens.length;

    return {
      totalVolume,
      totalMarketCap,
      gainers,
      losers,
      avgChange,
    };
  }, [tokens]);

  return (
    <div className="w-full bg-[#13131a]/50 border-b border-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Volume */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-white/40">24h Volume</div>
              <div className="text-sm font-bold text-white">${formatNumber(stats.totalVolume)}</div>
            </div>
          </div>

          {/* Total Market Cap */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-white/40">Market Cap</div>
              <div className="text-sm font-bold text-white">${formatNumber(stats.totalMarketCap)}</div>
            </div>
          </div>

          {/* Gainers/Losers */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-white/40">Gainers / Losers</div>
              <div className="text-sm font-bold">
                <span className="text-green-400">{stats.gainers}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-red-400">{stats.losers}</span>
              </div>
            </div>
          </div>

          {/* Average Change */}
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              stats.avgChange >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {stats.avgChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="text-xs text-white/40">Avg Change</div>
              <div className={`text-sm font-bold ${
                stats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
