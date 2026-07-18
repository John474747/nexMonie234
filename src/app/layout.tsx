import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'nex Monie | Elite Financial Command Center',
  description: 'Experience the future of bespoke banking with nex Monie. Smart, fast, and secure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#F8FAF9] text-[#1A1A1A] pb-24 overflow-x-hidden">
        <FirebaseClientProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
