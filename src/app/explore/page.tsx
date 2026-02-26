
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { PlaceHolderImages, Artist } from "@/app/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal, ArrowUpRight } from "lucide-react";

export default function ExplorePage() {
  const artworks = PlaceHolderImages;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="mb-16 space-y-6 max-w-4xl">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-bold font-headline tracking-tighter">The Collection</h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              From the thunder of Mosi-oa-Tunya to the rhythmic soul of the Ingoma drum. 
              Discover the curated essence of Zambian artistry by {Artist.name}.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center pt-4">
            <Button variant="outline" className="rounded-none flex items-center gap-2 border-white/10 text-white hover:bg-white hover:text-black transition-all">
              <Filter className="h-4 w-4" /> Category
            </Button>
            <Button variant="outline" className="rounded-none flex items-center gap-2 border-white/10 text-white hover:bg-white hover:text-black transition-all">
              <SlidersHorizontal className="h-4 w-4" /> Price Range
            </Button>
            <div className="flex-grow"></div>
            <div className="flex gap-4">
              <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b-2 border-white pb-1">All Works</button>
              <button className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground hover:text-white transition-colors pb-1">Paintings</button>
              <button className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground hover:text-white transition-colors pb-1">Sculptures</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {artworks.map((art) => (
            <Link href={`/artwork/${art.id}`} key={art.id} className="group block">
              <div className="relative aspect-[4/5] mb-6 gallery-border overflow-hidden bg-neutral-900">
                <Image 
                  src={art.imageUrl} 
                  alt={art.title}
                  fill
                  className="object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  data-ai-hint={art.imageHint}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border border-white flex items-center justify-center text-white">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-3xl leading-none font-headline tracking-tight">{art.title}</h3>
                  <span className="text-xs font-bold font-mono pt-1">ZMW {art.price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">{Artist.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 font-light leading-relaxed">
                  {art.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
