'use client';

import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Snowflake, Minus } from 'lucide-react';

interface StatusBadgeProps {
  priceChange24h: number;
}

export function StatusBadge({ priceChange24h }: StatusBadgeProps) {
  if (priceChange24h >= 10) {
    return (
      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30">
        <Flame className="h-3 w-3 mr-1" />
        Hot
      </Badge>
    );
  }
  
  if (priceChange24h >= 5) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
        <TrendingUp className="h-3 w-3 mr-1" />
        Rising
      </Badge>
    );
  }
  
  if (priceChange24h <= -5) {
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
        <Snowflake className="h-3 w-3 mr-1" />
        Cold
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="border-white/10 text-white/40">
      <Minus className="h-3 w-3 mr-1" />
      Stable
    </Badge>
  );
}
