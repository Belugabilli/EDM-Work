import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#002855",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://edm-work.vitonomous.com"),
  title: {
    default: "Campus Grievance & Redressal Portal | VIT Bhopal University",
    template: "%s | VIT Bhopal University",
  },
  description:
    "Official Campus Complaint and Grievance Management System for VIT Bhopal University. Submit complaints, track real-time resolution, and access administrative redressal services.",
  keywords: [
    "VIT Bhopal",
    "Campus Complaint",
    "Grievance Management",
    "VIT Bhopal University",
    "Hostel Complaints",
    "Academic Redressal",
    "Student Portal",
    "Admin Portal",
  ],
  authors: [{ name: "VIT Bhopal University" }],
  creator: "VIT Bhopal University",
  publisher: "VIT Bhopal University",
  icons: {
    icon: "/vit-bhopal-logo.png",
    shortcut: "/vit-bhopal-logo.png",
    apple: "/vit-bhopal-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://edm-work.vitonomous.com",
    siteName: "VIT Bhopal University Grievance Portal",
    title: "VIT Bhopal University - Campus Complaint Management System",
    description:
      "Secure university portal for lodging campus complaints, tracking redressal status, and viewing administrative updates.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
