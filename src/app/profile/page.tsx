
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages, Artist } from "@/app/lib/placeholder-images";
import Image from "next/image";
import { 
  Settings, 
  MapPin, 
  ExternalLink, 
  Grid3X3, 
  Heart, 
  Plus, 
  Instagram, 
  Twitter, 
  Globe 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfilePage() {
  const myArtworks = PlaceHolderImages.slice(0, 4);
  const collectedArtworks = PlaceHolderImages.slice(4, 6);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Profile Header */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="relative h-64 w-64 shrink-0 gallery-border grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden group">
              <Image 
                src={Artist.profileImage} 
                alt={Artist.name} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                data-ai-hint={Artist.imageHint}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="flex-grow space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-1">
                  <h1 className="text-6xl font-bold font-headline tracking-tighter">{Artist.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {Artist.location}</span>
                    <span>Professional Collective</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link href="/sell">
                    <Button className="rounded-none bg-white text-black hover:bg-neutral-200 px-8 font-bold uppercase text-[10px] tracking-widest h-12">
                      <Plus className="mr-2 h-4 w-4" /> New Exhibit
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="rounded-none border-white/10 hover:bg-white/5 h-12 w-12 text-white">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="max-w-2xl text-lg text-muted-foreground font-light leading-relaxed">
                {Artist.bio}
              </p>

              <div className="flex gap-6 pt-4">
                <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="exhibits" className="space-y-12">
          <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="exhibits" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground data-[state=active]:text-white transition-all shadow-none"
            >
              My Exhibits
            </TabsTrigger>
            <TabsTrigger 
              value="collected" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground data-[state=active]:text-white transition-all shadow-none"
            >
              Collection
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground data-[state=active]:text-white transition-all shadow-none"
            >
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exhibits" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {myArtworks.map((art) => (
                <Link href={`/artwork/${art.id}`} key={art.id} className="group">
                  <div className="relative aspect-square gallery-border overflow-hidden mb-4 bg-neutral-900">
                    <Image 
                      src={art.imageUrl} 
                      alt={art.title} 
                      fill 
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      data-ai-hint={art.imageHint}
                    />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">{art.title}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Published 2024</p>
                </Link>
              ))}
              <Link href="/sell" className="group border border-dashed border-white/10 flex flex-col items-center justify-center aspect-square hover:bg-white/5 transition-colors">
                <Plus className="h-8 w-8 text-muted-foreground mb-4 group-hover:text-white transition-colors" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Add Work</span>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="collected" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {collectedArtworks.map((art) => (
                <div key={art.id} className="space-y-4">
                  <div className="relative aspect-[4/3] gallery-border overflow-hidden bg-neutral-900">
                    <Image src={art.imageUrl} alt={art.title} fill className="object-cover grayscale" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{art.title}</h3>
                      <p className="text-xs text-muted-foreground">Acquired Mar 2024</p>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PlaceHolderImages.slice(2, 5).map((art) => (
                <Link href={`/artwork/${art.id}`} key={art.id} className="group relative">
                  <div className="relative aspect-square gallery-border overflow-hidden mb-4 bg-neutral-900">
                    <Image src={art.imageUrl} alt={art.title} fill className="object-cover grayscale" />
                    <div className="absolute top-4 right-4 text-white">
                      <Heart className="h-4 w-4 fill-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">{art.title}</h3>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Zambian Canvas • Curator Profile 0X7F4B
        </p>
      </footer>
    </div>
  );
}
