
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages, Artist } from "@/app/lib/placeholder-images";
import Image from "next/image";
import { Heart, MessageSquare, Share2, ShieldCheck, Truck, ArrowLeft, ZoomIn } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  
  const artwork = PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages[0];

  const handlePurchase = () => {
    toast({
      title: "Purchase Initiated",
      description: "You are being redirected to our secure payment gateway.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to gallery
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden gallery-border group bg-neutral-900">
              <Image 
                src={artwork.imageUrl} 
                alt={artwork.title} 
                fill
                className="object-cover transition-all duration-700"
                priority
                data-ai-hint={artwork.imageHint}
              />
              <button className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="relative aspect-square gallery-border overflow-hidden cursor-pointer hover:ring-1 ring-white transition-all opacity-50 hover:opacity-100 bg-neutral-900">
                  <Image src={`https://picsum.photos/seed/detail${i+artwork.id}/300/300`} alt="Detail" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-white/10 text-white border border-white/20 px-3 py-1 text-[10px] tracking-widest font-bold uppercase">Original Work</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-white"><Heart className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-white"><Share2 className="h-5 w-5" /></Button>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">{artwork.title}</h1>
              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-full overflow-hidden gallery-border">
                  <Image src={Artist.profileImage} alt={Artist.name} width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">{Artist.name}</p>
                  <Link href="/profile" className="text-xs text-muted-foreground font-bold hover:text-white transition-colors uppercase tracking-widest">View Portfolio</Link>
                </div>
              </div>
              <div className="text-3xl font-bold text-white py-4 border-y border-white/5">
                ZMW {artwork.price.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" className="h-14 text-xs tracking-[0.2em] uppercase font-bold rounded-none bg-white text-black hover:bg-neutral-200" onClick={handlePurchase}>
                  Acquire Now
                </Button>
                <Button variant="outline" size="lg" className="h-14 text-xs tracking-[0.2em] uppercase font-bold border-white/10 text-white hover:bg-white/5 rounded-none" asChild>
                  <Link href="/messages">
                    <MessageSquare className="mr-2 h-5 w-5" /> Inquire
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <h3 className="font-bold font-headline text-lg uppercase tracking-widest text-muted-foreground">About the Piece</h3>
                <p className="text-white/80 leading-relaxed font-light">
                  {artwork.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm pt-6 border-t border-white/5">
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Medium</span>
                  <span className="font-bold">{artwork.medium}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Dimensions</span>
                  <span className="font-bold">{artwork.dimensions}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Year</span>
                  <span className="font-bold">{artwork.year}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Authenticity</span>
                  <span className="font-bold">Signed Original</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
