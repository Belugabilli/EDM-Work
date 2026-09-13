import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Official Notifications | Student Alerts',
  description:
    'View official notifications, complaint status updates, and administrative advisories for VIT Bhopal University students.',
};

export default function StudentNotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
