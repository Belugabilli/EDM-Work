import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grievance Review & Resolution | Admin Console',
  description:
    'Administrative case review, official response posting, evidence attachment access, and escalation control for campus complaints.',
};

export default function AdminComplaintDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
