'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface TableFiltersProps {
  priceRange: string;
  volumeRange: string;
  onPriceRangeChange: (value: string) => void;
  onVolumeRangeChange: (value: string) => void;
  onReset: () => void;
}

export function TableFilters({
  priceRange,
  volumeRange,
  onPriceRangeChange,
  onVolumeRangeChange,
  onReset,
}: TableFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Price Range Filter */}
      <Select value={priceRange} onValueChange={onPriceRangeChange}>
        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Prices</SelectItem>
          <SelectItem value="under-1">Under $1</SelectItem>
          <SelectItem value="1-10">$1 - $10</SelectItem>
          <SelectItem value="10-100">$10 - $100</SelectItem>
          <SelectItem value="over-100">Over $100</SelectItem>
        </SelectContent>
      </Select>

      {/* Volume Range Filter */}
      <Select value={volumeRange} onValueChange={onVolumeRangeChange}>
        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Volume (24h)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Volumes</SelectItem>
          <SelectItem value="under-1m">Under $1M</SelectItem>
          <SelectItem value="1m-10m">$1M - $10M</SelectItem>
          <SelectItem value="10m-100m">$10M - $100M</SelectItem>
          <SelectItem value="over-100m">Over $100M</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="bg-white/5 border-white/10 hover:bg-white/10"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
