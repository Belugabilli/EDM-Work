import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaint Investigation & Progress',
  description:
    'Comprehensive details, status timeline, admin remarks, and attachment evidence for your VIT Bhopal campus grievance.',
};

export default function ComplaintDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
