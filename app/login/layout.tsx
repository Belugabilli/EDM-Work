import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | University Authentication',
  description:
    'Sign in securely to the VIT Bhopal Campus Complaint & Grievance Portal using your official university Google account.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
