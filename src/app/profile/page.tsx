"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import { Card } from '@/components/ui/card'
import { 
  Bell, 
  Settings, 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  Globe, 
  HelpCircle, 
  LogOut,
  Shield,
  CreditCard,
  History,
  Languages
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/firebase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

const LANGUAGES = [
  { id: 'English', label: 'English (UK)', flag: '🇬🇧' },
  { id: 'Yoruba', label: 'Yorùbá', flag: '🇳🇬' },
  { id: 'Igbo', label: 'Asụsụ Igbo', flag: '🇳🇬' },
  { id: 'Hausa', label: 'Harshen Hausa', flag: '🇳🇬' },
  { id: 'French', label: 'Français', flag: '🇫🇷' },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [langDialogOpen, setLangDialogOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('English')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLanguageChange = async (value: string) => {
    if (!user) return
    setSelectedLang(value)
    
    try {
      await supabase.from('profiles').update({ preferred_language: value }).eq('id', user.id)
      toast({
        title: "Language Updated",
        description: `Your preferred language is now set to ${value}.`,
      })
      setLangDialogOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="min-h-screen pb-32 bg-[#F8FAF9]">
      <header className="px-6 pt-10 pb-6 bg-white/50 backdrop-blur-xl border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <NexLogo />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-soft flex items-center justify-center border border-gray-100">
              <Bell size={20} className="text-[#1A1A1A]" />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white shadow-soft flex items-center justify-center border border-gray-100">
              <Settings size={20} className="text-[#1A1A1A]" />
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 py-10">
        <div className="bg-white rounded-[40px] p-8 shadow-soft border border-gray-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-6">
              <div className="w-[100px] h-[100px] rounded-[36px] bg-[#E8F5F3] flex items-center justify-center border-4 border-white shadow-lg overflow-hidden ring-1 ring-gray-100">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user?.user_metadata?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <NexLogo iconOnly className="w-12 h-12" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl shadow-lg flex items-center justify-center border-4 border-white active:scale-90 transition-transform cursor-pointer">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-[24px] font-bold text-[#1A1A1A] mb-1">
              {user?.displayName || 'Elite Member'}
            </h1>
            <p className="text-[14px] text-gray-400 font-medium mb-4">{user?.email}</p>

            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">nex Elite Verified</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 space-y-8">
        <div>
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4 px-2 flex items-center gap-2">
             Account Command
          </h2>
          <Card className="border-none shadow-soft rounded-[32px] bg-white overflow-hidden p-2">
            <div className="space-y-1">
              <SettingRow icon={<Shield size={18} />} title="Security & Privacy" subtitle="Biometrics & secure PIN" />
              <SettingRow icon={<CreditCard size={18} />} title="Manage Cards" subtitle="Virtual and physical nex Cards" />
              <SettingRow icon={<History size={18} />} title="Activity Logs" subtitle="Monitor your session history" />
              <SettingRow 
                onClick={() => setLangDialogOpen(true)} 
                icon={<Languages size={18} />} 
                title="Language" 
                subtitle="Local and international options" 
                extra={selectedLang} 
              />
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4 px-2 flex items-center gap-2">
             Preference & Help
          </h2>
          <Card className="border-none shadow-soft rounded-[32px] bg-white overflow-hidden p-2">
            <div className="space-y-1">
              <SettingRow icon={<Bell size={18} />} title="Notifications" subtitle="Alerts and smart updates" />
              <SettingRow onClick={() => router.push('/support')} icon={<HelpCircle size={18} />} title="Help Center" subtitle="24/7 expert financial support" />
              <SettingRow onClick={handleLogout} icon={<LogOut size={18} />} title="Sign Out" subtitle="Securely end your session" isDestructive />
            </div>
          </Card>
        </div>
      </section>

      {/* Language Selection Dialog */}
      <Dialog open={langDialogOpen} onOpenChange={setLangDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-[40px] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-[22px] font-bold text-[#1A1A1A] tracking-tight text-center">
              Choose Language
            </DialogTitle>
          </DialogHeader>
          
          <RadioGroup value={selectedLang} onValueChange={handleLanguageChange} className="space-y-3">
            {LANGUAGES.map((lang) => (
              <div key={lang.id} className="relative">
                <RadioGroupItem value={lang.id} id={lang.id} className="peer sr-only" />
                <Label
                  htmlFor={lang.id}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-[24px] border-2 cursor-pointer transition-all",
                    selectedLang === lang.id 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-gray-50 bg-gray-50/50 hover:border-gray-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-[15px] font-bold">{lang.label}</span>
                  </div>
                  {selectedLang === lang.id && <CheckCircle2 size={20} />}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </main>
  )
}

function SettingRow({ icon, title, subtitle, extra, isDestructive = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-5 rounded-[24px] active:bg-gray-50 transition-colors cursor-pointer text-left",
        isDestructive ? "hover:bg-red-50/50" : "hover:bg-gray-50/50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm",
          isDestructive ? "bg-red-50 text-red-500" : "bg-[#F0F7F6] text-primary"
        )}>
          {icon}
        </div>
        <div>
          <h4 className={cn("text-[15px] font-bold leading-tight mb-0.5", isDestructive ? "text-accent" : "text-[#1A1A1A]")}>
            {title}
          </h4>
          <p className="text-[11px] text-gray-500 font-medium leading-tight">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {extra && <span className="text-[12px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{extra}</span>}
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </div>
  )
}
