'use client';

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getApiBaseUrl } from '@/lib/config/environment';

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('Invalid reset link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}${ENDPOINTS.AUTH.SET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const responseMessage =
          (typeof payload?.message === 'string' && payload.message) ||
          (typeof payload?.error === 'string' && payload.error) ||
          (typeof payload?.message?.message === 'string' && payload.message.message) ||
          'Unable to set password. Please try again.';

        setError(responseMessage);
        return;
      }

      setSuccessMessage('Password set successfully. You can now login.');
      redirectTimerRef.current = setTimeout(() => {
        router.replace('/');
      }, 2000);
    } catch {
      setError('Unable to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const invalidLink = !token;

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm space-y-7">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Set Password</h1>
            <p className="text-lg text-slate-500">Create your password to continue.</p>
          </div>

          {invalidLink ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Invalid reset link
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-slate-700">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm text-slate-700">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Setting...' : 'Set Password'}
              </Button>
            </form>
          )}
        </div>
      </div>

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

        <div className="absolute -top-32 -left-16 h-[320px] w-[500px] rounded-full bg-fuchsia-500 opacity-60 blur-3xl" />
        <div className="absolute -top-16 left-32 h-[260px] w-[340px] rounded-full bg-purple-600 opacity-50 blur-3xl" />
        <div className="absolute top-24 left-8 h-[220px] w-[400px] rounded-full bg-blue-600 opacity-45 blur-3xl" />
        <div className="absolute top-56 -left-8 h-[180px] w-[360px] rounded-full bg-indigo-500 opacity-35 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-[260px] w-[440px] rounded-full bg-violet-600 opacity-40 blur-3xl" />
        <div className="absolute bottom-16 right-8 h-[200px] w-[300px] rounded-full bg-blue-500 opacity-30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/95 via-[#05050a]/40 to-transparent" />

        <div className="relative z-10 max-w-[620px] space-y-4 lg:space-y-5">
          <h2 className="max-w-[560px] text-5xl font-semibold leading-[1.02] tracking-tight lg:text-6xl">
            <span className="flex items-end gap-3 lg:gap-4">
              <span>Secure Access</span>
              <Image
                src="/waschbuddy-logo.svg"
                alt="WASCHBUDDY logo"
                width={88}
                height={88}
                className="h-12 w-auto shrink-0 lg:h-20"
              />
            </span>
            <span className="block">Ready to Login.</span>
          </h2>
          <p className="text-lg leading-snug text-blue-100/90 lg:text-2xl">
            Set your password and continue to the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

function SetPasswordFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <p className="text-sm text-slate-500">Loading set password form...</p>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<SetPasswordFallback />}>
      <SetPasswordContent />
    </Suspense>
  );
}