import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/app/lib/placeholder-images";
import { ArrowRight, Star, Palette } from "lucide-react";

export default function Home() {
  const featuredArt = PlaceHolderImages.filter(img => img.id.startsWith('art'));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden african-pattern">
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <h1 className="text-7xl md:text-8xl font-bold leading-[0.9] text-white">
                  The Soul of <span className="text-primary italic">Zambia</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-body font-light">
                  A curated minimalist gallery showcasing authentic Zambian masterpieces. From urban Lusaka to the wild Luangwa.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                <Link href="/explore">
                  <Button size="lg" className="h-16 px-10 text-lg font-bold shadow-2xl rounded-none">
                    Enter Gallery
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-white/20 text-white hover:bg-white hover:text-black rounded-none">
                    Exhibit Art
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block group">
              <div className="relative z-10 gallery-border overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)] transition-transform duration-700 hover:scale-[1.02]">
                <Image 
                  src={PlaceHolderImages[0].imageUrl} 
                  alt="Zambian Art" 
                  width={600} 
                  height={800}
                  className="object-cover h-[700px] w-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  data-ai-hint="Zambian art"
                />
              </div>
              <div className="absolute -inset-4 border border-white/5 -z-10 -rotate-1 group-hover:rotate-0 transition-transform duration-700"></div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-32 bg-background border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="space-y-3">
                <h2 className="text-5xl font-bold font-headline">Featured Works</h2>
                <p className="text-muted-foreground text-lg font-light">Hand-selected pieces from our premier artist community.</p>
              </div>
              <Link href="/explore">
                <Button variant="link" className="text-white group text-lg p-0 hover:no-underline">
                  View full catalog <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
              {featuredArt.map((art, idx) => (
                <Link href={`/artwork/${art.id}`} key={art.id}>
                  <Card className="group overflow-hidden border-none bg-transparent hover:translate-y-[-8px] transition-all duration-500">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/5] overflow-hidden mb-6 gallery-border bg-neutral-900">
                        <Image 
                          src={art.imageUrl} 
                          alt={art.description} 
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                          <span className="text-white font-bold tracking-[0.2em] uppercase text-sm border-b border-white pb-1">Enlarge</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold font-headline">Collection Piece #{idx + 1}</h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Chanda Mwamba</p>
                        <p className="text-white font-light text-xl mt-4">ZMW 2,500</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 bg-neutral-950 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full african-pattern opacity-20 pointer-events-none" />
          <div className="container mx-auto px-4 text-center space-y-12 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold font-headline leading-tight">Exhibit Your <span className="italic">Vision</span></h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Join the most exclusive digital platform for Zambian artists. Direct access to international collectors, secure escrow payments, and professional curation.
            </p>
            <div className="pt-8">
              <Link href="/sell">
                <Button size="lg" className="bg-white text-black hover:bg-neutral-200 h-20 px-16 text-xl font-bold rounded-none">
                  Begin Exhibition
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-20 border-t border-white/5">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Palette className="text-white h-7 w-7" />
              <span className="font-headline text-2xl font-bold tracking-tight text-white">
                Zambian Canvas
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm font-light leading-relaxed">
              Elevating the Zambian arts through digital connectivity and high-contrast cultural celebration.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-white uppercase tracking-widest text-sm">Marketplace</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li><Link href="/explore" className="hover:text-white transition-colors">Catalog</Link></li>
              <li><Link href="/explore?category=paintings" className="hover:text-white transition-colors">Paintings</Link></li>
              <li><Link href="/explore?category=sculpture" className="hover:text-white transition-colors">Sculptures</Link></li>
              <li><Link href="/explore?category=digital" className="hover:text-white transition-colors">Digital</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-white uppercase tracking-widest text-sm">Collective</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li><Link href="/about" className="hover:text-white transition-colors">Vision</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Inquiries</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Legal</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          © {new Date().getFullYear()} Zambian Canvas • Private Gallery
        </div>
      </footer>
    </div>
  );
}
