import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management & Roles | Admin Directory',
  description:
    'Directory of registered students and administrators, access suspension, role assignments, and campus account administration.',
};

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
