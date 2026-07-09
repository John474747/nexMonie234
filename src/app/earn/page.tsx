"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search, 
  Eye, 
  Clock, 
  Users, 
  User,
  Code,
  PenTool,
  Palette,
  ArrowRight,
  Sparkles,
  Globe,
  Twitter,
  Github,
  MessageCircle,
  Link2,
  Layers,
  Award,
  ShieldCheck,
  X,
  Bookmark,
  Cpu,
  Target,
  Landmark,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  FileText
} from 'lucide-react'
import { useCollection, useUser } from '@/firebase'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Progress } from '@/components/ui/progress'

const CATEGORIES = [
  { id: 'all', label: 'All Discovery', icon: <Layers size={14} /> },
  { id: 'Grant', label: 'Grants & Funding', icon: <Landmark size={14} /> },
  { id: 'Bounty', label: 'Bounties', icon: <Target size={14} /> },
  { id: 'Development', label: 'Engineering', icon: <Code size={14} /> },
  { id: 'AI', label: 'AI & Intelligence', icon: <Cpu size={14} /> },
  { id: 'Design', label: 'Creative & UI', icon: <Palette size={14} /> },
  { id: 'Governance', label: 'Governance', icon: <ShieldCheck size={14} /> },
  { id: 'Content', label: 'Writing & Docs', icon: <PenTool size={14} /> },
]

const CAREER_READINESS_ITEMS = [
  { id: 'email', label: 'Verified Email', icon: <Mail size={18} />, action: 'Verify', isComplete: true },
  { id: 'profile', label: 'Talent Profile', icon: <User size={18} />, action: 'Complete', isComplete: false },
  { id: 'wallet', label: 'Web3 Wallet', icon: <Link2 size={18} />, action: 'Connect', isComplete: false },
]

type AppStep = 'details' | 'eligibility' | 'entry' | 'review' | 'success'

