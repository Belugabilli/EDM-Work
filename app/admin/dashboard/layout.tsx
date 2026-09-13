import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Grievance Command Center',
  description:
    'Administrative dashboard for triage, escalation monitoring, category breakdown, and grievance lifecycle operations at VIT Bhopal University.',
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
