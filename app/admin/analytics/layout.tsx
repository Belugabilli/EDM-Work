import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resolution Analytics & SLA Metrics | Admin Insights',
  description:
    'Analytics on resolution times, SLA compliance, department workload, and recurring grievance hotspots at VIT Bhopal University.',
};

export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
