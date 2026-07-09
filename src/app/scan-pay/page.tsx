
"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  QrCode, 
  Camera, 
  Image as ImageIcon, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Loader2, 
  CreditCard,
  Lock,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  Download,
  AlertCircle,
  Building2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useUser, useDoc, useFirebase } from '@/firebase'
import { doc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

type Stage = 'scan' | 'review' | 'authenticate' | 'success' | 'failure'

export default function ScanPayWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { db } = useFirebase()
  const { toast } = useToast()

  const [stage, setStage] = useState<Stage>('scan')
  const [loading, setLoading] = useState(false)
  const [decoding, setDecoding] = useState(false)

  // Payment Data
  const [merchant, setMerchant] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric' | 'totp'>('pin')

  const walletRef = useMemo(() => user ? doc(db, 'users', user.uid, 'wallets', 'main') : null, [user, db])
  const { data: wallet } = useDoc<any>(walletRef)

  const handleSimulateScan = async (type: 'static' | 'dynamic') => {
    setDecoding(true)
    try {
      const qrData = type === 'static' ? 'MERC-STATIC' : 'MERC-001'
      const res = await fetch('/api/scan/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData })
      })
      const data = await res.json()
      if (data.success) {
        setMerchant(data)
        setAmount(data.amount ? data.amount.toString() : '')
        setStage('review')
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Scan Error', description: 'Failed to decode QR code' })
    } finally {
      setDecoding(false)
    }
  }

  const handlePayment = async () => {
    if (!user || !wallet || !merchant) return
    const numericAmount = Number(amount)
    const fee = 0 // QR payments typically zero fee for users
    const totalDebit = numericAmount + fee

    if (wallet.available < totalDebit) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your wallet balance is too low.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/scan/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.merchantId,
          amount: numericAmount,
          userId: user.uid
        })
      })

      const result = await res.json()

      if (result.success) {
        await updateDoc(walletRef!, {
          available: increment(-totalDebit),
          lastUpdated: serverTimestamp()
        })

        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          title: `QR Payment - ${merchant.merchantName}`,
          amount: numericAmount,
          type: 'expense',
          category: 'Scan & Pay',
          timestamp: serverTimestamp(),
          status: 'completed',
          referenceId: result.transactionId,
          merchantDetails: merchant
        })

        setStage('success')
      } else {
        setStage('failure')
      }
    } catch (e) {
      setStage('failure')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'scan') {
    return (
      <main className="min-h-screen bg-black text-white relative">
        {/* Scanner Header */}
        <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-90 transition-all">
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
             <QrCode size={14} className="text-accent" />
             <span className="text-[11px] font-bold uppercase tracking-widest">Scan Merchant QR</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Zap size={20} />
          </button>
        </header>

        {/* Viewfinder UI */}
        <div className="flex-1 h-screen flex flex-col items-center justify-center relative overflow-hidden">
           {/* Mock Camera Feed Background */}
           <div className="absolute inset-0 bg-[#121212] flex items-center justify-center">
              <Camera size={120} className="text-white/5 animate-pulse" />
           </div>

           {/* Scan Guide Frame */}
           <div className="relative w-72 h-72">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-accent rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-accent rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-3xl" />
              
              {/* Scan Line Animation */}
              <div className="absolute top-0 left-4 right-4 h-1 bg-accent/40 shadow-[0_0_15px_rgba(248,143,153,0.8)] animate-[scan_2.5s_ease-in-out_infinite] rounded-full" />
              
              <style jsx>{`
                @keyframes scan {
                  0%, 100% { top: 0; }
                  50% { top: 100%; }
                }
              `}</style>
           </div>

           <p className="mt-12 text-[14px] text-white/60 font-medium tracking-wide">Align QR code within the frame</p>
        </div>

        {/* Scanner Footer Actions */}
        <div className="absolute bottom-12 left-0 right-0 z-20 px-8 flex flex-col gap-6">
           {decoding && (
             <div className="flex items-center justify-center gap-3 bg-accent text-white py-3 rounded-2xl animate-in slide-in-from-bottom-4">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-[13px] font-bold">Decoding Payment Info...</span>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSimulateScan('dynamic')} className="py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-[22px] flex items-center justify-center gap-2 font-bold text-[14px] active:scale-95 transition-all">
                 <RefreshCw size={18} /> Dynamic QR
              </button>
              <button onClick={() => handleSimulateScan('static')} className="py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-[22px] flex items-center justify-center gap-2 font-bold text-[14px] active:scale-95 transition-all">
                 <Building2 size={18} /> Static QR
              </button>
           </div>

           <button className="py-5 bg-white text-black rounded-[24px] flex items-center justify-center gap-3 font-bold text-[15px] active:scale-95 transition-all">
              <ImageIcon size={20} /> Upload from Gallery
           </button>
        </div>
      </main>
    )
  }

  if (stage === 'review') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setStage('scan')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <NexLogo />
            <div className="w-10" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-tight mb-1">Confirm Payment</h1>
            <p className="text-[14px] text-gray-500 font-medium">Review merchant and amount details.</p>
          </div>
        </header>

        <div className="px-6 py-8">
           <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                <Building2 size={32} />
              </div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-none mb-1">{merchant?.merchantName}</h2>
              <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">MID: {merchant?.merchantId}</p>
           </div>

           <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white mb-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Amount</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1A1A1A] text-[18px]">₦</span>
                  <Input 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                    readOnly={merchant?.type === 'dynamic'}
                    className={cn(
                      "h-16 pl-9 rounded-2xl border-none font-bold text-[22px] shadow-inner",
                      merchant?.type === 'dynamic' ? "bg-gray-50/50" : "bg-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20"
                    )}
                  />
                  {merchant?.type === 'static' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/10 rounded-full">
                       <span className="text-[10px] font-bold text-primary uppercase">Edit</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-50">
                 <SummaryRow label="Description" value={merchant?.description} />
                 <SummaryRow label="Payment Method" value="nexMonie Wallet" />
                 <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Convenience Fee</span>
                    <span className="text-emerald-500 font-bold">FREE</span>
                 </div>
              </div>
           </Card>

           <div className="bg-white/60 p-4 rounded-2xl mb-8 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                 <CreditCard size={18} className="text-primary" />
                 <span className="text-[13px] font-medium text-gray-500">Available Balance</span>
              </div>
              <span className="text-[15px] font-bold text-[#1A1A1A]">₦{wallet?.available.toLocaleString()}</span>
           </div>

           <button 
            onClick={() => setStage('authenticate')}
            disabled={!amount || Number(amount) < 10}
            className="w-full py-5 bg-primary text-white font-bold rounded-[24px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Confirm Payment
          </button>
        </div>
        <BottomNav />
      </main>
    )
  }

  if (stage === 'authenticate') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setStage('review')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Authorize</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-6 py-10">
          <div className="text-center mb-10 px-4">
            <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-2">Secure Step</h2>
            <p className="text-[14px] text-gray-500">Verify your identity to pay <span className="text-primary font-bold">₦{Number(amount).toLocaleString()}</span> to {merchant?.merchantName}.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <AuthCard active={authMethod === 'pin'} onClick={() => setAuthMethod('pin')} icon={<Lock size={18} />} label="PIN" />
            <AuthCard active={authMethod === 'biometric'} onClick={() => setAuthMethod('biometric')} icon={<Fingerprint size={18} />} label="Biometric" />
            <AuthCard active={authMethod === 'totp'} onClick={() => setAuthMethod('totp')} icon={<ShieldCheck size={18} />} label="TOTP" />
          </div>

          <button 
            disabled={loading}
            onClick={handlePayment}
            className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Authorize Payment <ArrowRight size={18} /></>}
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
          
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Payment Successful!</h1>
          <p className="text-[15px] text-gray-500 font-medium mb-12 max-w-[260px]">
            ₦{Number(amount).toLocaleString()} has been paid to <span className="text-primary font-bold">{merchant?.merchantName}</span>.
          </p>

          <Card className="w-full p-6 border-none shadow-soft rounded-[32px] bg-gray-50 mb-10 space-y-4">
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Reference</span>
                <span className="text-[#1A1A1A] font-bold uppercase">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
             </div>
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Merchant ID</span>
                <span className="text-[#1A1A1A] font-bold uppercase">{merchant?.merchantId}</span>
             </div>
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Status</span>
                <span className="text-emerald-500 font-bold uppercase">Completed</span>
             </div>
          </Card>

          <div className="w-full space-y-3">
            <button className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-[22px] flex items-center justify-center gap-2">
              <Download size={18} /> Download Receipt
            </button>
            <button onClick={() => router.push('/')} className="w-full py-4 bg-white text-primary font-bold rounded-[22px] border border-gray-100">
              Return Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (stage === 'failure') {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-red-500/30 mb-8">
            <AlertCircle size={56} />
          </div>
          
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Payment Failed</h1>
          <p className="text-[15px] text-gray-500 font-medium mb-12 max-w-[260px]">
            Something went wrong with this QR transaction. Please check your balance and try again.
          </p>

          <div className="w-full space-y-3">
            <button onClick={() => setStage('authenticate')} className="w-full py-4 bg-primary text-white font-bold rounded-[20px]">
              Retry Payment
            </button>
            <button onClick={() => setStage('scan')} className="w-full py-4 bg-white text-gray-500 font-bold rounded-[20px] border border-gray-100">
              Rescan QR
            </button>
          </div>
        </div>
      </main>
    )
  }

  return null
}

function SummaryRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">{label}</span>
      <span className="text-[14px] font-bold text-[#1A1A1A] text-right leading-tight">{value}</span>
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
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  )
}
