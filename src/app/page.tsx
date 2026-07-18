"use client"

import React from 'react'
import { CommandCenter } from '@/components/dashboard/CommandCenter'
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid'
import { ProductDiscovery } from '@/components/dashboard/ProductDiscovery'
import { NexTipsBanner } from '@/components/dashboard/NexTipsBanner'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import { Bell, User } from 'lucide-react'
import { useUser, useDoc } from '@/firebase'

/**
 * Home Dashboard - Migrated to relational profiles table.
 */
export default function Home() {
  const { user } = useUser()
  
  // Profiles table is structured to use user.id as primary key
  const { data: profile, loading } = useDoc(user ? { table: 'profiles', id: user.id } : null)

  return (
    <main className="min-h-screen pb-36 bg-background">
      <header className="px-6 pt-8 pb-6 bg-white sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
          <NexLogo />
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-1">
              <Bell size={24} className="text-foreground" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">3</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-nex-xs bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-gray-300" />
              )}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-nex-h1 text-foreground leading-tight mb-1">
            Welcome back, {profile?.display_name?.split(' ')[0] || 'Member'}! 👋
          </h1>
          <p className="text-nex-sub text-gray-500 font-medium">
            Manage your money, grow wealth and secure your future.
          </p>
        </div>
      </header>

      <div className="space-y-8 pt-6">
        <CommandCenter />
        <QuickActionGrid />
        <ProductDiscovery />
        <NexTipsBanner />
      </div>

      <BottomNav />
    </main>
  )
}
