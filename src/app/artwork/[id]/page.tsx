"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { getArtworkById, createOrder, getUserById, updateArtwork, startConversation } from "@/lib/firebase/firestore";
import Image from "next/image";
import { 
  Heart, MessageSquare, Share2, ShieldCheck, Truck, ArrowLeft, ZoomIn, 
  MapPin, User, CheckCircle2, ShoppingBag, Info, Phone, Clock, ShieldAlert
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { user: currentUser } = useAuth();
  
  const [artwork, setArtwork] = useState<any>(null);
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const artData = await getArtworkById(id);
        if (artData) {
          setArtwork(artData);
          setActiveImage(artData.imageUrl);
          
          // Fetch artist info
          if (artData.artistId) {
            const artistData = await getUserById(artData.artistId);
            setArtist(artistData);
          }

          // Increment view count (simple implementation)
          updateArtwork(id, { views: (artData.views || 0) + 1 }).catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handlePurchase = async () => {
    if (!currentUser) {
      toast({ title: "Authentication Required", description: "Please sign in to acquire artworks.", variant: "destructive" });
      router.push("/login");
      return;
    }

    if (currentUser.role === 'customer' && !currentUser.isVerified) {
      toast({ title: "Verification Required", description: "Please verify your account to purchase artworks.", variant: "destructive" });
      router.push("/verify/customer");
      return;
    }
    
    try {
      await createOrder(id, currentUser.uid);
      toast({ title: "Purchase Initiated", description: "Your order has been placed securely." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
    }
  };

  const handleContactArtist = async () => {
    if (!currentUser) {
      toast({ title: "Authentication Required", description: "Please sign in to contact the artist.", variant: "destructive" });
      router.push("/login");
      return;
    }
    if (currentUser.uid === artist?.uid) {
      toast({ title: "Action Not Allowed", description: "You cannot message yourself.", variant: "destructive" });
      return;
    }

    setIsStartingChat(true);
    try {
      const convId = await startConversation(id, currentUser.uid, artist.uid);
      router.push(`/messages?id=${convId}`);
    } catch (e) {
      toast({ title: "Error", description: "Could not start conversation.", variant: "destructive" });
      console.error(e);
    } finally {
      setIsStartingChat(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Curating Details...</p>
        </div>
      </main>
    </div>
  );

  if (!artwork || (!artist?.isVerified && currentUser?.uid !== artist?.uid && currentUser?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-white/10 mx-auto" />
            <h2 className="text-3xl font-headline font-bold">Content Restricted.</h2>
            <p className="text-sm text-white/40 max-w-md mx-auto">This artwork is currently private while the artist's identity is being verified.</p>
            <Button variant="outline" className="rounded-none border-white/10 mt-6" onClick={() => router.push("/explore")}>Return to Gallery</Button>
          </div>
        </main>
      </div>
    );
  }

  const images = artwork.imageUrls && artwork.imageUrls.length > 0 ? artwork.imageUrls : [artwork.imageUrl];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 lg:py-20">
        <header className="mb-12 border-b border-white/5 pb-8 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 text-white/40 hover:text-white transition-all text-xs uppercase tracking-[0.3em] font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Exhibition
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-white/40 hover:text-white"><Heart className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-white/40 hover:text-white"><Share2 className="h-5 w-5" /></Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Visual Presentation */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950 border border-white/5 group shadow-2xl">
              <Image 
                src={activeImage} 
                alt={artwork.title} 
                fill
                className="object-cover transition-all duration-1000"
                priority
                data-ai-hint={artwork.imageHint}
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-white shadow-xl">Original Piece</span>
                {artwork.availability === "Sold" && <span className="bg-red-500 border border-red-600 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-white shadow-xl">Sold</span>}
              </div>
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-square border overflow-hidden transition-all duration-500 ${activeImage === img ? "border-white border-2" : "border-white/10 opacity-40 hover:opacity-100"}`}
                  >
                    <Image src={img} alt={`${artwork.title} view ${i+1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="pt-12 space-y-10 border-t border-white/5">
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/20">The Vision</h3>
                <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Description</h2>
                <p className="text-lg text-white/60 leading-relaxed font-light font-sans max-w-3xl">
                  {artwork.description || "No description provided."}
                </p>
              </div>

              {artwork.story && (
                <div className="space-y-4 pt-12 border-t border-white/5">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/20">The Narrative</h3>
                  <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Behind the Piece</h2>
                  <p className="text-lg text-white/60 leading-relaxed font-light font-sans italic max-w-3xl">
                    "{artwork.story}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acquisition & Provenance */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl lg:text-8xl font-bold font-headline leading-none text-white tracking-tighter uppercase">{artwork.title}</h1>
                <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                  <MapPin className="h-3 w-3" /> {artwork.location || "Zambia"} • {artwork.category}
                </div>
              </div>

              <div className="py-8 border-y border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-1">Acquisition Price</p>
                  <p className="text-5xl font-bold text-white font-headline">ZMW {artwork.price?.toLocaleString()}</p>
                  {artwork.isNegotiable && <p className="text-[9px] uppercase tracking-widest text-green-400 font-bold mt-2">Offers Accepted</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-1">Status</p>
                  <p className={`text-sm font-bold uppercase tracking-widest ${artwork.availability === 'Sold' ? 'text-red-400' : 'text-green-400'}`}>
                    {artwork.availability || "Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-neutral-900 border border-white/10 p-6 group transition-colors hover:border-white/20">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-white/10 relative">
                  {artist?.profileImage ? (
                    <Image src={artist.profileImage} alt={artist.name} fill className="object-cover" />
                  ) : (
                    <div className="inset-0 bg-white/5 flex items-center justify-center"><User className="h-6 w-6 text-white/20" /></div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-1">Artist</p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-headline">{artist?.name || "Zambian Artist"}</h3>
                    {artist?.isVerified && (
                      <span className="text-green-500" title="Verified Artist"><CheckCircle2 className="h-4 w-4" /></span>
                    )}
                    {artist?.verificationStatus === 'pending' && (
                      <span className="text-yellow-500" title="Pending Verification"><Clock className="h-4 w-4" /></span>
                    )}
                  </div>
                  <Link href={`/profile/${artwork.artistId}`} className="text-[9px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors border-b border-white/20 pb-0.5">Explore Portfolio</Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  disabled={artwork.availability === "Sold"}
                  className="h-16 text-xs tracking-[0.4em] uppercase font-bold rounded-none bg-white text-black hover:bg-neutral-200 transition-all shadow-2xl" 
                  onClick={handlePurchase}
                >
                  Acquire This Work
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  disabled={isStartingChat}
                  className="h-16 text-xs tracking-[0.4em] uppercase font-bold border-white/10 text-white hover:bg-white hover:text-black rounded-none transition-all flex items-center justify-center gap-3"
                  onClick={handleContactArtist}
                >
                  <MessageSquare className="h-4 w-4" /> {isStartingChat ? "Connecting..." : "Contact Artist"}
                </Button>
              </div>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-y-10 gap-x-8">
                <div className="space-y-1">
                  <span className="block text-white/20 font-bold uppercase text-[10px] tracking-widest">Medium</span>
                  <span className="text-white text-sm font-light uppercase tracking-tighter border-b border-white/5 pb-1 block">{artwork.medium}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-white/20 font-bold uppercase text-[10px] tracking-widest">Materials</span>
                  <span className="text-white text-sm font-light uppercase tracking-tighter border-b border-white/5 pb-1 block">{artwork.materials || "Natural Materials"}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-white/20 font-bold uppercase text-[10px] tracking-widest">Dimensions</span>
                  <span className="text-white text-sm font-light uppercase tracking-tighter border-b border-white/5 pb-1 block">{artwork.dimensions}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-white/20 font-bold uppercase text-[10px] tracking-widest">Year</span>
                  <span className="text-white text-sm font-light uppercase tracking-tighter border-b border-white/5 pb-1 block">{artwork.year}</span>
                </div>
              </div>

              <div className="space-y-6 bg-neutral-900 border border-white/5 p-8">
                <div className="flex items-center gap-3 text-white/60">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Collector Security</span>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-white/80 font-bold uppercase tracking-widest mb-1">Authenticity Guaranteed</p>
                      <p className="text-[11px] text-white/30 leading-relaxed">Each work is verified by Zambian Canvas curators for original provenance.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Truck className="h-4 w-4 text-white/40 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-white/80 font-bold uppercase tracking-widest mb-1">Secure Logistics</p>
                      <p className="text-[11px] text-white/30 leading-relaxed">Specialized handling and shipping across Zambia and international collectors.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

