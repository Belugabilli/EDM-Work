import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Settings | Portal Configuration',
  description:
    'University system settings, institutional email restrictions, maintenance mode, and notification configurations.',
};

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
