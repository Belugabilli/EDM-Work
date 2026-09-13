import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Complaint | Lodge Grievance',
  description:
    'Lodge an official grievance for hostel maintenance, mess food quality, academic concerns, or IT infrastructure at VIT Bhopal University.',
};

export default function SubmitComplaintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
