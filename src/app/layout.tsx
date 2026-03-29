import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Zambian Canvas | Discover Authentic Zambian Art',
  description: 'Connecting artists and art lovers in a vibrant, African-inspired marketplace.',
};

import { AuthProvider } from "@/lib/auth/AuthContext";
import { VerificationGuard } from "@/components/auth/VerificationGuard";

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Alegreya:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30">
        <AuthProvider>
          <VerificationGuard>
            {children}
          </VerificationGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
