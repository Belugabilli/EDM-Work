import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories & Routing | Department SLA Settings',
  description:
    'Manage complaint categories, default escalation hours, handling departments, and category availability across VIT Bhopal University.',
};

export default function AdminCategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
