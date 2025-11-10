'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TableSearch({ value, onChange }: TableSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
      <Input
        type="text"
        placeholder="Search tokens..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
      />
    </div>
  );
}
