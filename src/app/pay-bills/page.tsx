
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Search, 
  Zap, 
  Tv, 
  Wifi, 
  Target, 
  GraduationCap, 
  CheckCircle2, 
  Loader2, 
  CreditCard,
  Lock,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  Download,
  Share2,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useUser, useDoc } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

type Category = { id: string, name: string, icon: string }
type Provider = { id: string, name: string }
type Package = { id: string, name: string, price: number }

export default function PayBillsWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [stage, setStage] = useState<'details' | 'review' | 'authenticate' | 'success' | 'failure'>('details')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)

  // Form State
  const [categories, setCategories] = useState<Category[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [accountNumber, setAccountNumber] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric' | 'totp'>('pin')

  const { data: wallet } = useDoc<any>(user ? { table: 'wallets', id: user.id } : null)

  // Initialization
  useEffect(() => {
    fetch('/api/bills/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      setProviders([])
      setSelectedProvider('')
      fetch(`/api/bills/providers?category=${selectedCategory}`).then(r => r.json()).then(setProviders)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedProvider) {
      setPackages([])
      setSelectedPackage('')
      fetch(`/api/bills/packages?provider=${selectedProvider}`).then(r => r.json()).then(setPackages)
    }
  }, [selectedProvider])

  const handleValidate = async () => {
    if (!accountNumber) return
    setValidating(true)
    try {
      const res = await fetch('/api/bills/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, providerId: selectedProvider })
      })
      const data = await res.json()
      if (data.success) {
        setCustomerName(data.customerName)
      } else {
        toast({ variant: 'destructive', title: 'Validation Failed', description: data.error })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setValidating(false)
    }
  }

  const handleDetailsContinue = () => {
    const finalAmount = selectedPackage 
      ? packages.find(p => p.id === selectedPackage)?.price 
      : Number(amount);
    
    if (!selectedCategory || !selectedProvider || !accountNumber || !finalAmount) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please complete all required fields.' })
      return
    }
    setStage('review')
  }

  const handleConfirm = () => setStage('authenticate')

  const handlePayment = async () => {
    if (!user || !wallet) return
    const finalAmount = selectedPackage 
      ? packages.find(p => p.id === selectedPackage)?.price || 0 
      : Number(amount);
    
    const serviceCharge = 100;
    const totalDebit = finalAmount + serviceCharge;

    if (wallet.available < totalDebit) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Wallet balance too low.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bills/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          providerId: selectedProvider,
          amount: finalAmount,
          accountNumber
        })
      })

      const result = await res.json()

      if (result.success) {
        await supabase.from('wallets').update({ available: (wallet?.available ?? 0) - (totalDebit), last_updated: new Date().toISOString() }).eq('user_id', user.id)

        await supabase.from('transactions').insert({
          user_id: user.id,
          title: `Bill Payment - ${providers.find(p => p.id === selectedProvider)?.name || selectedProvider}`,
          amount: finalAmount,
          type: 'expense',
          category: selectedCategory,
          created_at: new Date().toISOString(),
          status: 'completed',
          reference_id: result.transactionId,
          account_number: accountNumber
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

  if (stage === 'details') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <NexLogo />
            <div className="w-10" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-tight mb-1">Pay Bills</h1>
            <p className="text-[14px] text-gray-500 font-medium">Quick and secure utility payments.</p>
          </div>
        </header>

        <div className="px-6 py-8 space-y-6">
          <section>
            <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Select Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-[24px] border transition-all active:scale-95",
                    selectedCategory === cat.id 
                      ? "bg-primary/5 border-primary text-primary" 
                      : "bg-white border-gray-100 text-gray-400"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selectedCategory === cat.id ? "bg-primary text-white" : "bg-gray-50")}>
                    {cat.id === 'electricity' && <Zap size={20} />}
                    {cat.id === 'cable' && <Tv size={20} />}
                    {cat.id === 'internet' && <Wifi size={20} />}
                    {cat.id === 'betting' && <Target size={20} />}
                    {cat.id === 'education' && <GraduationCap size={20} />}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-tighter text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {selectedCategory && (
            <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white space-y-5 animate-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Provider</label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      {selectedCategory === 'electricity' ? 'Meter Number' : 
                       selectedCategory === 'cable' ? 'Smartcard / IUC Number' : 'Account Number'}
                    </label>
                    <div className="relative group">
                      <Input 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        onBlur={handleValidate}
                        placeholder="Enter Number"
                        className="h-14 rounded-2xl bg-gray-50 border-none pr-12"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {validating ? <Loader2 size={18} className="animate-spin text-primary" /> : <Search size={18} className="text-gray-300" />}
                      </div>
                    </div>
                    {customerName && <p className="text-[12px] text-primary font-bold ml-1 animate-in fade-in duration-300">{customerName}</p>}
                  </div>

                  {selectedCategory === 'electricity' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setMeterType('prepaid')}
                        className={cn("h-12 rounded-xl text-[12px] font-bold border transition-all", meterType === 'prepaid' ? "bg-primary text-white border-primary" : "bg-white text-gray-500 border-gray-100")}
                      >
                        Prepaid
                      </button>
                      <button 
                        onClick={() => setMeterType('postpaid')}
                        className={cn("h-12 rounded-xl text-[12px] font-bold border transition-all", meterType === 'postpaid' ? "bg-primary text-white border-primary" : "bg-white text-gray-500 border-gray-100")}
                      >
                        Postpaid
                      </button>
                    </div>
                  )}

                  {packages.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subscription Package</label>
                      <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none">
                          <SelectValue placeholder="Select Package" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                          {packages.map(pkg => <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} - ₦{pkg.price.toLocaleString()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Amount</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1A1A1A]">₦</span>
                        <Input 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                          placeholder="0.00"
                          className="pl-8 h-14 rounded-2xl bg-gray-50 border-none font-bold"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          <button 
            onClick={handleDetailsContinue}
            className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </div>
        <BottomNav />
      </main>
    )
  }

  if (stage === 'review') {
    const pkg = packages.find(p => p.id === selectedPackage);
    const finalAmt = pkg ? pkg.price : Number(amount);
    const serviceCharge = 100;
    const total = finalAmt + serviceCharge;

    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={() => setStage('details')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Review Payment</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-6 py-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary mx-auto mb-4">
              <CreditCard size={36} />
            </div>
            <div className="text-[32px] font-bold text-[#1A1A1A] mb-1">₦{total.toLocaleString()}</div>
            <p className="text-[13px] text-gray-500 font-medium">{providers.find(p => p.id === selectedProvider)?.name} Payment</p>
          </div>

          <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white mb-8 space-y-5">
            <SummaryRow label="Category" value={categories.find(c => c.id === selectedCategory)?.name || ''} />
            <SummaryRow label="Provider" value={providers.find(p => p.id === selectedProvider)?.name || ''} />
            {customerName && <SummaryRow label="Customer Name" value={customerName} />}
            <SummaryRow label="Account Number" value={accountNumber} />
            {pkg && <SummaryRow label="Package" value={pkg.name} />}
            <SummaryRow label="Bill Amount" value={`₦${finalAmt.toLocaleString()}`} />
            <SummaryRow label="Service Charge" value={`₦${serviceCharge.toLocaleString()}`} />
            <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[12px] font-bold text-primary uppercase tracking-widest">Total to Debit</span>
              <span className="text-[20px] font-bold text-primary">₦{total.toLocaleString()}</span>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStage('details')} className="py-4 bg-gray-100 text-gray-500 font-bold rounded-[22px] active:scale-95 transition-all">
              Edit Details
            </button>
            <button onClick={handleConfirm} className="py-4 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Confirm Payment
            </button>
          </div>
        </div>
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
          <div className="text-center mb-10">
            <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-2">Final Step</h2>
            <p className="text-[14px] text-gray-500">Securely verify your identity to complete the bill payment.</p>
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
            {loading ? <Loader2 className="animate-spin" /> : <>Complete Payment <ArrowRight size={18} /></>}
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
            Your bill payment has been processed successfully.
          </p>

          <Card className="w-full p-6 border-none shadow-soft rounded-[32px] bg-gray-50 mb-10 space-y-4">
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Reference</span>
                <span className="text-[#1A1A1A] font-bold uppercase">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
             </div>
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Total Charge</span>
                <span className="text-primary font-bold text-[18px]">₦{(Number(amount) || packages.find(p => p.id === selectedPackage)?.price || 0) + 100}</span>
             </div>
          </Card>

          <div className="w-full space-y-3">
            <button className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-[20px] flex items-center justify-center gap-2">
              <Download size={18} /> Download Receipt
            </button>
            <button onClick={() => router.push('/')} className="w-full py-4 bg-white text-primary font-bold rounded-[20px] border border-gray-100">
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
            We could not complete your bill payment. Please check your details and try again.
          </p>

          <div className="w-full space-y-3">
            <button onClick={() => setStage('authenticate')} className="w-full py-4 bg-primary text-white font-bold rounded-[20px]">
              Retry Payment
            </button>
            <button onClick={() => setStage('details')} className="w-full py-4 bg-white text-gray-500 font-bold rounded-[20px] border border-gray-100">
              Edit Details
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
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-[14px] font-bold text-[#1A1A1A]">{value}</span>
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
