"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/firebase/storage";
import { submitVerificationRequest } from "@/lib/firebase/firestore";
import { 
  User, CreditCard, FileText, CheckCircle2, 
  Upload, Loader2, Camera, ShieldCheck 
} from "lucide-react";

export default function VerifyArtistPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Files State
  const [portrait, setPortrait] = useState<File | null>(null);
  const [nrcFront, setNrcFront] = useState<File | null>(null);
  const [nrcBack, setNrcBack] = useState<File | null>(null);
  const [portfolio, setPortfolio] = useState<File | null>(null);
  
  // Previews
  const [previews, setPreviews] = useState({
    portrait: "",
    nrcFront: "",
    nrcBack: "",
    portfolio: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'artist')) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof previews) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'portfolio') {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({ title: "Invalid File", description: "Please upload an image or PDF for your portfolio.", variant: "destructive" });
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please upload an image.", variant: "destructive" });
        return;
      }
    }

    if (type === 'portrait') setPortrait(file);
    if (type === 'nrcFront') setNrcFront(file);
    if (type === 'nrcBack') setNrcBack(file);
    if (type === 'portfolio') setPortfolio(file);

    setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  const nextStep = () => {
    if (step === 1 && !portrait) {
      toast({ title: "Image Required", description: "Please upload a portrait photo.", variant: "destructive" });
      return;
    }
    if (step === 2 && (!nrcFront || !nrcBack)) {
      toast({ title: "NRC Required", description: "Please upload both front and back of your NRC.", variant: "destructive" });
      return;
    }
    if (step === 3 && !portfolio) {
      toast({ title: "Document Required", description: "Please upload your CV or portfolio.", variant: "destructive" });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setUploading(true);
    try {
      toast({ title: "Uploading Documents", description: "Please wait while we secure your files." });
      
      const portraitUrl = await uploadFile(portrait!, `verifications/${user.uid}/portrait`);
      const nrcFrontUrl = await uploadFile(nrcFront!, `verifications/${user.uid}/nrc_front`);
      const nrcBackUrl = await uploadFile(nrcBack!, `verifications/${user.uid}/nrc_back`);
      const portfolioUrl = await uploadFile(portfolio!, `verifications/${user.uid}/portfolio`);

      await submitVerificationRequest({
        userId: user.uid,
        role: 'artist',
        portraitUrl,
        nrcFrontUrl,
        nrcBackUrl,
        portfolioUrl
      });

      setStep(4);
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="h-24 w-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold font-headline tracking-tighter">Under Review.</h1>
              <p className="text-white/40 text-lg font-light leading-relaxed">
                Your credentials have been submitted securely. Our curators will verify your account within <span className="text-white font-medium">24 to 48 hours</span>.
              </p>
            </div>
            <div className="bg-neutral-900/50 border border-white/5 p-6 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">What happens next?</p>
              <p className="text-xs text-white/30 leading-relaxed">
                You can still access your dashboard, but your public profile and artworks will remain hidden until approval.
              </p>
            </div>
            <Button onClick={() => router.push("/artist/dashboard")} className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-none text-xs uppercase tracking-[0.3em] font-bold">
              Go to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">Artist Verification</span>
            <div className="h-px flex-grow bg-white/5" />
            <span className="text-[10px] font-bold text-white/20">Step {step} of 3</span>
          </div>
          <h1 className="text-6xl font-bold font-headline tracking-tighter">Verify Identity.</h1>
          <Progress value={(step / 3) * 100} className="h-1 bg-white/5 rounded-none" />
        </header>

        <div className="bg-neutral-900 border border-white/10 p-12 space-y-12">
          {/* Step 1: Portrait */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-white/40" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Step 1: Portrait Photo</h2>
                </div>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Please upload a clear, front-facing portrait of yourself. This helps us confirm the artist behind the work.
                </p>
              </div>

              <div 
                className={`relative aspect-square max-w-[300px] mx-auto border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center ${previews.portrait ? 'border-white/20' : 'border-white/10 hover:border-white/30'}`}
                onClick={() => document.getElementById('portrait-input')?.click()}
              >
                {previews.portrait ? (
                  <Image src={previews.portrait} alt="Portrait" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/20 group-hover:text-white/40 transition-colors">
                    <Camera className="h-10 w-10" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Select Image</span>
                  </div>
                )}
                <input id="portrait-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'portrait')} />
              </div>
            </div>
          )}

          {/* Step 2: NRC */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-white/40" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Step 2: National ID (NRC)</h2>
                </div>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Upload high-quality photos of your National Registration Card. We need to verify both the front and the back.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Front of NRC</p>
                  <div 
                    className="aspect-[1.6/1] border-2 border-dashed border-white/10 hover:border-white/30 transition-all cursor-pointer relative flex flex-col items-center justify-center text-white/20"
                    onClick={() => document.getElementById('nrcFront-input')?.click()}
                  >
                    {previews.nrcFront ? <Image src={previews.nrcFront} alt="NRC Front" fill className="object-cover" /> : <Upload className="h-8 w-8" />}
                    <input id="nrcFront-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'nrcFront')} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Back of NRC</p>
                  <div 
                    className="aspect-[1.6/1] border-2 border-dashed border-white/10 hover:border-white/30 transition-all cursor-pointer relative flex flex-col items-center justify-center text-white/20"
                    onClick={() => document.getElementById('nrcBack-input')?.click()}
                  >
                    {previews.nrcBack ? <Image src={previews.nrcBack} alt="NRC Back" fill className="object-cover" /> : <Upload className="h-8 w-8" />}
                    <input id="nrcBack-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'nrcBack')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Portfolio */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-white/40" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Step 3: Portfolio or CV</h2>
                </div>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Provide a PDF or image of your CV, portfolio, or a brief document showcasing your artistic journey.
                </p>
              </div>

              <div 
                className="aspect-video border-2 border-dashed border-white/10 hover:border-white/30 transition-all cursor-pointer relative flex flex-col items-center justify-center text-white/20 gap-4"
                onClick={() => document.getElementById('portfolio-input')?.click()}
              >
                {previews.portfolio ? (
                  portfolio?.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-white/40" />
                      <span className="text-xs font-mono">{portfolio.name}</span>
                    </div>
                  ) : (
                    <Image src={previews.portfolio} alt="Portfolio" fill className="object-cover" />
                  )
                ) : (
                  <>
                    <Upload className="h-10 w-10" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Upload PDF or Image</span>
                  </>
                )}
                <input id="portfolio-input" type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileSelect(e, 'portfolio')} />
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-white/5 flex justify-between items-center">
            {step > 1 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(prev => prev - 1)}
                className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white rounded-none h-14 px-8"
              >
                Back
              </Button>
            )}
            <div className="flex-grow" />
            <Button 
              onClick={step === 3 ? handleSubmit : nextStep} 
              disabled={uploading}
              className="bg-white text-black hover:bg-neutral-200 rounded-none h-14 px-12 text-xs uppercase tracking-[0.3em] font-bold shadow-2xl transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                step === 3 ? "Submit for Review" : "Continue"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
