import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Profile | Academic & Contact Details',
  description:
    'Manage your verified university credentials, contact phone number, department, branch, and hostel details at VIT Bhopal University.',
};

export default function StudentProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
