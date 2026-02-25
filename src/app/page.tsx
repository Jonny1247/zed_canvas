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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden african-pattern">
          <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
              <h1 className="text-6xl md:text-7xl font-bold leading-tight text-foreground">
                The Soul of <span className="text-primary italic">Zambia</span> in Every Stroke
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-body">
                Discover a curated marketplace of authentic Zambian artworks. From the heart of Lusaka to the reaches of the Luangwa, we bring you the finest African artistry.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/explore">
                  <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-lg clay-shadow">
                    Start Exploring
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium border-primary text-primary hover:bg-primary/10">
                    Sell Your Art
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-500">
                <Image 
                  src={PlaceHolderImages[0].imageUrl} 
                  alt="Zambian Art" 
                  width={600} 
                  height={800}
                  className="object-cover h-[600px] w-full"
                  data-ai-hint="Zambian art"
                />
              </div>
              <div className="absolute top-10 -right-10 w-full h-full border-4 border-accent rounded-2xl -z-10 -rotate-2"></div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold font-headline">Featured Collection</h2>
                <p className="text-muted-foreground">Handpicked masterpieces from our artist community.</p>
              </div>
              <Link href="/explore">
                <Button variant="link" className="text-primary group text-lg p-0">
                  View full catalog <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArt.map((art, idx) => (
                <Link href={`/artwork/${art.id}`} key={art.id}>
                  <Card className="group overflow-hidden border-none bg-transparent hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg mb-4">
                        <Image 
                          src={art.imageUrl} 
                          alt={art.description} 
                          fill
                          className="object-cover transition-transform group-hover:scale-110 duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-[10px] font-bold">TOP RATED</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold font-headline mb-1">Untitled Composition #{idx + 1}</h3>
                      <p className="text-sm text-muted-foreground mb-2">By Chanda Mwamba</p>
                      <p className="text-primary font-bold text-lg">ZMW 2,500</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-accent text-accent-foreground african-pattern">
          <div className="container mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-headline">Are you a Zambian artist?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join our growing community and share your vision with art collectors from around the world. Secure payments, direct messaging, and professional exposure.
            </p>
            <Link href="/sell">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-14 px-10 text-lg">
                Start Selling Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/30 py-12 border-t">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="text-primary h-6 w-6" />
              <span className="font-headline text-xl font-bold tracking-tight text-primary">
                Zambian Canvas
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Supporting the vibrant arts scene of Zambia through digital connectivity and cultural celebration.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-primary">All Artworks</Link></li>
              <li><Link href="/explore?category=paintings" className="hover:text-primary">Paintings</Link></li>
              <li><Link href="/explore?category=sculpture" className="hover:text-primary">Sculptures</Link></li>
              <li><Link href="/explore?category=digital" className="hover:text-primary">Digital Art</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zambian Canvas. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
