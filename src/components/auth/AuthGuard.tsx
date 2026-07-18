'use client';

import React, { useState } from 'react';
import { useUser } from '@/firebase';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NexLogo } from '@/components/ui/NexLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Mail, Key, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ── Password / Sign-up handler ─────────────────────────────────────────────
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        setMessage('Account created! Check your email for the confirmation link.');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Magic link handler ─────────────────────────────────────────────────────
  const handleMagicLink = async () => {
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });
      if (err) throw err;
      setMessage('Magic link sent! Check your email inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Google OAuth handler ───────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (err) throw err;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setAuthLoading(false);
    }
  };

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <NexLogo className="mb-4 animate-pulse" />
          <div className="text-[15px] font-medium text-muted-foreground tracking-tight flex items-center gap-1">
            initializing <span className="font-light opacity-60">nex</span>
            <span className="font-bold">Monie</span>...
          </div>
        </div>
      </div>
    );
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAF9]">
        <Card className="w-full max-w-md p-10 border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[48px] bg-white">
          <div className="flex flex-col items-center mb-10 text-center">
            <NexLogo className="mb-10 scale-150" />
            <h1 className="text-[26px] font-light text-[#1A1A1A] tracking-tight leading-tight">
              {isSignUp ? (
                <>
                  create your <span className="font-light opacity-60">nex</span>
                  <span className="font-bold">Monie</span> account
                </>
              ) : (
                <>
                  welcome to <span className="font-light opacity-60">nex</span>
                  <span className="font-bold">Monie</span>
                </>
              )}
            </h1>
            <p className="text-[13px] text-gray-400 mt-4 font-medium leading-relaxed max-w-[240px]">
              {isSignUp
                ? 'Create your account to get started.'
                : 'Sign in to access your financial command center.'}
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="mb-6 rounded-[24px] border-red-50 bg-red-50/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold text-xs uppercase tracking-widest">
                Error
              </AlertTitle>
              <AlertDescription className="text-[11px] leading-snug">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-6 rounded-[24px] border-primary/20 bg-primary/5 text-primary">
              <Mail className="h-4 w-4" />
              <AlertTitle className="font-bold uppercase tracking-widest">
                Check your email
              </AlertTitle>
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          )}

          <Tabs
            defaultValue="password"
            onValueChange={() => {
              setError(null);
              setMessage(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-[20px] h-14 bg-gray-50/80 p-1.5 border border-gray-100/50">
              <TabsTrigger
                value="password"
                disabled={authLoading}
                className="rounded-[16px] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Key size={16} className="mr-2" /> Password
              </TabsTrigger>
              <TabsTrigger
                value="magic"
                disabled={authLoading}
                className="rounded-[16px] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Sparkles size={16} className="mr-2" /> Magic
              </TabsTrigger>
            </TabsList>

            {/* ── Password tab ── */}
            <TabsContent value="password">
              <form onSubmit={handleEmailAuth} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-[20px] h-14 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-[15px]"
                    disabled={authLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1"
                  >
                    Secure Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-[20px] h-14 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-[15px]"
                    disabled={authLoading}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 rounded-[20px] h-16 font-bold text-[17px] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : isSignUp ? (
                    'Launch Account'
                  ) : (
                    'Sign In Now'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── Magic link tab ── */}
            <TabsContent value="magic">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="magic-email"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-[20px] h-14 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-[15px]"
                    disabled={authLoading}
                    autoComplete="email"
                  />
                </div>
                <Button
                  onClick={handleMagicLink}
                  className="w-full bg-secondary hover:bg-secondary/95 rounded-[20px] h-16 font-bold text-[17px] text-white shadow-xl shadow-secondary/20 active:scale-[0.98] transition-all"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Request Magic Link'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* ── Divider ── */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.25em] text-gray-300">
              <span className="bg-white px-4">Trusted Login</span>
            </div>
          </div>

          {/* ── Google ── */}
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full h-14 rounded-[20px] font-bold border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-600"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-[14px] text-gray-400 mt-10">
            {isSignUp ? 'Member already?' : 'New to the hub?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4"
              type="button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
