"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/auth/actions";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      router.push("/");
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 p-8">
          <div className="flex flex-col items-center mb-8">
            <Palette className="h-10 w-10 text-white mb-4" />
            <h1 className="text-2xl font-headline font-bold text-white tracking-wider">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in to your Zambian Canvas account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-white/20 h-12 px-4 text-white focus:border-white focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black border border-white/20 h-12 px-4 text-white focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-xs uppercase tracking-widest font-bold bg-white text-black hover:bg-neutral-200 rounded-none">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-white border-b border-white hover:text-neutral-300 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
