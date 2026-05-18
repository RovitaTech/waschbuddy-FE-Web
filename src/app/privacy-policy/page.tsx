import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PrivacyPolicyContent } from '@/components/legal/PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | WASCHBUDDY',
  description:
    'Privacy Policy for WASCHBUDDY — web admin, mobile apps, data preservation, and GDPR compliance.',
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:text-left">
          <Link href="/" className="shrink-0">
            <Image
              src="/waschbuddy-logo-light.png"
              alt="WASCHBUDDY"
              width={200}
              height={64}
              priority
              className="h-14 w-auto"
            />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Privacy Policy</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Web administration, mobile apps, data preservation &amp; GDPR
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 pb-16">
        <PrivacyPolicyContent />

        <footer className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            Questions?{' '}
            <a href="mailto:rovitatech@gmail.com" className="font-medium text-foreground underline-offset-4 hover:underline">
              rovitatech@gmail.com
            </a>
          </p>
          <p className="mt-2">
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to WASCHBUDDY
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
