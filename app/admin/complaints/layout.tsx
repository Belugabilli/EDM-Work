import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaints Management | Admin Roster',
  description:
    'Comprehensive complaint triage, batch status transitions, officer assignment, priority filtering, and export for VIT Bhopal administrators.',
};

export default function AdminComplaintsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
