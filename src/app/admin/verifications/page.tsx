"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/lib/firebase/firestore";
import { 
  ShieldCheck, ShieldAlert, Loader2, Check, X, 
  ExternalLink, User, CreditCard, FileText, Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminVerificationQueuePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push("/");
      } else {
        loadRequests();
      }
    }
  }, [user, authLoading, router]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingVerifications();
      setRequests(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, userId: string) => {
    setProcessingId(requestId);
    try {
      await approveVerification(requestId, userId);
      toast({ title: "Approved", description: "Artist has been verified." });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;
    setProcessingId(selectedRequest.id);
    try {
      await rejectVerification(selectedRequest.id, selectedRequest.userId, rejectionReason);
      toast({ title: "Rejected", description: "Verification request has been denied." });
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white/20 uppercase tracking-widest text-xs">Loading Queue...</div>;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-6xl">
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">Admin Panel</span>
            <div className="h-px flex-grow bg-white/5" />
            <span className="text-[10px] font-bold text-white/20">{requests.length} Pending Requests</span>
          </div>
          <h1 className="text-6xl font-bold font-headline tracking-tighter">Verification Queue.</h1>
          <p className="text-white/40 text-lg font-light max-w-2xl leading-relaxed">
            Review identity documents and portfolios for new artists. Ensure all details match before approval.
          </p>
        </header>

        {requests.length === 0 ? (
          <div className="border border-white/5 bg-neutral-900/50 py-32 text-center flex flex-col items-center gap-6">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">The queue is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {requests.map((req) => (
              <div key={req.id} className="bg-neutral-900 border border-white/10 overflow-hidden flex flex-col lg:flex-row">
                {/* Visuals Sidebar */}
                <div className="lg:w-80 bg-black p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-white/10">
                  <div className="space-y-4">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30">Portrait</p>
                    <div className="relative aspect-square border border-white/10 overflow-hidden">
                      <Image src={req.portraitUrl} alt="Portrait" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30">National ID (NRC)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative aspect-[1.6/1] border border-white/10 overflow-hidden group">
                        <Image src={req.nrcFrontUrl} alt="NRC Front" fill className="object-cover" />
                        <a href={req.nrcFrontUrl} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ExternalLink className="h-4 w-4" /></a>
                      </div>
                      <div className="relative aspect-[1.6/1] border border-white/10 overflow-hidden group">
                        <Image src={req.nrcBackUrl} alt="NRC Back" fill className="object-cover" />
                        <a href={req.nrcBackUrl} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ExternalLink className="h-4 w-4" /></a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 p-12 flex flex-col justify-between space-y-12">
                  <div className="space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-headline font-bold text-white tracking-tight">{req.userName}</h2>
                        <p className="text-xs text-white/30 font-mono">UID: {req.userId}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white/60">
                          <FileText className="h-4 w-4" />
                          <h3 className="text-[10px] uppercase tracking-widest font-bold">Review Portfolio</h3>
                        </div>
                        <div className="p-6 bg-black border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                          <span className="text-xs text-white/40 group-hover:text-white/60 truncate max-w-[200px]">Portfolio/CV Document</span>
                          <a href={req.portfolioUrl} target="_blank" className="text-[9px] uppercase tracking-widest font-black text-white px-4 py-2 border border-white/10 hover:bg-white hover:text-black transition-all">View File</a>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 text-white/60">
                          <User className="h-4 w-4" />
                          <h3 className="text-[10px] uppercase tracking-widest font-bold">Verification Context</h3>
                        </div>
                        <p className="text-xs text-white/30 leading-relaxed font-light italic">
                          This artist is requesting access to the marketplace. Verify that the portrait matches the NRC photo and the portfolio shows original work.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-white/5">
                    <Button 
                      onClick={() => handleApprove(req.id, req.userId)}
                      disabled={processingId === req.id}
                      className="flex-1 h-14 bg-white text-black hover:bg-neutral-200 rounded-none text-[10px] uppercase tracking-[0.3em] font-black"
                    >
                      {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-3" /> Approve Artist</>}
                    </Button>
                    
                    <Dialog open={isRejectDialogOpen && selectedRequest?.id === req.id} onOpenChange={(open) => {
                      setIsRejectDialogOpen(open);
                      if (open) setSelectedRequest(req);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="flex-1 h-14 border-white/10 text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 rounded-none text-[10px] uppercase tracking-[0.3em] font-black"
                        >
                          <X className="h-4 w-4 mr-3" /> Reject Application
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-neutral-900 border-white/10 text-white">
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Reject Verification</DialogTitle>
                          <DialogDescription className="text-white/40">
                            Explain precisely why this application was rejected. The artist will receive this feedback to help them resubmit.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Label className="text-[10px] uppercase tracking-widest text-white/50">Reason for Rejection</Label>
                          <Textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="bg-black border-white/20 text-white rounded-none min-h-[120px]"
                            placeholder="e.g. Portrait does not match NRC identification."
                          />
                        </div>
                        <DialogFooter className="pt-6">
                          <Button 
                            onClick={handleReject}
                            disabled={!rejectionReason || processingId === req.id}
                            className="w-full bg-red-600 text-white hover:bg-red-500 rounded-none h-12 uppercase tracking-widest font-bold text-xs"
                          >
                            {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
