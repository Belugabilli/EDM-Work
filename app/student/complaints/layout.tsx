import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Complaints | Track Status',
  description:
    'Track and filter all your lodged campus complaints, view administrative timeline, assigned officers, and resolution updates.',
};

export default function StudentComplaintsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
