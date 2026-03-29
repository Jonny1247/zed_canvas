"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth, UserProfile } from "@/lib/auth/AuthContext";
import { getArtworksByArtist, deleteArtwork, updateUserProfile } from "@/lib/firebase/firestore";
import type { ImagePlaceholder } from "@/app/lib/placeholder-images";
import Image from "next/image";
import { 
  LayoutDashboard, ImagePlus, ShoppingBag, Star, Settings, 
  CheckCircle2, Clock, ArrowUpRight, TrendingUp, Eye, DollarSign,
  Edit, Trash2, MapPin, User, MessageCircle, MoreVertical, ShieldAlert
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ArtistDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<ImagePlaceholder[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "artist" && user.role !== "admin") {
        router.push("/");
      } else {
        setProfileData({
          name: user.name || "",
          bio: user.bio || "",
          location: user.location || "",
          whatsapp: user.whatsapp || "",
        });
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getArtworksByArtist(user.uid)
        .then(setArtworks)
        .finally(() => setLoadingArtworks(false));
    }
  }, [user]);

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return;
    try {
      await deleteArtwork(id);
      setArtworks(prev => prev.filter(a => a.id !== id));
      toast({ title: "Artwork Deleted", description: "Successfully removed from your gallery." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete artwork.", variant: "destructive" });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserProfile(user.uid, profileData);
      toast({ title: "Profile Updated", description: "Your artist profile has been updated." });
      setIsEditingProfile(false);
      // Wait for AuthContext to refresh if possible, or just reload
      window.location.reload(); 
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) return null;

  const stats = [
    { label: "Total Artworks", value: artworks.length.toString(), icon: <ImagePlus className="h-5 w-5" />, sub: "in gallery" },
    { label: "Total Views", value: artworks.reduce((acc, curr) => acc + ((curr as any).views || 0), 0).toString(), icon: <Eye className="h-5 w-5" />, sub: "across all pieces" },
    { label: "Total Sales", value: artworks.filter(a => (a as any).status === "sold").length.toString(), icon: <ShoppingBag className="h-5 w-5" />, sub: "completed orders" },
    { label: "Total Earned", value: artworks.filter(a => (a as any).status === "sold").reduce((acc, curr) => acc + curr.price, 0).toLocaleString() + " ZMW", icon: <DollarSign className="h-5 w-5" />, sub: "revenue" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/10 py-8 px-4 gap-1 bg-neutral-950">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold px-3 mb-4">Artist Studio</p>
          {[
            { href: "/artist/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
            { href: "/artist/upload", label: "Upload Artwork", icon: <ImagePlus className="h-4 w-4" /> },
            { href: "/artist/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
            { href: "/profile", label: "Public Profile", icon: <ArrowUpRight className="h-4 w-4" /> },
            { href: "/artist/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium tracking-wide transition-colors rounded-none ${href === "/artist/dashboard" ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
              {icon} {label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-10 max-w-6xl overflow-y-auto">
          {/* Verification Alert */}
          {(user.verificationStatus === 'unverified' || user.verificationStatus === 'pending') && (
            <div className="bg-neutral-900 border border-white/5 p-4 mb-8 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white">Identity Verification Required</p>
                  <p className="text-xs text-white/40 font-light mt-0.5">
                    {user.verificationStatus === 'unverified' 
                      ? "Complete your profile verification to start showcasing your art to the world." 
                      : "Your documents are under review. Your profile will be public once approved."}
                  </p>
                </div>
              </div>
              {user.verificationStatus === 'unverified' && (
                <Link href="/verify/artist">
                  <Button variant="ghost" className="text-[9px] uppercase tracking-widest font-bold text-white hover:bg-white hover:text-black rounded-none">
                    Start Verification <ArrowUpRight className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Header & Profile */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white/10 bg-neutral-900 flex items-center justify-center">
                  {user.profileImage ? (
                    <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-white/20" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-headline font-bold text-white leading-none">{user.name}</h1>
                  {user.verificationStatus === 'pending' && (
                    <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-2 w-2" /> Pending Verification
                    </span>
                  )}
                  {user.isVerified && (
                    <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-2 w-2" /> Verified Artist
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 pt-1">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {user.location || "Location not set"}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-3 w-3" /> {user.whatsapp || "No WhatsApp set"}</span>
                </div>
                {user.bio && <p className="text-sm text-white/40 max-w-md mt-2 line-clamp-2">{user.bio}</p>}
              </div>
            </div>

            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black rounded-none h-11 px-8 text-xs uppercase tracking-widest font-bold">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">Edit Profile</DialogTitle>
                  <DialogDescription className="text-white/40">Update your public artist information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/70">Full Name</Label>
                    <Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="bg-black border-white/20 text-white rounded-none" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/70">Bio</Label>
                    <Textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-black border-white/20 text-white rounded-none min-h-[100px]" placeholder="Tell collectors about yourself..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/70">Location</Label>
                      <Input value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} className="bg-black border-white/20 text-white rounded-none" placeholder="e.g. Lusaka, Zambia" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/70">WhatsApp Number</Label>
                      <Input value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="bg-black border-white/20 text-white rounded-none" placeholder="e.g. 26097..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 rounded-none h-12 uppercase tracking-widest font-bold text-xs">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map(s => (
              <div key={s.label} className="bg-neutral-900 border border-white/10 p-6 flex flex-col gap-4 relative overflow-hidden group">
                <div className="flex items-center justify-between text-white/20">
                  {s.icon}
                  <TrendingUp className="h-3 w-3 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white font-headline leading-none">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-tighter font-bold text-white/30 mt-2">{s.label}</p>
                  <p className="text-[9px] text-white/20 mt-1">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* My Artworks */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white border-b-2 border-white pb-4 -mb-[17px]">My Artworks</h2>
              <Link href="/artist/upload">
                <Button variant="outline" size="sm" className="text-[9px] uppercase tracking-widest border-white/20 text-white hover:bg-white hover:text-black rounded-none gap-2 h-9 px-4">
                  <ImagePlus className="h-3.5 w-3.5" /> Upload New Piece
                </Button>
              </Link>
            </div>

            {loadingArtworks ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-neutral-900/50 animate-pulse border border-white/5" />)}
              </div>
            ) : artworks.length === 0 ? (
              <div className="border border-dashed border-white/10 flex flex-col items-center justify-center py-20 text-center bg-neutral-900/20">
                <ImagePlus className="h-12 w-12 text-white/10 mb-6" />
                <p className="text-white/40 text-sm mb-6 font-light">No artworks in your gallery yet.</p>
                <Link href="/artist/upload"><Button className="rounded-none bg-white text-black hover:bg-neutral-200 text-[10px] tracking-widest uppercase px-8 h-12 font-bold">Start Exhibiting</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artworks.map(art => (
                  <div key={art.id} className="group relative bg-neutral-900 border border-white/10 hover:border-white/30 transition-all duration-500">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image src={art.imageUrl} alt={art.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[0.3] group-hover:grayscale-0" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-md border ${
                          (art as any).status === "sold" ? "bg-red-500/20 border-red-500/30 text-red-400" :
                          (art as any).status === "pending" ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" :
                          "bg-green-500/20 border-green-500/30 text-green-400"
                        }`}>
                          {(art as any).status === "sold" ? <ShoppingBag className="h-2.5 w-2.5" /> : 
                           (art as any).status === "pending" ? <Clock className="h-2.5 w-2.5" /> : 
                           <CheckCircle2 className="h-2.5 w-2.5" />}
                          {(art as any).status || "Approved"}
                        </span>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Link href={`/artwork/${art.id}`}>
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/20 hover:bg-white hover:text-black transition-all">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/20 hover:bg-white hover:text-black transition-all">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white rounded-none">
                            <DropdownMenuItem className="focus:bg-white focus:text-black cursor-pointer gap-2 py-3" asChild>
                              <Link href={`/artist/edit/${art.id}`}><Edit className="h-4 w-4" /> Edit Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 focus:bg-red-500 focus:text-white cursor-pointer gap-2 py-3" onClick={() => handleDeleteArtwork(art.id)}>
                              <Trash2 className="h-4 w-4" /> Delete Forever
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-5 flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-white text-lg font-bold font-headline truncate max-w-[150px]">{art.title}</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">{art.medium}</p>
                      </div>
                      <p className="text-white font-mono text-sm font-bold">ZMW {art.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
