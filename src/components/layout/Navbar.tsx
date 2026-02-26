
"use client";

import Link from "next/link";
import { Palette, Search, User, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artist } from "@/app/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Palette className="text-white h-8 w-8 transition-transform group-hover:rotate-12" />
          <span className="font-headline text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">
            Zambian Canvas
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/explore" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:text-white text-muted-foreground transition-colors">
            Catalog
          </Link>
          <Link href="/recommendations" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:text-white text-muted-foreground transition-colors flex items-center gap-2">
            Curated
          </Link>
          <Link href="/sell" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:text-white text-muted-foreground transition-colors">
            Exhibit
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search collective..." 
              className="bg-secondary border border-white/5 rounded-none h-11 pl-12 pr-4 text-xs w-40 lg:w-64 focus:border-white/20 focus:ring-0 outline-none transition-all placeholder:text-neutral-600"
            />
          </div>
          <div className="flex items-center gap-1">
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
                <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-white" />
              </Button>
            </Link>
            <Link href="/profile">
              <div className="h-10 w-10 p-0.5 rounded-full border border-white/10 hover:border-white transition-colors">
                <Avatar className="h-full w-full">
                  <AvatarImage src={Artist.profileImage} />
                  <AvatarFallback className="bg-black text-[10px] font-bold text-white">MR</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
