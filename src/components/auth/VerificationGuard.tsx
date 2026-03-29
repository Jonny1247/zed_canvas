"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // If customer is not verified, they MUST go to /verify/customer
      if (user.role === 'customer' && !user.isVerified) {
        if (!pathname.startsWith('/verify/customer')) {
          router.replace('/verify/customer');
        }
      }

      // If artist just signed up (unverified), they should be prompted to verify
      // But they can access the dashboard with a badge. 
      // The user said: "After completing signup, redirect them..." 
      // So we do a one-time redirect if they are 'unverified'
      if (user.role === 'artist' && user.verificationStatus === 'unverified') {
         if (!pathname.startsWith('/verify/artist')) {
           router.replace('/verify/artist');
         }
      }
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}
