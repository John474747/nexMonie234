
"use client"

import React from 'react'
import { Home, TrendingUp, Plus, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const NavItem = ({ id, path, icon, label }: { id: string, path: string, icon: React.ReactNode, label: string }) => {
    const isActive = pathname === path || (path === '/' && pathname === '/')
    
    return (
      <button 
        onClick={() => router.push(path)}
        className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300 min-w-[50px]",
          isActive ? "text-primary" : "text-gray-400"
        )}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        <span className="text-[12px] font-medium tracking-tight">{label}</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        <NavItem id="home" path="/" icon={<Home />} label="Home" />
        <NavItem id="earn" path="/earn" icon={<TrendingUp />} label="Earn" />
        
        <div className="absolute left-1/2 -translate-x-1/2 -top-12">
          <button 
            onClick={() => router.push('/actions-hub')}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95",
              "bg-accent text-white shadow-accent/40"
            )}
          >
            <Plus size={28} />
          </button>
        </div>
        
        <div className="w-14" />
        
        <NavItem id="finances" path="/finances" icon={<Wallet />} label="Finances" />
        <NavItem id="profile" path="/profile" icon={<User />} label="Profile" />
      </div>
    </div>
  )
}
