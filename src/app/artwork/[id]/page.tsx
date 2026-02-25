
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/app/lib/placeholder-images";
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
  
  // In a real app we'd fetch the data. Using placeholder for now.
  const artwork = PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages[0];

  const handlePurchase = () => {
    toast({
      title: "Purchase Initiated",
      description: "You are being redirected to our secure payment gateway.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group">
              <Image 
                src={artwork.imageUrl} 
                alt={artwork.description} 
                fill
                className="object-cover"
                priority
              />
              <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all opacity-70 hover:opacity-100">
                  <Image src={`https://picsum.photos/seed/detail${i}/300/300`} alt="Detail" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary border-none font-bold">Original Work</Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full"><Heart className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="h-5 w-5" /></Button>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">Savannah Rhythms I</h1>
              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <Image src={PlaceHolderImages[4].imageUrl} alt="Artist" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">Chanda Mwamba</p>
                  <Link href="/profile/chanda" className="text-xs text-primary font-bold hover:underline">View Portfolio</Link>
                </div>
              </div>
              <div className="text-3xl font-bold text-primary py-4">
                ZMW 2,500
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" className="h-14 text-lg font-bold shadow-lg clay-shadow" onClick={handlePurchase}>
                  Buy Now
                </Button>
                <Button variant="outline" size="lg" className="h-14 text-lg font-bold border-primary text-primary hover:bg-primary/5" asChild>
                  <Link href="/messages?artist=chanda">
                    <MessageSquare className="mr-2 h-5 w-5" /> Message
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Price includes artist commission. Shipping calculated at checkout.
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="space-y-2">
                <h3 className="font-bold font-headline text-lg">About this piece</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {artwork.description || "A stunning exploration of Zambian textures and colors. This piece captures the rhythmic energy of the savannah during the golden hour, utilizing layers of rich ochre and deep crimson to create depth and movement."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm pt-4 border-t">
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Medium</span>
                  <span className="font-bold">Acrylic on Canvas</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Dimensions</span>
                  <span className="font-bold">36 x 48 inches</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Year</span>
                  <span className="font-bold">2024</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-widest">Authenticity</span>
                  <span className="font-bold">Signed by Artist</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 p-6 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm">Secure Acquisition</p>
                  <p className="text-xs text-muted-foreground">Money held in escrow until delivery is confirmed by you.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm">Insured Shipping</p>
                  <p className="text-xs text-muted-foreground">Hand-packaged and delivered within 5-7 business days across Zambia.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
