import type { Metadata } from 'next';
import { CompanyHome } from '@/components/marketing/CompanyHome';

export const metadata: Metadata = {
  title: 'WASCHBUDDY — Smart laundry management',
  description:
    'WASCHBUDDY helps property operators and student housing run shared laundry — machines, reservations, and multi-location administration.',
  openGraph: {
    title: 'WASCHBUDDY',
    description: 'Smart laundry management for student housing and property operators.',
    type: 'website',
  },
};

export default function HomePage() {
  return <CompanyHome />;
}
