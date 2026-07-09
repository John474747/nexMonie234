"use client"

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  FileText, 
  Smartphone, 
  Wifi, 
  QrCode, 
  ArrowDownCircle, 
  Repeat, 
  UserPlus 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { id: 'send', icon: <Send size={22} />, label: "Send Money", iconColor: "text-accent", path: "/send-money" },
  { id: 'bills', icon: <FileText size={22} />, label: "Pay Bills", iconColor: "text-accent", path: "/pay-bills" },
  { id: 'airtime', icon: <Smartphone size={22} />, label: "Buy Airtime", iconColor: "text-accent", path: "/buy-airtime" },
  { id: 'data', icon: <Wifi size={22} />, label: "Data Bundle", iconColor: "text-accent", path: "/buy-data" },
  { id: 'scan', icon: <QrCode size={22} />, label: "Scan & Pay", iconColor: "text-accent", path: "/scan-pay" },
  { id: 'request', icon: <ArrowDownCircle size={22} />, label: "Request Money", iconColor: "text-accent", path: "/actions-hub" },
  { id: 'transactions', icon: <Repeat size={22} />, label: "Transactions", iconColor: "text-accent", path: "/transactions" },
  { id: 'refer', icon: <UserPlus size={22} />, label: "Refer & Earn", iconColor: "text-accent", path: "/profile" },
]

export function QuickActionGrid() {
  const router = useRouter()
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const threshold = 80 // ~20% of screen width

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(10)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    // Only allow positive horizontal drag, capped slightly above threshold
    const val = Math.max(0, Math.min(110, diff))
    setDragOffset(val)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (dragOffset >= threshold) {
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([20, 10, 20])
      }
      router.push('/utilities-hub')
    } else {
      setDragOffset(0)
    }
  }

  return (
    <div className="px-5 mb-8">
      <div 
        className={cn(
          "flex items-center justify-between mb-5 select-none touch-none",
          (isDragging || dragOffset > 0) && "opacity-80"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translate3d(${dragOffset}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <h2 className="text-nex-h4 font-bold text-[#1A1A1A] tracking-tight">Quick Actions</h2>
        <button 
          onClick={(e) => {
            if (dragOffset > 0) return; // Prevent click during drag
            router.push('/actions-hub')
          }}
          className="text-[13px] font-bold text-primary active:opacity-60 transition-opacity"
        >
          Manage
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {ACTIONS.map((action, idx) => (
          <button 
            key={idx} 
            onClick={() => router.push(action.path)}
            className="flex flex-col items-center gap-2.5 pt-5 pb-4 px-1 rounded-[24px] bg-white shadow-soft border border-gray-50/50 active:scale-95 hover:shadow-md transition-all group"
          >
            <div className={cn("transition-transform group-hover:scale-110", action.iconColor)}>
              {action.icon}
            </div>
            <span className="text-[11px] font-bold text-[#1A1A1A] leading-tight text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
