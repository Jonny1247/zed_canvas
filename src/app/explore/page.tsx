
import { Navbar } from "@/components/layout/Navbar";
import { PlaceHolderImages } from "@/app/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function ExplorePage() {
  const artworks = PlaceHolderImages;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-10 space-y-4">
          <h1 className="text-4xl font-bold font-headline">Gallery Exhibition</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore a diverse range of Zambian art. Filter by medium, artist, or price to find the perfect addition to your collection.
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="outline" className="rounded-full flex items-center gap-2 border-white/10 text-white">
              <Filter className="h-4 w-4" /> Category
            </Button>
            <Button variant="outline" className="rounded-full flex items-center gap-2 border-white/10 text-white">
              <SlidersHorizontal className="h-4 w-4" /> Price Range
            </Button>
            <div className="flex-grow"></div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-black transition-colors rounded-none">All</Badge>
              <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-black transition-colors rounded-none border-white/10">Paintings</Badge>
              <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-black transition-colors rounded-none border-white/10">Carvings</Badge>
              <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-black transition-colors rounded-none border-white/10">Textiles</Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {artworks.map((art) => (
            <Link href={`/artwork/${art.id}`} key={art.id} className="group block">
              <div className="relative aspect-[3/4] mb-4 gallery-border overflow-hidden">
                <Image 
                  src={art.imageUrl} 
                  alt={art.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 duration-500"
                  data-ai-hint={art.imageHint}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button className="bg-white text-black hover:bg-white/90 rounded-none">View Details</Button>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight truncate font-headline">{art.title}</h3>
                <p className="text-xs text-muted-foreground italic truncate">Chanda Mwamba</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-white">ZMW 3,200</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">New</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
