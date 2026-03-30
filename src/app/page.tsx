"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Artist } from "@/app/lib/placeholder-images";
import type { ImagePlaceholder } from "@/app/lib/placeholder-images";
import { getApprovedArtworks } from "@/lib/firebase/firestore";
import { ArrowRight, Palette, ArrowUpRight } from "lucide-react";

export default function Home() {
  const [artworks, setArtworks] = useState<ImagePlaceholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArt() {
      try {
        const data = await getApprovedArtworks();
        setArtworks(data);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArt();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading Zambian Canvas...</div>;
  }

  const featuredArt = artworks.slice(0, 3);
  const heroImage = artworks.find(img => img.id === "art-1") || artworks[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-black">
          <div className="absolute inset-0 african-pattern opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 z-10 grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 space-y-12">
              <div className="space-y-6">
                <div className="bg-white/10 text-white border border-white/20 inline-block px-4 py-1 text-[10px] tracking-[0.4em] uppercase font-bold">
                  Authentic Zambian Canvas
                </div>
                <h1 className="text-7xl md:text-[10rem] font-bold leading-[0.8] tracking-tighter text-white font-headline">
                  Artistic <span className="text-white italic block">Soul</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md leading-relaxed font-body font-light">
                  A curated sanctuary for the finest masterpieces. Represented by <span className="text-white font-medium">{Artist.name}</span>.
                </p>
              </div>
              <div className="flex flex-wrap gap-8 pt-4">
                <Link href="/explore">
                  <Button size="lg" className="h-16 px-12 text-[10px] tracking-[0.3em] uppercase font-bold bg-white text-black hover:bg-neutral-200 rounded-none">
                    Enter Exhibition
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="h-16 px-12 text-[10px] tracking-[0.3em] uppercase font-bold border-white/20 text-white hover:bg-white hover:text-black rounded-none">
                    Meet The Artist
                  </Button>
                </Link>
              </div>
            </div>
            {heroImage && (
              <div className="md:col-span-5 relative hidden md:block group h-[80vh]">
                <div className="relative h-full w-full gallery-border overflow-hidden shadow-2xl transition-transform duration-1000 group-hover:scale-[1.01]">
                  <Image 
                    src={heroImage.imageUrl} 
                    alt={heroImage.title} 
                    fill
                    className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                    priority
                    data-ai-hint={heroImage.imageHint}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black via-black/40 to-transparent">
                    <p className="text-white font-headline text-4xl font-bold tracking-tight">{heroImage.title}</p>
                    <p className="text-xs text-white/60 tracking-[0.3em] uppercase mt-2 font-bold">Featured Artwork</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-40 bg-background border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">Curated Works</h2>
                <p className="text-muted-foreground text-xl font-light">Hand-selected narratives from {Artist.name}.</p>
              </div>
              <Link href="/explore">
                <Button variant="link" className="text-white group text-[10px] tracking-[0.3em] uppercase font-bold p-0 hover:no-underline">
                  View Catalogue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
              {featuredArt.map((art) => (
                <Link href={`/artwork/${art.id}`} key={art.id}>
                  <Card className="group overflow-hidden border-none bg-transparent">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/5] overflow-hidden mb-8 gallery-border bg-neutral-950">
                        <Image 
                          src={art.imageUrl} 
                          alt={art.title} 
                          fill
                          className="object-cover grayscale-[0.5] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                          data-ai-hint={art.imageHint}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center">
                          <div className="h-14 w-14 rounded-full border border-white flex items-center justify-center text-white">
                            <ArrowUpRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-bold font-headline tracking-tight">{art.title}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">{Artist.name}</p>
                        <p className="text-white font-mono text-lg pt-4">ZMW {art.price?.toLocaleString() ?? "0"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Artist Profile Section */}
        <section className="py-40 bg-black border-t border-white/5 overflow-hidden">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-[3/4] gallery-border grayscale hover:grayscale-0 transition-all duration-1000 group">
              <Image 
                src={Artist.profileImage} 
                alt={Artist.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                data-ai-hint={Artist.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-6xl md:text-8xl font-bold font-headline tracking-tighter">The Visionary</h2>
                <h3 className="text-2xl font-bold uppercase tracking-[0.2em] text-white/60">{Artist.name}</h3>
                <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-lg">
                  {Artist.bio}
                </p>
              </div>
              <Link href="/profile">
                <Button variant="outline" className="rounded-none border-white/20 text-white hover:bg-white hover:text-black transition-all h-16 px-12 text-[10px] tracking-[0.3em] uppercase font-bold">
                  Explore Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-32 border-t border-white/5">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-2">
              <Palette className="text-white h-8 w-8" />
              <span className="font-headline text-3xl font-bold tracking-tighter text-white">
                Zambian Canvas
              </span>
            </div>
            <p className="text-muted-foreground max-sm font-light leading-relaxed text-lg italic">
              "One Zambia, One Nation — Unified through artistic expression and cultural heritage."
            </p>
          </div>
          <div className="space-y-8">
            <h4 className="font-bold text-white uppercase tracking-[0.3em] text-[10px]">Marketplace</h4>
            <ul className="space-y-4 text-xs text-muted-foreground font-bold tracking-widest uppercase">
              <li><Link href="/explore" className="hover:text-white transition-colors">Catalog</Link></li>
              <li><Link href="/explore?category=paintings" className="hover:text-white transition-colors">Paintings</Link></li>
              <li><Link href="/explore?category=sculpture" className="hover:text-white transition-colors">Sculptures</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="font-bold text-white uppercase tracking-[0.3em] text-[10px]">Collective</h4>
            <ul className="space-y-4 text-xs text-muted-foreground font-bold tracking-widest uppercase">
              <li><Link href="/profile" className="hover:text-white transition-colors">{Artist.name}</Link></li>
              <li><Link href="/messages" className="hover:text-white transition-colors">Inquiries</Link></li>
              <li><Link href="/sell" className="hover:text-white transition-colors">Exhibit</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-32 pt-12 border-t border-white/5 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          © {new Date().getFullYear()} Zambian Canvas • Private Digital Gallery
        </div>
      </footer>
    </div>
  );
}
