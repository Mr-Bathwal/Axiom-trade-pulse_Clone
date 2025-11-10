'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Mail, Star, ChevronDown, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AxiomNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Discover', active: pathname === '/' },
    { href: '/pulse', label: 'Pulse', active: pathname === '/pulse' },
    { href: '/trackers', label: 'Trackers', active: false },
    { href: '/perpetuals', label: 'Perpetuals', active: false },
    { href: '/yield', label: 'Yield', active: false },
    { href: '/vision', label: 'Vision', active: false },
    { href: '/portfolio', label: 'Portfolio', active: false },
    { href: '/rewards', label: 'Rewards', active: false },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a0a0f] border-b border-white/[0.06]">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 bg-white rounded" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-t-[3px] border-l-[3px] border-black" style={{ transform: 'rotate(45deg)' }} />
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 h-8 flex items-center text-[13px] font-medium rounded transition-colors
                  ${
                    link.active
                      ? 'text-[#5b8def] bg-[#5b8def]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10 text-white/70"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>

          {/* SOL Dropdown */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 hover:bg-white/10 text-white font-medium"
          >
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[13px]">SOL</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/50" />
          </Button>

          {/* Deposit Button */}
          <Button
            size="sm"
            className="h-8 px-4 bg-[#5b8def] hover:bg-[#4a7de8] text-white text-[13px] font-semibold rounded-lg"
          >
            Deposit
          </Button>

          {/* Star Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10 text-white/70"
          >
            <Star className="h-[18px] w-[18px]" />
          </Button>

          {/* Bell Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10 text-white/70"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>

          {/* Mail with Badge */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative hover:bg-white/10 text-white/70"
          >
            <Mail className="h-[18px] w-[18px]" />
            <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-white/10 rounded text-[10px] font-medium text-white flex items-center justify-center">
              0
            </div>
          </Button>

          {/* Wallet with Badge */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 hover:bg-white/10 text-white/70"
          >
            <div className="h-[18px] w-[18px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
            <span className="text-[13px] font-medium">0</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/50" />
          </Button>

          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10 text-white/70"
          >
            <User2 className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
