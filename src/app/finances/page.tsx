"use client"

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { 
  Bell, 
  User, 
  Eye, 
  RefreshCw, 
  ArrowLeftRight, 
  Building2, 
  Plus, 
  Activity, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  Coins,
  ArrowDown,
  CreditCard,
  Wallet,
  Zap,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useCollection } from '@/firebase'
import { format } from 'date-fns'

const EXCHANGES = [
  { id: 'bybit', name: 'Bybit Account', status: 'Connected', balance: 42.50, lastSync: '2 mins ago', logo: 'B' },
  { id: 'binance', name: 'Binance Global', status: 'Syncing', balance: 34.00, lastSync: 'Just now', logo: 'BN' },
  { id: 'okx', name: 'OKX Personal', status: 'Reconnect', balance: 0, lastSync: '1 day ago', logo: 'O' },
]

export default function FinancesScreen() {
  const router = useRouter()
  const { user } = useUser()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | 'convert'>('convert')

  const { data: wallets, loading: walletsLoading } = useCollection(user ? { 
    table: 'wallets', 
    userId: user.id 
  } : null)
  const wallet = wallets?.[0]

  const { data: transactions, loading: transLoading } = useCollection(user ? {
    table: 'transactions',
    userId: user.id,
    order: 'created_at',
    limit: 10
  } : null)

  const nexBalance = Number(wallet?.available_balance || 300000)
  const exchangeBalance = 115000
  const totalPortfolio = nexBalance + exchangeBalance

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <main className="min-h-screen pb-36 bg-background">
      <header className="px-6 pt-8 pb-6 bg-white sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
          <NexLogo />
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-1">
              <Bell size={22} className="text-foreground" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">3</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-nex-xs bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
               <User size={20} className="text-gray-300" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full">
              Elite Assets
            </Badge>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-nex-tiny font-bold text-gray-400 uppercase tracking-widest">Digital Command</span>
          </div>
          <h1 className="text-nex-h1 font-bold text-foreground leading-tight">
            Portfolio Command
          </h1>
        </div>
      </header>

      <div className="px-6 mt-6 mb-10">
        <Card className="bg-[#005F56] relative border-none text-white overflow-hidden rounded-nex-2xl shadow-2xl pt-10 pb-8 px-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-nex-tiny opacity-70 font-bold tracking-widest uppercase">Total Net Worth</span>
                <Eye size={14} className="opacity-50" />
              </div>
              <button 
                onClick={handleRefresh}
                className={cn("p-2.5 bg-white/10 rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-90", isRefreshing && "animate-spin")}
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-nex-display font-black italic tracking-tight">
                ₦{new Intl.NumberFormat('en-NG').format(totalPortfolio)}
              </span>
              <span className="text-nex-h3 font-bold align-super opacity-60">.00</span>
            </div>

            <div className="flex items-center gap-3 mb-10">
               <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-nex-xs font-black uppercase tracking-wider flex items-center gap-2 border border-emerald-500/10">
                 <ArrowUpRight size={14} strokeWidth={3} />
                 +12.4% Growth
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
               <div className="space-y-1">
                 <span className="text-nex-xs font-bold text-white/40 uppercase tracking-[0.15em]">nex Wallet</span>
                 <p className="text-nex-h4 font-bold tracking-tight">₦{new Intl.NumberFormat('en-NG').format(nexBalance)}</p>
               </div>
               <div className="space-y-1 text-right">
                 <span className="text-nex-xs font-bold text-accent/80 uppercase tracking-[0.15em]">Exchanges</span>
                 <p className="text-nex-h4 font-bold tracking-tight">₦{new Intl.NumberFormat('en-NG').format(exchangeBalance)}</p>
               </div>
            </div>
          </div>
        </Card>
      </div>

      <section className="mb-12">
        <div className="px-7 flex items-center justify-between mb-6">
          <h2 className="text-nex-h4 font-bold text-foreground tracking-tight">Linked Platforms</h2>
          <button className="flex items-center gap-1.5 text-nex-xs font-bold text-accent active:scale-95 transition-all">
            <Plus size={16} /> Connect New
          </button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 px-6 pb-4">
            {EXCHANGES.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </section>

      <section className="px-6 mb-12">
        <h2 className="text-nex-h4 font-bold text-foreground mb-6 flex items-center gap-2.5">
           <ArrowLeftRight size={22} className="text-accent" />
           Transfer Center
        </h2>
        <div className="grid grid-cols-2 gap-4">
           <TransferAction icon={<ArrowLeftRight size={22} />} title="Cross-Exchange" sub="Asset movement" color="bg-blue-50 text-blue-600" accent="blue" />
           <TransferAction icon={<ArrowDownCircle size={22} />} title="Fund nex Wallet" sub="Move to nexMonie" color="bg-emerald-50 text-emerald-600" accent="emerald" />
           <TransferAction icon={<ArrowUpCircle size={22} />} title="Export Assets" sub="Transfer to Bybit" color="bg-accent/10 text-accent" accent="accent" />
           <TransferAction icon={<Building2 size={22} />} title="Bank Outflow" sub="Withdraw to Bank" color="bg-primary/10 text-primary" accent="primary" />
        </div>
      </section>

      <section className="px-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-nex-h4 font-bold text-foreground flex items-center gap-2.5">
            <Coins size={20} className="text-primary" />
            Trade & Convert
          </h2>
          <Badge variant="outline" className="text-[9px] font-black uppercase text-accent border-accent/20 px-2 py-0.5">Live Market</Badge>
        </div>

        <Card className="p-6 border-none shadow-nex-soft rounded-nex-xl bg-white space-y-6">
          <div className="flex bg-gray-50/80 p-1.5 rounded-nex-md">
            {(['buy', 'sell', 'convert'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTradeType(type)}
                className={cn(
                  "flex-1 py-3 rounded-nex-sm text-nex-xs font-bold uppercase tracking-widest transition-all",
                  tradeType === type ? "bg-white shadow-sm text-primary" : "text-gray-400"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-gray-50/50 rounded-nex-md border border-gray-100/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">From Asset</span>
                <span className="text-nex-xs font-bold text-primary opacity-80">Available: 0.12 BTC</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-full border border-gray-100 shadow-sm shrink-0">
                  <div className="w-5.5 h-5.5 bg-[#F7931A] rounded-full flex items-center justify-center text-white font-black text-[9px]">₿</div>
                  <span className="text-nex-body font-bold">BTC</span>
                </div>
                <input 
                  type="text" 
                  placeholder="0.00" 
                  className="bg-transparent border-none text-right text-nex-h2 font-black focus:ring-0 w-full p-0 tracking-tight"
                />
              </div>
            </div>

            <div className="flex justify-center -my-7 relative z-10">
              <button className="w-11 h-11 bg-white rounded-full shadow-lg border border-gray-50 flex items-center justify-center text-primary active:scale-90 transition-transform">
                <ArrowDown size={20} />
              </button>
            </div>

            <div className="p-5 bg-gray-50/50 rounded-nex-md border border-gray-100/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">To (Est.)</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-full border border-gray-100 shadow-sm shrink-0">
                  <div className="w-5.5 h-5.5 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black text-[9px]">₦</div>
                  <span className="text-nex-body font-bold">NGN</span>
                </div>
                <div className="text-right text-nex-h2 font-black text-foreground/30 tracking-tight">0.00</div>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 p-5 bg-primary/5 rounded-nex-md border border-primary/10">
             <TradeDetailRow label="Est. Rate" value="1 BTC ≈ ₦145.2M" />
             <TradeDetailRow label="Network Fee" value="0.0005 BTC" />
             <TradeDetailRow label="nex Fee" value="FREE" icon={<Zap size={10} className="text-accent fill-accent" />} />
             <div className="pt-3.5 mt-2 border-t border-primary/10 flex items-center justify-between">
                <span className="text-nex-body font-bold text-primary">Expected Return</span>
                <span className="text-nex-h4 font-black text-primary tracking-tight">₦0.00</span>
             </div>
          </div>

          <button className="w-full py-4.5 bg-primary text-white font-bold rounded-nex-md shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5">
            Complete Transaction <ArrowRight size={18} />
          </button>
        </Card>
      </section>

      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-nex-h4 font-bold text-foreground flex items-center gap-2.5">
            <Activity size={20} className="text-primary" />
            Financial Ledger
          </h2>
          <button onClick={() => router.push('/transactions')} className="text-nex-xs font-bold text-primary px-3.5 py-1.5 bg-primary/5 rounded-full border border-primary/10">
            View All
          </button>
        </div>
        
        {transLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <Card className="text-center py-16 bg-white rounded-nex-xl border border-dashed border-gray-100">
            <p className="text-gray-400 text-nex-sub font-bold">No ledger activity found.</p>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {transactions.map((tx: any) => (
              <TimelineRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  )
}

function TradeDetailRow({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-nex-xs">
      <span className="text-gray-400 font-bold uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-primary font-bold">{value}</span>
      </div>
    </div>
  )
}

function ExchangeCard({ exchange }: { exchange: any }) {
  const isSyncing = exchange.status === 'Syncing'
  const needsReconnect = exchange.status === 'Reconnect'

  return (
    <Card className="w-[210px] p-6.5 border-none shadow-nex-soft rounded-nex-xl bg-white flex flex-col gap-5 relative overflow-hidden group hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
      <div className={cn(
        "w-12 h-12 rounded-nex-sm flex items-center justify-center text-white font-black text-xl shadow-md mb-0.5",
        exchange.id === 'bybit' ? "bg-[#F5A623]" : exchange.id === 'binance' ? "bg-yellow-500" : "bg-black"
      )}>
        {exchange.logo}
      </div>
      
      <div>
        <h4 className="text-nex-body font-bold text-foreground leading-tight mb-1.5">{exchange.name}</h4>
        <div className="flex items-center gap-2">
           <div className={cn("w-1.5 h-1.5 rounded-full", isSyncing ? "bg-blue-500 animate-pulse" : needsReconnect ? "bg-accent" : "bg-emerald-500")} />
           <span className={cn("text-[9px] font-black uppercase tracking-widest", needsReconnect ? "text-accent" : "text-gray-400")}>
             {exchange.status}
           </span>
        </div>
      </div>

      <div className="mt-1">
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Portfolio Value</span>
        <p className="text-nex-h4 font-black text-foreground tracking-tight">
          {exchange.balance > 0 ? `$${exchange.balance.toLocaleString()}` : '••••••'}
        </p>
      </div>

      <div className="absolute top-5 right-6 text-gray-200 group-hover:text-primary transition-colors">
         <ExternalLink size={16} />
      </div>
    </Card>
  )
}

function TransferAction({ icon, title, sub, color, accent }: any) {
  return (
    <Card className="p-5.5 border-none shadow-nex-soft rounded-nex-xl bg-white flex flex-col items-start gap-1 relative overflow-hidden group hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer border-b border-gray-50/20">
      <div className={cn("w-11 h-11 rounded-nex-sm flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110", color)}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <h4 className="text-nex-sub font-bold text-foreground tracking-tight">{title}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1">{sub}</p>
      
      <div className={cn(
        "absolute -bottom-1 -right-1 w-9 h-9 rounded-tl-nex-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all",
        accent === 'accent' ? "bg-accent text-white" : accent === 'primary' ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
      )}>
        <ChevronRight size={16} strokeWidth={3} />
      </div>
    </Card>
  )
}

function TimelineRow({ tx }: any) {
  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  
  return (
    <div className="flex items-center justify-between p-4.5 bg-white rounded-nex-md shadow-nex-soft hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group border border-gray-50/30">
      <div className="flex items-center gap-4.5">
        <div className={cn(
          "w-12 h-12 rounded-nex-sm flex items-center justify-center shadow-sm",
          isIncome ? "bg-emerald-50 text-emerald-600" : isTransfer ? "bg-accent/10 text-accent" : "bg-gray-50 text-gray-400"
        )}>
          {isIncome ? <ArrowDownLeft size={22} /> : isTransfer ? <ArrowLeftRight size={20} /> : <ArrowUpRight size={22} />}
        </div>
        <div>
          <h5 className="text-nex-body font-bold text-foreground leading-tight mb-0.5 tracking-tight">{tx.title}</h5>
          <p className="text-nex-xs text-gray-400 font-bold uppercase tracking-widest">{tx.created_at ? format(new Date(tx.created_at), 'MMM d • h:mm a') : 'Syncing...'}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={cn("text-nex-body font-black tracking-tight", isIncome ? "text-emerald-500" : "text-foreground")}>
          {isIncome ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString()}
        </div>
        <span className="text-[9px] font-black px-2.5 py-1 bg-gray-50 rounded-full text-gray-400 uppercase tracking-widest border border-gray-100/50">
          {tx.category}
        </span>
      </div>
    </div>
  )
}
