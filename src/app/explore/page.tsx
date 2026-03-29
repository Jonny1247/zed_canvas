"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { getApprovedArtworks, ArtworkFilter, getUserById } from "@/lib/firebase/firestore";
import type { ImagePlaceholder } from "@/app/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal, ArrowUpRight, Search, MapPin, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock } from "lucide-react";

const CATEGORIES = ["All", "Painting", "Sculpture", "Textile", "Pottery", "Beadwork", "Wood Carving", "Digital Art", "Photography"];

export default function ExplorePage() {
  const [artworks, setArtworks] = useState<ImagePlaceholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArtworkFilter>({
    category: "All",
    minPrice: 0,
    maxPrice: 50000,
  });

  // Artist names cache to avoid repeated fetches
  const [artistCache, setArtistCache] = useState<{[key: string]: any}>({});

  useEffect(() => {
    setLoading(true);
    getApprovedArtworks(filters).then(async (data) => {
      setArtworks(data);
      setLoading(false);
      
      // Fetch names for unique artists
      const uniqueArtistIds = Array.from(new Set(data.map(a => (a as any).artistId).filter(Boolean)));
      for (const id of uniqueArtistIds) {
        if (!artistCache[id as string]) {
          getUserById(id as string).then(user => {
            if (user) {
              setArtistCache(prev => ({ ...prev, [id as string]: user }));
            }
          });
        }
      }
    }).catch(console.error);
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <header className="mb-20 space-y-10 max-w-5xl">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">Zambian Canvas / Collection</p>
            <h1 className="text-7xl md:text-9xl font-bold font-headline tracking-tighter text-white leading-none">The Exhibition.</h1>
            <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl">
              A curated selection of the finest Zambian contemporary art. 
              From the heart of the Copperbelt to the streets of Lusaka.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6 items-center pt-8 border-t border-white/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none h-12 px-6 flex items-center gap-3 border-white/10 text-white hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest font-bold">
                  <Filter className="h-4 w-4" /> {filters.category === "All" ? "Category" : filters.category}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white rounded-none w-48">
                {CATEGORIES.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setFilters({...filters, category: cat})} className="focus:bg-white focus:text-black cursor-pointer py-2.5 text-xs">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none h-12 px-6 flex items-center gap-3 border-white/10 text-white hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest font-bold">
                  <SlidersHorizontal className="h-4 w-4" /> Price Range
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white rounded-none p-4 w-64 space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 border-b border-white/5 pb-2">Filter by Price (ZMW)</p>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" className="bg-black border-white/10 text-white rounded-none h-9 text-xs" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: parseInt(e.target.value) || 0})} />
                  <span className="text-white/20">—</span>
                  <Input type="number" placeholder="Max" className="bg-black border-white/10 text-white rounded-none h-9 text-xs" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: parseInt(e.target.value) || 0})} />
                </div>
                <Button className="w-full h-9 bg-white text-black hover:bg-neutral-200 rounded-none text-[10px] uppercase tracking-widest font-bold">Apply Range</Button>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-grow"></div>
            
            <div className="flex gap-8 items-center border-l border-white/5 pl-8 hidden lg:flex">
              {["All", "Painting", "Sculpture", "Photography"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilters({...filters, category: cat})}
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-all border-b-2 pb-1 ${filters.category === cat ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {(filters.category !== "All" || filters.minPrice! > 0 || filters.maxPrice! < 50000) && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[9px] uppercase tracking-widest text-white/20 flex items-center mr-2 font-bold">Active Filters:</span>
              {filters.category !== "All" && (
                <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] text-white/60 uppercase tracking-widest font-bold">
                  {filters.category} <X className="h-2.5 w-2.5 cursor-pointer hover:text-white" onClick={() => setFilters({...filters, category: "All"})} />
                </span>
              )}
              {(filters.minPrice! > 0 || filters.maxPrice! < 50000) && (
                <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] text-white/60 uppercase tracking-widest font-bold">
                  ZMW {filters.minPrice} - {filters.maxPrice} <X className="h-2.5 w-2.5 cursor-pointer hover:text-white" onClick={() => setFilters({...filters, minPrice: 0, maxPrice: 50000})} />
                </span>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-6">
                <div className="aspect-[4/5] bg-neutral-950/50 animate-pulse border border-white/5" />
                <div className="h-8 bg-neutral-900 animate-pulse w-3/4" />
                <div className="h-4 bg-neutral-900 animate-pulse w-1/2" />
              </div>
            ))
          ) : artworks.length === 0 ? (
            <div className="text-white/20 col-span-3 text-center py-40 border-y border-white/5 space-y-4">
              <Search className="h-10 w-10 mx-auto opacity-10" />
              <p className="text-lg uppercase tracking-widest font-light">No works found in this selection.</p>
              <Button variant="ghost" className="text-xs uppercase tracking-widest hover:bg-white hover:text-black rounded-none" onClick={() => setFilters({category: "All", minPrice: 0, maxPrice: 50000})}>Reset Filters</Button>
            </div>
          ) : (
            artworks.map((art) => (
              <Link href={`/artwork/${art.id}`} key={art.id} className="group block">
                <div className="relative aspect-[4/5] mb-8 overflow-hidden bg-neutral-950 border border-white/5 group-hover:border-white/20 transition-all duration-700 shadow-2xl">
                  <Image 
                    src={art.imageUrl} 
                    alt={art.title}
                    fill
                    className="object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    data-ai-hint={art.imageHint}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8">
                    <div className="h-14 w-14 rounded-full border border-white/40 flex items-center justify-center text-white backdrop-blur-md mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-4xl leading-none font-headline tracking-tighter text-white group-hover:text-white/80 transition-colors uppercase">{art.title}</h3>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono tracking-tighter text-white">ZMW {art.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">
                        {artistCache[(art as any).artistId]?.name || "Zambian Artist"}
                      </p>
                      {artistCache[(art as any).artistId]?.isVerified && (
                        <span className="flex items-center gap-1 text-[8px] text-green-500 uppercase tracking-widest font-bold mt-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified Artist
                        </span>
                      )}
                      {artistCache[(art as any).artistId]?.verificationStatus === 'pending' && (
                        <span className="flex items-center gap-1 text-[8px] text-yellow-500 uppercase tracking-widest font-bold mt-1">
                          <Clock className="h-2.5 w-2.5" /> Pending
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-white/20 font-bold">
                      <MapPin className="h-2.5 w-2.5" /> {(art as any).location || "Zambia"}
                    </span>
                  </div>
                  <p className="text-sm text-white/30 line-clamp-2 font-light leading-relaxed pt-2">
                    {art.description}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
