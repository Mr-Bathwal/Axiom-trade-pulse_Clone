'use client';

import { Button } from '@/components/ui/button';
import { Download, Heart, RefreshCw } from 'lucide-react';
import { TableSearch } from './table-search';
import { TableFilters } from './table-filters';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  priceRange: string;
  volumeRange: string;
  onPriceRangeChange: (value: string) => void;
  onVolumeRangeChange: (value: string) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onToggleFavorites: () => void;
  showFavoritesOnly: boolean;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  priceRange,
  volumeRange,
  onPriceRangeChange,
  onVolumeRangeChange,
  onResetFilters,
  onRefresh,
  onExport,
  onToggleFavorites,
  showFavoritesOnly,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Row: Search + Actions */}
      <div className="flex items-center justify-between">
        <TableSearch value={searchValue} onChange={onSearchChange} />
        
        <div className="flex items-center gap-2">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleFavorites}
            className={showFavoritesOnly ? 'bg-pink-600 hover:bg-pink-700' : 'bg-white/5 border-white/10 hover:bg-white/10'}
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-white' : ''}`} />
            Favorites
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <TableFilters
        priceRange={priceRange}
        volumeRange={volumeRange}
        onPriceRangeChange={onPriceRangeChange}
        onVolumeRangeChange={onVolumeRangeChange}
        onReset={onResetFilters}
      />
    </div>
  );
}
