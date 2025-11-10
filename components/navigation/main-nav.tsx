'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Axiom Trade
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-white bg-white/10 px-3 py-2 rounded-lg'
                  : 'text-white/60 hover:text-white px-3 py-2'
              }`}
            >
              Table
            </Link>
            <Link
              href="/pulse"
              className={`text-sm font-medium transition-colors ${
                pathname === '/pulse'
                  ? 'text-white bg-white/10 px-3 py-2 rounded-lg'
                  : 'text-white/60 hover:text-white px-3 py-2'
              }`}
            >
              Pulse
            </Link>
          </div>

          {/* Connect Wallet Button */}
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </nav>
  );
}
