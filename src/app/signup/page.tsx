"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { signUpWithEmail } from "@/lib/auth/actions";
import { useToast } from "@/hooks/use-toast";
import { Palette, User, Brush } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState<"customer" | "artist">("customer");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpWithEmail({ email, password, name, role, phone, whatsapp });
      toast({ title: "Welcome to Zambian Canvas!", description: `Your ${role} account has been created.` });
      // Role-based redirect
      if (role === "artist") {
        router.push("/artist/dashboard");
      } else {
        router.push("/explore");
      }
    } catch (err: any) {
      toast({ title: "Signup Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12">
        <div className="w-full max-w-lg bg-neutral-900 border border-white/10 p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <Palette className="h-10 w-10 text-white mb-4" />
            <h1 className="text-2xl font-headline font-bold text-white tracking-wider">Join The Collective</h1>
            <p className="text-muted-foreground text-sm mt-2 text-center">Create your Zambian Canvas account to buy or sell authentic art</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 flex flex-col items-center gap-2 py-4 border transition-all ${role === 'customer' ? 'bg-white text-black border-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/40'}`}
            >
              <User className={`h-5 w-5 ${role === 'customer' ? 'text-black' : 'text-white/50'}`} />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Collector</span>
              <span className={`text-[10px] ${role === 'customer' ? 'text-black/60' : 'text-white/30'}`}>Browse & buy art</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("artist")}
              className={`flex-1 flex flex-col items-center gap-2 py-4 border transition-all ${role === 'artist' ? 'bg-white text-black border-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/40'}`}
            >
              <Brush className={`h-5 w-5 ${role === 'artist' ? 'text-black' : 'text-white/50'}`} />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Artist</span>
              <span className={`text-[10px] ${role === 'artist' ? 'text-black/60' : 'text-white/30'}`}>Sell your artwork</span>
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Musa Roy"
                required
                className="w-full bg-black border border-white/20 h-12 px-4 text-white text-sm focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-black border border-white/20 h-12 px-4 text-white text-sm focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full bg-black border border-white/20 h-12 px-4 text-white text-sm focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
              />
            </div>

            {/* Phone & WhatsApp side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+260 97..."
                  required
                  className="w-full bg-black border border-white/20 h-12 px-4 text-white text-sm focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+260 97..."
                  required
                  className="w-full bg-black border border-white/20 h-12 px-4 text-white text-sm focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-[10px] uppercase tracking-[0.3em] font-bold bg-white text-black hover:bg-neutral-200 rounded-none mt-2"
            >
              {loading ? "Creating Account..." : `Create ${role === 'artist' ? 'Artist' : 'Collector'} Account`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="text-white border-b border-white hover:text-neutral-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
