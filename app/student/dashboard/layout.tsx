import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Student Grievance Portal',
  description:
    'Real-time overview of active and resolved campus complaints, quick filing links, and administrative updates for VIT Bhopal students.',
};

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
