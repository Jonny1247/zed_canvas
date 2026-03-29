"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { verifyCustomerOTP, submitCustomerOTP } from "@/lib/firebase/firestore";
import { 
  ShieldCheck, Loader2, Mail, MessageSquare, 
  RefreshCw, Smartphone, ArrowRight
} from "lucide-react";

export default function VerifyCustomerPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'customer')) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const generateAndSendCode = async () => {
    if (!user) return;
    setResending(true);
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await submitCustomerOTP(user.uid, otp);
      
      // Simulating sending via Email/SMS
      console.log(`[DEMO] Sending OTP ${otp} via ${method} to ${method === 'email' ? user.email : user.phone}`);
      
      toast({ 
        title: "Code Sent", 
        description: `A 6-digit verification code has been sent to your ${method}.`,
      });
      setTimeLeft(60);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      toast({ title: "Invalid Code", description: "Please enter the complete 6-digit code.", variant: "destructive" });
      return;
    }

    if (!user) return;
    setVerifying(true);
    try {
      const success = await verifyCustomerOTP(user.uid, fullCode);
      if (success) {
        toast({ title: "Account Verified", description: "Welcome to Zambian Canvas!" });
        router.push("/");
      } else {
        toast({ title: "Verification Failed", description: "Invalid or expired code. Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-12">
          <header className="text-center space-y-4">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 group-hover:rotate-0 transition-transform">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold font-headline tracking-tighter">Security Check.</h1>
            <p className="text-white/40 text-sm font-light leading-relaxed px-8">
              We've sent a 6-digit verification code to your {method === 'email' ? 'email address' : 'phone number'}.
            </p>
          </header>

          <div className="space-y-8">
            <div className="flex justify-between gap-3">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-full aspect-square text-center text-2xl font-bold bg-neutral-900 border border-white/10 focus:border-white focus:outline-none transition-all rounded-none"
                />
              ))}
            </div>

            <Button 
              onClick={handleVerify} 
              disabled={verifying || code.some(d => !d)}
              className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-none text-xs uppercase tracking-[0.4em] font-bold shadow-2xl transition-all"
            >
              {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Account"}
            </Button>
          </div>

          <footer className="space-y-8 text-center">
            <div className="flex flex-col gap-4">
              <button 
                onClick={timeLeft === 0 ? generateAndSendCode : undefined}
                disabled={timeLeft > 0 || resending}
                className={`text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${timeLeft > 0 ? 'text-white/20' : 'text-white/60 hover:text-white'}`}
              >
                {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {timeLeft > 0 ? `Resend Code (${timeLeft}s)` : "Resend Verification Code"}
              </button>
              
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setMethod('email')}
                  className={`flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold transition-all ${method === 'email' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <button 
                  onClick={() => setMethod('phone')}
                  className={`flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold transition-all ${method === 'phone' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> SMS
                </button>
              </div>
            </div>

            <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
              Having trouble? Contact our support team <br /> for manual identity verification.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
