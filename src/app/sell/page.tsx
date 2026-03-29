
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/artist/upload");
  }, [router]);

  return <div className="min-h-screen bg-background flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">Redirecting to Upload...</div>;
}

