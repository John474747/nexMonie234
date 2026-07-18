"use client"

import React from 'react'
import Image from 'next/image'
import { ShieldCheck, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function NexTipsBanner() {
  return (
    <div className="px-5 mb-8">
      <Card className="bg-[#005F56] border-none rounded-[24px] p-6 flex items-center overflow-hidden relative min-h-[160px]">
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-primary font-bold text-[10px]">n</div>
            <span className="text-white text-[13px] font-bold">nexTips</span>
            <ShieldCheck size={14} className="text-white opacity-80" />
          </div>
          <h3 className="text-white font-bold text-[22px] mb-1">Save consistently</h3>
          <p className="text-white/80 text-[12px] leading-tight max-w-[180px]">
            Automate small savings daily and watch your wealth grow with nex Monie.
          </p>
        </div>

        <div className="relative w-[120px] h-[120px] flex-shrink-0 ml-2 rounded-2xl overflow-hidden shadow-2xl">
          <Image 
            src="https://picsum.photos/seed/lake/300/300"
            alt="Nature illustration"
            fill
            className="object-cover"
            data-ai-hint="nature lake"
          />
        </div>

        <button className="ml-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary flex-shrink-0 active:scale-90 transition-transform">
          <ChevronRight size={24} />
        </button>
      </Card>
    </div>
  )
}
