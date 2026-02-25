
"use client";

import Link from "next/link";
import { Palette, Search, User, MessageSquare, PlusSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Palette className="text-primary h-8 w-8" />
          <span className="font-headline text-2xl font-bold tracking-tight text-primary">
            Zambian Canvas
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
            Explore
          </Link>
          <Link href="/recommendations" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <Heart className="h-4 w-4" /> For You
          </Link>
          <Link href="/sell" className="text-sm font-medium hover:text-primary transition-colors">
            Sell Art
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center relative mr-2">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search artists, styles..." 
              className="bg-secondary/50 border-none rounded-full h-9 pl-10 pr-4 text-sm w-40 lg:w-60 focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sell" className="md:hidden">
            <Button variant="primary" size="icon">
              <PlusSquare className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
