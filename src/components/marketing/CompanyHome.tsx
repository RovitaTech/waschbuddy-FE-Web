import Image from 'next/image';
import Link from 'next/link';

const CONTACT_EMAIL = 'rovitatech@gmail.com';

export function CompanyHome() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <Image
          src="/waschbuddy-logo-light.png"
          alt="WASCHBUDDY"
          width={280}
          height={90}
          priority
          className="h-auto w-56 sm:w-72"
        />
        <p className="mt-8 max-w-lg text-lg font-medium tracking-tight text-white/90 sm:text-xl">
          Smart laundry management for student housing and property operators
        </p>
        <p className="mt-4 max-w-md text-sm text-white/50">
          Full company site coming soon. Manage machines, reservations, and locations from one platform.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin"
            className="rounded-md border border-white/20 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Admin sign in
          </Link>
          <Link
            href="/privacy-policy"
            className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Privacy Policy
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-white/40">
        <p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} WASCHBUDDY</p>
      </footer>
    </div>
  );
}