export default function EarnScreen() {
  const { user } = useUser()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [appStep, setAppStep] = useState<AppStep>('details')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: tasks, loading } = useCollection({ 
    table: 'tasks',
    limit: 50
  })

  const mockTasks = [
    { 
      id: '1', 
      title: 'Decentralized Identity Framework Grant', 
      company: 'Solana Foundation', 
      category: 'Grant', 
      price: 15000, 
      currency: 'USDC', 
      days_left: 14, 
      applicants: 82, 
      is_verified: true, 
      difficulty: 'Expert',
      ecosystem: 'Solana',
      description: 'Propose and build a zero-knowledge identity layer for the Solana ecosystem. Focus on privacy, speed, and interoperability.',
      is_featured: true
    }
  ]

  const filteredTasks = useMemo(() => {
    const list = (tasks && tasks.length > 0) ? tasks : mockTasks
    return list.filter(t => 
      (t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [tasks, searchQuery])

  const handleOpenTask = (task: any) => {
    setSelectedTask(task)
    setAppStep('details')
  }

  return (
    <main className="min-h-screen pb-32 bg-background">
      <header className="px-6 pt-8 pb-6 bg-white sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <NexLogo />
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-1">
              <Bell size={24} className="text-foreground" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">5</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-nex-xs bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-gray-300" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold uppercase tracking-widest text-nex-xs px-3 py-1 rounded-full">
            Elite Marketplace
          </Badge>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-nex-tiny font-bold text-gray-400 uppercase tracking-widest">Active Opportunities</span>
        </div>
        <h1 className="text-nex-h1 font-bold text-foreground leading-tight">
          Discover & Earn
        </h1>
      </header>

      {/* Premium Career Readiness Card */}
      <section className="px-6 mt-8 mb-10">
        <Card className="p-8 rounded-nex-2xl bg-white border border-gray-100 shadow-nex-soft overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-nex-h3 font-bold text-foreground mb-1 leading-tight">Career Readiness</h2>
              <p className="text-nex-xs text-gray-400 font-bold uppercase tracking-widest">Complete your profile to apply</p>
            </div>
            
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#F1F5F9" strokeWidth="5" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#F88F99" strokeWidth="5" fill="none" strokeDasharray="175.9" strokeDashoffset="70.36" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-nex-caption font-black text-[#1A1A1A]">60%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {CAREER_READINESS_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-nex-sm bg-gray-50/50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-nex-xs flex items-center justify-center shadow-sm",
                    item.isComplete ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  )}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-nex-sub font-bold text-foreground leading-none mb-1">{item.label}</h4>
                    <p className={cn("text-nex-tiny font-bold uppercase tracking-tighter", item.isComplete ? "text-emerald-500" : "text-accent")}>
                      {item.isComplete ? 'Complete' : 'Required'}
                    </p>
                  </div>
                </div>
                {!item.isComplete && (
                  <button className="px-4 py-2 bg-white border border-accent/20 text-accent text-nex-xs font-bold rounded-full shadow-sm active:scale-95 transition-all">
                    {item.action}
                  </button>
                )}
                {item.isComplete && (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="px-6 mb-12">
        <h3 className="text-nex-body font-bold text-foreground mb-5 px-1 flex items-center justify-between">
           Discovery Metrics
           <Eye size={16} className="text-gray-300" />
        </h3>
        <div className="grid grid-cols-2 gap-4">
           <MetricCard label="Live Jobs" value="1,248" icon={<Globe size={18} className="text-blue-500" />} sub="Trending" color="blue" />
           <MetricCard label="Reputation" value="Elite Lvl 4" icon={<Award size={18} className="text-accent" />} sub="Top 5%" color="accent" />
           <MetricCard label="Applications" value="12" icon={<Layers size={18} className="text-emerald-500" />} sub="4 Reviewing" color="emerald" />
           <MetricCard label="Rewards" value="₦125.6k" icon={<Sparkles size={18} className="text-primary" />} sub="+18.5%" color="primary" />
        </div>
      </section>

      <section className={cn(
        "px-6 transition-all duration-300 mb-8",
        isScrolled ? "sticky top-[96px] z-40" : ""
      )}>
        <div className="relative group mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
          <Input 
            placeholder="Search tasks, stacks or rewards..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-16 rounded-nex-md bg-white border-none shadow-nex-soft text-nex-body focus-visible:ring-1 focus-visible:ring-accent/20" 
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap -mx-6 px-6">
          <div className="flex w-max space-x-2.5 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full text-nex-caption font-bold transition-all border",
                  selectedCategory === cat.id 
                    ? "bg-accent text-white border-accent shadow-nex-soft" 
                    : "bg-white text-gray-500 border-gray-100 hover:border-accent/30"
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </section>

      <section className="px-6">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <h2 className="text-nex-h4 font-bold text-foreground">Curated Discovery</h2>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_12px_rgba(248,143,153,0.6)]" />
           </div>
        </div>

        <div className="space-y-6">
          {filteredTasks.map((task: any) => (
            <OpportunityCard 
              key={task.id} 
              task={task} 
              onClick={() => handleOpenTask(task)} 
            />
          ))}
        </div>
      </section>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl rounded-nex-max p-0 border-none shadow-2xl overflow-hidden bg-background">
           <ScrollArea className="max-h-[90vh]">
              {appStep === 'details' && (
                <div className="relative">
                  <div className="h-44 bg-gradient-to-br from-[#1A1A1A] to-[#333333] relative">
                    <button 
                      onClick={() => setSelectedTask(null)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all z-20"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="relative -mt-12 px-8 pb-10">
                    <div className="w-24 h-24 rounded-nex-lg bg-white p-2 shadow-2xl mb-6 relative z-10 border border-gray-100/50">
                        <div className={cn(
                          "w-full h-full rounded-nex-md flex items-center justify-center text-white text-[32px] font-black italic shadow-inner",
                          selectedTask?.category === 'Grant' ? "bg-primary" : "bg-accent"
                        )}>
                          {selectedTask?.company?.charAt(0).toLowerCase()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-nex-body font-bold text-primary">{selectedTask?.company}</h3>
                        {selectedTask?.is_verified && <ShieldCheck size={16} className="text-blue-500" fill="currentColor" />}
                    </div>
                    <h2 className="text-nex-h1 font-bold text-foreground leading-tight mb-5 tracking-tight">{selectedTask?.title}</h2>

                    <div className="flex flex-wrap gap-2 mb-8">
                        <Badge variant="outline" className="bg-white border-gray-100 text-foreground font-bold py-2 px-5 rounded-full shadow-sm">
                          <Target size={14} className="mr-2 text-primary" /> {selectedTask?.category}
                        </Badge>
                        <Badge variant="outline" className="bg-white border-gray-100 text-emerald-500 font-bold py-2 px-5 rounded-full shadow-sm">
                          <span className="mr-2 font-black">₦</span> {selectedTask?.price?.toLocaleString()} {selectedTask?.currency || 'USDC'}
                        </Badge>
                        <Badge variant="outline" className="bg-white border-gray-100 text-accent font-bold py-2 px-5 rounded-full shadow-sm">
                          <Layers size={14} className="mr-2 text-accent" /> {selectedTask?.ecosystem || 'Solana'}
                        </Badge>
                    </div>

                    <Card className="p-8 border-none shadow-nex-soft rounded-nex-3xl bg-white mb-8">
                        <h4 className="text-nex-body font-bold text-foreground mb-4">Deep Dive Overview</h4>
                        <p className="text-nex-body text-gray-500 leading-relaxed font-medium mb-8">
                          {selectedTask?.description || "This is a native nex Monie ecosystem opportunity curated to empower our elite members through high-impact professional contributions."}
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-8 border-t border-gray-50 pt-8">
                          <div className="space-y-1.5">
                              <span className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">Candidates</span>
                              <p className="text-nex-h4 font-bold">{selectedTask?.applicants} Entries</p>
                          </div>
                          <div className="space-y-1.5">
                              <span className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">Deadline</span>
                              <p className="text-nex-h4 font-bold text-accent">{selectedTask?.days_left} Days Left</p>
                          </div>
                        </div>
                    </Card>

                    <div className="flex gap-4">
                        <button 
                          onClick={() => setAppStep('eligibility')}
                          className="flex-1 h-16 bg-primary text-white font-bold rounded-nex-md shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          Check Eligibility <ChevronRight size={20} />
                        </button>
                        <button className="w-16 h-16 bg-white border border-gray-100 rounded-nex-md flex items-center justify-center text-foreground shadow-nex-soft active:scale-[0.98] transition-all">
                          <Bookmark size={24} />
                        </button>
                    </div>
                  </div>
                </div>
              )}

              {appStep === 'eligibility' && (
                <div className="p-10">
                   <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setAppStep('details')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <X size={20} />
                      </button>
                      <h2 className="text-nex-h3 font-bold text-foreground">Eligibility Check</h2>
                   </div>

                   <Card className="p-8 border-none shadow-nex-soft rounded-nex-3xl bg-white mb-10">
                      <div className="space-y-6">
                         <EligibilityRow label="Verified Email" isComplete={true} />
                         <EligibilityRow label="Talent Profile" isComplete={false} description="Please complete your experience and skills." />
                         <EligibilityRow label="Web3 Wallet" isComplete={false} description="Link a Solana or Ethereum wallet." />
                      </div>
                   </Card>

                   <div className="bg-accent/5 p-6 rounded-nex-lg border border-accent/10 mb-10 flex gap-4">
                      <AlertCircle className="text-accent shrink-0" />
                      <p className="text-nex-sub text-gray-600 font-medium">You need to complete missing requirements before you can create an entry for this opportunity.</p>
                   </div>

                   <button 
                    onClick={() => setAppStep('entry')}
                    className="w-full h-16 bg-primary text-white font-bold rounded-nex-md shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                   >
                     Complete & Continue <ChevronRight size={20} />
                   </button>
                </div>
              )}

              {appStep === 'entry' && (
                <div className="p-10">
                   <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setAppStep('eligibility')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <X size={20} />
                      </button>
                      <h2 className="text-nex-h3 font-bold text-foreground">Create Entry</h2>
                   </div>

                   <div className="space-y-8 mb-10">
                      <div className="space-y-2">
                         <label className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">Why are you the best fit? *</label>
                         <textarea 
                          placeholder="Briefly describe your experience relevant to this task..."
                          className="w-full min-h-[120px] p-5 rounded-nex-lg bg-gray-50 border-none focus:ring-1 focus:ring-primary/20 text-nex-body"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">Proof of Work / Previous Links *</label>
                         <textarea 
                          placeholder="GitHub repos, portfolio links, or previous grant reports..."
                          className="w-full min-h-[120px] p-5 rounded-nex-lg bg-gray-50 border-none focus:ring-1 focus:ring-primary/20 text-nex-body"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">External Links (Optional)</label>
                         <Input 
                          placeholder="X (Twitter), LinkedIn, or Website"
                          className="h-14 rounded-nex-lg bg-gray-50 border-none px-5"
                         />
                      </div>
                   </div>

                   <button 
                    onClick={() => setAppStep('review')}
                    className="w-full h-16 bg-primary text-white font-bold rounded-nex-md shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                   >
                     Review Entry <ChevronRight size={20} />
                   </button>
                </div>
              )}

              {appStep === 'review' && (
                 <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                       <button onClick={() => setAppStep('entry')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                         <X size={20} />
                       </button>
                       <h2 className="text-nex-h3 font-bold text-foreground">Review & Submit</h2>
                    </div>

                    <Card className="p-8 border-none shadow-nex-soft rounded-nex-3xl bg-white mb-10 space-y-6">
                       <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                          <div className="w-14 h-14 rounded-nex-sm bg-primary/10 flex items-center justify-center text-primary">
                             <FileText size={24} />
                          </div>
                          <div>
                             <h4 className="text-nex-sub font-bold text-foreground leading-none mb-1">Applying for:</h4>
                             <p className="text-nex-h4 font-bold text-primary line-clamp-1">{selectedTask?.title}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div>
                             <span className="text-nex-tiny font-bold text-gray-400 uppercase tracking-widest block mb-1">Reward Potential</span>
                             <p className="text-nex-body font-bold text-emerald-500">₦{selectedTask?.price?.toLocaleString()} {selectedTask?.currency || 'USDC'}</p>
                          </div>
                          <div>
                             <span className="text-nex-tiny font-bold text-gray-400 uppercase tracking-widest block mb-1">Ecosystem</span>
                             <p className="text-nex-body font-bold">{selectedTask?.ecosystem || 'Cross'}</p>
                          </div>
                       </div>
                    </Card>

                    <p className="text-nex-xs text-gray-400 text-center mb-8 px-8">By submitting, you agree to the nex Monie talent guidelines and project-specific terms.</p>

                    <button 
                      onClick={() => setAppStep('success')}
                      className="w-full h-16 bg-primary text-white font-bold rounded-nex-md shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      Confirm & Submit Entry <Sparkles size={20} />
                    </button>
                 </div>
              )}

              {appStep === 'success' && (
                <div className="p-10 text-center flex flex-col items-center justify-center py-20">
                   <div className="w-24 h-24 bg-primary rounded-nex-lg flex items-center justify-center text-white mb-8 shadow-2xl shadow-primary/30 animate-in zoom-in-50 duration-500">
                      <CheckCircle2 size={56} />
                   </div>
                   <h2 className="text-nex-h1 font-bold text-foreground mb-4 leading-tight">Entry Submitted!</h2>
                   <p className="text-nex-body text-gray-500 font-medium mb-12 max-w-[280px]">Your application for <strong>{selectedTask?.title}</strong> is now under review by the {selectedTask?.company} team.</p>

                   <div className="w-full space-y-4">
                      <button className="w-full h-16 bg-primary/10 text-primary font-bold rounded-nex-md active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        Track Application Status <ChevronRight size={20} />
                      </button>
                      <button 
                        onClick={() => setSelectedTask(null)}
                        className="w-full h-16 bg-white border border-gray-100 text-gray-400 font-bold rounded-nex-md active:scale-[0.98] transition-all"
                      >
                        Return to Discovery
                      </button>
                   </div>
                </div>
              )}
           </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </main>
  )
}

function EligibilityRow({ label, isComplete, description }: { label: string, isComplete: boolean, description?: string }) {
  return (
    <div className="flex items-start gap-5">
       <div className={cn(
         "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2",
         isComplete ? "bg-primary border-primary text-white" : "bg-white border-gray-200 text-gray-200"
       )}>
          {isComplete && <CheckCircle2 size={16} />}
       </div>
       <div className="flex-1 min-w-0 pt-0.5">
          <h4 className={cn("text-nex-body font-bold leading-none mb-1", isComplete ? "text-foreground" : "text-gray-300")}>{label}</h4>
          {!isComplete && description && <p className="text-nex-tiny text-gray-400 font-medium leading-snug">{description}</p>}
       </div>
       {!isComplete && (
         <button className="text-nex-xs font-black text-primary uppercase tracking-widest pt-0.5">Fix</button>
       )}
    </div>
  )
}

function MetricCard({ label, value, icon, sub, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-50/50",
    accent: "text-accent bg-accent/5",
    emerald: "text-emerald-500 bg-emerald-50/50",
    primary: "text-primary bg-primary/5"
  }

  return (
    <Card className="p-5 border-none shadow-nex-soft rounded-nex-lg bg-white flex flex-col items-start gap-1 relative overflow-hidden group hover:shadow-lg transition-all border-b border-gray-50/30">
      <div className={cn("absolute top-0 right-0 w-12 h-12 rounded-bl-nex-md flex items-center justify-center transition-all group-hover:scale-110", colorMap[color])}>
        {icon}
      </div>
      <span className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <p className="text-nex-h4 font-bold text-foreground leading-tight mb-1 tracking-tight">{value}</p>
      <span className={cn(
        "text-nex-xs font-bold flex items-center gap-1",
        color === 'accent' ? "text-accent" : color === 'primary' ? "text-primary" : "text-emerald-500"
      )}>
         {sub}
      </span>
    </Card>
  )
}

function OpportunityCard({ task, onClick }: { task: any, onClick: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "p-6 border border-gray-100/80 shadow-nex-soft rounded-nex-3xl bg-white flex flex-col gap-6 hover:shadow-lg hover:-translate-y-1 transition-all active:scale-[0.98] group cursor-pointer relative overflow-hidden",
        task.is_featured && "border-accent/20 bg-gradient-to-br from-white to-accent/[0.02]"
      )}
    >
      {task.is_featured && (
        <div className="absolute top-0 right-0 bg-accent text-white text-nex-xs font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-bl-nex-md shadow-md">
          Featured
        </div>
      )}

      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <div className={cn(
            "w-20 h-20 rounded-nex-md flex items-center justify-center text-white overflow-hidden shadow-md border-[5px] border-white",
            task.category === 'Grant' ? "bg-primary" : "bg-accent"
          )}>
            <div className="w-full h-full flex items-center justify-center bg-black/5">
              <span className="text-nex-h2 font-black italic tracking-tighter">{task.company?.charAt(0).toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-nex-xs font-bold text-accent uppercase tracking-[0.15em] truncate max-w-[150px]">
              {task.company}
            </span>
            {task.is_verified && (
              <ShieldCheck size={16} className="text-blue-500 shrink-0" fill="currentColor" />
            )}
          </div>
          
          <h4 className="text-nex-h4 font-bold text-foreground mb-4 leading-[1.2] group-hover:text-accent transition-colors line-clamp-2 tracking-tight">
            {task.title}
          </h4>

          <div className="flex flex-wrap gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-nex-xs font-bold border border-emerald-100/50">
                <span className="text-nex-tiny font-black opacity-80">₦</span>
                <span>{task.price?.toLocaleString()} {task.currency || 'USDC'}</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full text-nex-xs font-bold border border-gray-100">
                <Clock size={12} className="text-gray-400" />
                <span>{task.days_left}d</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-500 rounded-full text-nex-xs font-bold border border-blue-100/50">
                <Layers size={12} />
                <span className="truncate max-w-[60px]">{task.ecosystem || 'Cross'}</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full text-nex-xs font-bold border border-gray-100">
                <Users size={12} className="text-gray-400" />
                <span>{task.applicants} Entries</span>
             </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
