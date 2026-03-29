
"use client";

import Link from "next/link";
import { Palette, Search, User, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthContext";
import { signOut } from "@/lib/auth/actions";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function Navbar() {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"), 
      where("participants", "array-contains", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount && data.unreadCount[user.uid]) {
          count += data.unreadCount[user.uid];
        }
      });
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [user]);

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
          {user?.role === 'admin' && (
            <>
              <Link href="/admin/verifications" className="text-[10px] uppercase tracking-[0.3em] font-bold text-yellow-500 hover:text-yellow-400 transition-colors">
                Review Queue
              </Link>
              <Link href="/admin/messages" className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-500 hover:text-red-400 transition-colors">
                Flagged Chats
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search collective..." 
              className="bg-secondary border border-white/5 rounded-none h-11 pl-12 pr-4 text-xs w-40 lg:w-64 focus:border-white/20 focus:ring-0 outline-none transition-all placeholder:text-neutral-600"
            />
          </div>
          {!loading && !user && (
            <div className="flex items-center gap-4 ml-4">
              <Link href="/login" className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/70 hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup">
                <Button variant="outline" size="sm" className="h-9 px-6 text-[10px] uppercase tracking-[0.2em] font-bold border-white/20 hover:bg-white text-white hover:text-black rounded-none">Sign Up</Button>
              </Link>
            </div>
          )}
          {!loading && user && (
            <div className="flex items-center gap-1 ml-4">
              <Link href="/messages" className="relative">
                <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
                  <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-red-500 outline outline-2 outline-background flex items-center justify-center text-[7px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/profile">
                <div className="h-10 w-10 p-0.5 rounded-full border border-white/10 hover:border-white transition-colors mx-2">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback className="bg-black text-[10px] font-bold text-white uppercase">{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
              </Link>
              <Button variant="ghost" onClick={() => signOut()} className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 hover:text-white px-2">Log Out</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
