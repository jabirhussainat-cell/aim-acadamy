import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIM Martial Arts Academy | Official Management & Belt Grading Platform',
  description:
    'Comprehensive martial arts organization portal for student management, affiliated training units, standardized belt testing, automated commission accounting, and secure payment processing. Contact: 8943839386.',
  keywords: [
    'Martial Arts Management',
    'Belt Testing Platform',
    'Karate Grading',
    'Taekwondo Examination',
    'Student Registration',
    'AIM Academy',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-rose-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
