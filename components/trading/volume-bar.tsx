'use client';

import { formatNumber } from '@/lib/utils';

interface VolumeBarProps {
  volume: number;
  maxVolume: number;
}

export function VolumeBar({ volume, maxVolume }: VolumeBarProps) {
  const percentage = Math.min((volume / maxVolume) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/90">${formatNumber(volume)}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
