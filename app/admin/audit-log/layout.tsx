import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audit Logs & Security | Compliance Trail',
  description:
    'Immutable security audit trail recording all grievance actions, status changes, assignments, and administrative decisions.',
};

export default function AdminAuditLogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
