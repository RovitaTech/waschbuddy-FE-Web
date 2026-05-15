"use client";

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Switch } from '../../ui/switch';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import Image from 'next/image';
import { setStoredDataSource } from '@/lib/config/dataSource';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getApiBaseUrl } from '@/lib/config/environment';
import type { AuthCredentials } from '@/types';

interface AdminLoginProps {
  onLogin: (credentials: AuthCredentials) => Promise<void> | void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      setStoredDataSource('api');
      await onLogin({ email, password, isSuperAdmin });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMessage('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!response.ok) {
        setForgotMessage('Unable to send reset link right now. Please try again.');
        return;
      }

      setForgotMessage('If this email exists, a reset link has been sent.');
      setForgotEmail('');
    } catch {
      setForgotMessage('Unable to send reset link right now. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm space-y-7">
          {authView === 'login' ? (
            <>
              {/* Heading */}
              <div className="space-y-1">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Welcome Back !</h1>
                <p className="text-lg text-slate-500">Login to WASCHBUDDY</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email or phone number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember-me" className="text-sm font-normal text-slate-500 cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => {
                      setAuthView('forgot');
                      setForgotMessage(null);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="py-2">
                  <div className="flex items-center justify-between rounded-md bg-slate-50 border border-slate-100 p-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="super-admin"
                        checked={isSuperAdmin}
                        onCheckedChange={(checked) => setIsSuperAdmin(checked === true)}
                      />
                      <Label htmlFor="super-admin" className="text-sm font-medium text-slate-700 cursor-pointer">
                        Super admin
                      </Label>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Forgot Password?</h1>
                <p className="text-lg text-slate-500">Enter your email to receive a reset link.</p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleForgotPassword();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email" className="text-sm text-slate-700">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                    required
                  />
                </div>

                {forgotMessage && (
                  <p className="text-sm text-slate-600">{forgotMessage}</p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending...' : 'Send reset link'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-lg border-slate-200"
                  onClick={() => {
                    setAuthView('login');
                    setForgotMessage(null);
                  }}
                >
                  Back to login
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="relative m-2 hidden flex-1 flex-col justify-end overflow-hidden rounded-xl bg-[#05050a] p-6 text-white md:flex lg:m-3 lg:rounded-2xl lg:p-12">
        <div className="absolute left-4 top-4 z-20 lg:left-6 lg:top-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm lg:gap-2.5 lg:px-4 lg:py-2">
            <Image
              src="/waschbuddy-logo.svg"
              alt="WASCHBUDDY"
              width={20}
              height={20}
              className="h-4 w-auto lg:h-5"
            />
            <span className="text-xs font-semibold tracking-tight text-white lg:text-[15px]">WASCHBUDDY</span>
          </div>
        </div>

        {/* Gradient blobs */}
        <div className="absolute -top-32 -left-16 w-[500px] h-[320px] rounded-full bg-fuchsia-500 opacity-60 blur-3xl" />
        <div className="absolute -top-16 left-32 w-[340px] h-[260px] rounded-full bg-purple-600 opacity-50 blur-3xl" />
        <div className="absolute top-24 left-8 w-[400px] h-[220px] rounded-full bg-blue-600 opacity-45 blur-3xl" />
        <div className="absolute top-56 -left-8 w-[360px] h-[180px] rounded-full bg-indigo-500 opacity-35 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-[440px] h-[260px] rounded-full bg-violet-600 opacity-40 blur-3xl" />
        <div className="absolute bottom-16 right-8 w-[300px] h-[200px] rounded-full bg-blue-500 opacity-30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/95 via-[#05050a]/40 to-transparent" />

        <div className="relative z-10 max-w-[620px] space-y-4 lg:space-y-5">
          <h2 className="max-w-[560px] text-5xl font-semibold leading-[1.02] tracking-tight lg:text-6xl">
            <span className="flex items-end gap-3 lg:gap-4">
              <span>Smart Laundry</span>
              <Image
                src="/waschbuddy-logo.svg"
                alt="WASCHBUDDY logo"
                width={88}
                height={88}
                className="h-12 w-auto shrink-0 lg:h-20"
              />
            </span>
            <span className="block">Seamless Control.</span>
          </h2>
          <p className="text-lg leading-snug text-blue-100/90 lg:text-2xl">
            Manage machines, reservations, and locations for all from one dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}