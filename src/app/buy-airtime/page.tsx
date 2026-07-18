
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Users, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  CreditCard,
  Lock,
  Fingerprint,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useUser, useDoc } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

type Network = {
  id: string
  name: string
  logo: string
}

export default function BuyAirtimeWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [stage, setStage] = useState<'input' | 'confirm' | 'success'>('input')
  const [loading, setLoading] = useState(false)
  const [networksLoading, setNetworksLoading] = useState(false)

  const [phoneNumber, setPhoneNumber] = useState('')
  const [networks, setNetworks] = useState<Network[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [amount, setAmount] = useState('')
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric' | 'totp'>('pin')

  const { data: wallet } = useDoc<any>(user ? { table: 'wallets', id: user.id } : null)

  useEffect(() => {
    async function fetchNetworks() {
      setNetworksLoading(true)
      try {
        const res = await fetch('/api/airtime/networks')
        const data = await res.json()
        setNetworks(data)
        if (data.length > 0) setSelectedNetwork(data[0])
      } catch (e) {
        console.error('Failed to fetch networks', e)
      } finally {
        setNetworksLoading(false)
      }
    }
    fetchNetworks()
  }, [])

  const handleContinue = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Number",
        description: "Please enter a valid phone number.",
      })
      return
    }
    if (!amount || Number(amount) < 50) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Minimum airtime purchase is ₦50.",
      })
      return
    }
    setStage('confirm')
  }

  const handlePurchase = async () => {
    if (!user || !wallet || !selectedNetwork) return
    const numericAmount = Number(amount)

    if (wallet.available < numericAmount) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "Your wallet balance is too low for this purchase.",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/airtime/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          network: selectedNetwork.name,
          amount: numericAmount
        })
      })

      const result = await res.json()

      if (result.success) {
        await supabase.from('wallets').update({ available: (wallet?.available ?? 0) - (numericAmount), last_updated: new Date().toISOString() }).eq('user_id', user.id)

        await supabase.from('transactions').insert({
          user_id: user.id,
          title: `Airtime Top-up - ${selectedNetwork.name}`,
          amount: numericAmount,
          type: 'expense',
          category: 'Airtime',
          created_at: new Date().toISOString(),
          status: 'completed',
          reference_id: result.transactionId,
          recipient: phoneNumber
        })

        setStage('success')
      } else {
        toast({
          variant: "destructive",
          title: "Purchase Failed",
          description: result.error || "Could not complete airtime purchase.",
        })
      }
    } catch (e) {
      console.error('Purchase error', e)
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'input') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <NexLogo />
            <div className="w-10" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-tight mb-1">Buy Airtime</h1>
            <p className="text-[14px] text-gray-500 font-medium">Recharge any phone number instantly.</p>
          </div>
        </header>

        <div className="px-6 py-8">
          <section className="mb-8">
            <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Recipient & Network</h2>
            <Card className="p-6 border-none shadow-soft rounded-[28px] bg-white">
              <div className="relative group mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Smartphone size={20} />
                </span>
                <Input 
                  placeholder="Recipient Phone Number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="pl-12 h-14 rounded-2xl bg-gray-50 border-none shadow-inner text-[15px] focus-visible:ring-1 focus-visible:ring-primary/20" 
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary active:scale-90 transition-all">
                  <Users size={16} />
                </button>
              </div>

              {networksLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {networks.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => setSelectedNetwork(net)}
                      className={cn(
                        "h-12 rounded-xl text-[12px] font-bold transition-all border",
                        selectedNetwork?.id === net.id 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-white text-gray-500 border-gray-100 hover:border-primary/30"
                      )}
                    >
                      {net.name}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section className="mb-10">
            <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Select Amount</h2>
            <Card className="p-6 border-none shadow-soft rounded-[28px] bg-white">
              <div className="grid grid-cols-3 gap-2 mb-6">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className={cn(
                      "h-12 rounded-xl text-[14px] font-bold transition-all border",
                      amount === amt.toString() 
                        ? "bg-primary text-white border-primary shadow-md" 
                        : "bg-white text-gray-500 border-gray-100 hover:border-primary/30"
                    )}
                  >
                    ₦{amt}
                  </button>
                ))}
              </div>
              
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-[#1A1A1A]">₦</span>
                <Input 
                  placeholder="Enter Custom Amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  className="pl-10 h-14 rounded-2xl bg-gray-50 border-none shadow-inner text-[16px] font-bold focus-visible:ring-1 focus-visible:ring-primary/20" 
                />
              </div>
            </Card>
          </section>

          <button 
            onClick={handleContinue}
            className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </div>
        <BottomNav />
      </main>
    )
  }

  if (stage === 'confirm') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={() => setStage('input')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Confirm Purchase</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-6 py-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary mx-auto mb-4">
              <Zap size={36} />
            </div>
            <div className="text-[32px] font-bold text-[#1A1A1A] mb-1">₦{Number(amount).toLocaleString()}</div>
            <p className="text-[13px] text-gray-500 font-medium">{selectedNetwork?.name} Airtime Payment</p>
          </div>

          <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white mb-8">
            <div className="space-y-5">
              <SummaryRow label="Recipient" value={phoneNumber} />
              <SummaryRow label="Network" value={selectedNetwork?.name || ''} />
              <SummaryRow label="Payment Method" value="Naira Wallet" icon={<CreditCard size={14} className="text-primary" />} />
            </div>
          </Card>

          <section className="mb-10">
            <h2 className="text-[14px] font-bold text-[#1A1A1A] mb-4">Authorize Transaction</h2>
            <div className="grid grid-cols-3 gap-3">
              <AuthCard active={authMethod === 'pin'} onClick={() => setAuthMethod('pin')} icon={<Lock size={18} />} label="PIN" />
              <AuthCard active={authMethod === 'biometric'} onClick={() => setAuthMethod('biometric')} icon={<Fingerprint size={18} />} label="Biometric" />
              <AuthCard active={authMethod === 'totp'} onClick={() => setAuthMethod('totp')} icon={<ShieldCheck size={18} />} label="TOTP" />
            </div>
          </section>

          <button 
            disabled={loading}
            onClick={handlePurchase}
            className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Complete Purchase <CheckCircle2 size={18} /></>}
          </button>
        </div>
      </main>
    )
  }

  if (stage === 'success') {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-8 animate-in zoom-in-50 duration-500">
            <CheckCircle2 size={56} />
          </div>
          
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Purchase Successful!</h1>
          <p className="text-[15px] text-gray-500 font-medium mb-12 max-w-[260px]">
            ₦{Number(amount).toLocaleString()} Airtime has been sent to <span className="text-[#1A1A1A] font-bold">{phoneNumber}</span>.
          </p>

          <Card className="w-full p-6 border-none shadow-soft rounded-[32px] bg-gray-50 mb-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Total Charge</span>
                <span className="text-primary font-bold text-[18px]">₦{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Reference ID</span>
                <span className="text-[#1A1A1A] font-bold uppercase">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
            </div>
          </Card>

          <button 
            onClick={() => router.push('/')}
            className="w-full py-5 bg-[#1A1A1A] text-white font-bold rounded-[22px] shadow-lg active:scale-[0.98] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
        <div className="pb-10 text-center">
          <NexLogo className="justify-center opacity-40" />
        </div>
      </main>
    )
  }

  return null
}

function SummaryRow({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[15px] font-bold text-[#1A1A1A]">{value}</span>
      </div>
    </div>
  )
}

function AuthCard({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95",
        active 
          ? "border-primary bg-primary/5 text-primary" 
          : "border-gray-50 bg-gray-50 text-gray-400"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", active ? "bg-primary text-white" : "bg-white")}>
        {icon}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  )
}
