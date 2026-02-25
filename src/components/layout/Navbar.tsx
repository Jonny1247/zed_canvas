"use client";

import Link from "next/link";
import { Palette, Search, User, MessageSquare, PlusSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Palette className="text-white h-8 w-8 transition-transform group-hover:rotate-12" />
          <span className="font-headline text-2xl font-bold tracking-tight text-white">
            Zambian Canvas
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/explore" className="text-xs uppercase tracking-widest font-bold hover:text-white text-muted-foreground transition-colors">
            Gallery
          </Link>
          <Link href="/recommendations" className="text-xs uppercase tracking-widest font-bold hover:text-white text-muted-foreground transition-colors flex items-center gap-2">
            <Heart className="h-3 w-3" /> Curated
          </Link>
          <Link href="/sell" className="text-xs uppercase tracking-widest font-bold hover:text-white text-muted-foreground transition-colors">
            Exhibit
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search collective..." 
              className="bg-secondary border border-white/5 rounded-none h-11 pl-12 pr-4 text-sm w-40 lg:w-64 focus:border-white/20 focus:ring-0 outline-none transition-all placeholder:text-neutral-600"
            />
          </div>
          <div className="flex items-center gap-1">
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="hover:bg-white/5">
                <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-white" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="hover:bg-white/5">
                <User className="h-5 w-5 text-muted-foreground hover:text-white" />
              </Button>
            </Link>
          </div>
          <Link href="/sell" className="hidden lg:block">
            <Button className="bg-white text-black hover:bg-neutral-200 rounded-none h-11 px-6 font-bold text-xs uppercase tracking-widest">
              Upload
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
