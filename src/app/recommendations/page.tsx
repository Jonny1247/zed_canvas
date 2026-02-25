
"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { personalizeArtSuggestions, PersonalizedArtSuggestionsOutput } from "@/ai/flows/personalized-art-suggestions-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, User, Image as ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PersonalizedArtSuggestionsOutput | null>(null);

  useEffect(() => {
    async function getRecs() {
      try {
        const result = await personalizeArtSuggestions({
          browsingHistory: ["Traditional Lozi patterns", "Zambian landscape oil paintings", "Copperbelt street art"],
          preferences: ["Vibrant colors", "Abstract styles", "Cultural heritage themes"],
          aestheticInteractions: "I love bold geometric shapes and art that tells a story about Zambian village life."
        });
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getRecs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-sm">
            <Sparkles className="h-4 w-4" /> Personalized Curation
          </div>
          <h1 className="text-5xl font-bold font-headline">For Your Collection</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our AI curator has analyzed your tastes to find these hidden gems across Zambia's artistic landscape.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Curating your personal exhibition...</p>
          </div>
        ) : data ? (
          <div className="space-y-16">
            {/* Summary */}
            <div className="bg-secondary/30 p-8 rounded-2xl border-l-4 border-primary italic text-lg leading-relaxed shadow-sm">
              "{data.overallRecommendationSummary}"
            </div>

            {/* Recommended Artworks */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-primary h-6 w-6" />
                <h2 className="text-3xl font-bold font-headline">Suggested Artworks</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.recommendedArtworks.map((art, idx) => (
                  <Card key={idx} className="group overflow-hidden clay-shadow border-none hover:translate-y-[-4px] transition-all">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/recart${idx}/600/400`} 
                        alt={art.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-xl font-bold font-headline text-primary">{art.title}</h3>
                      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">by {art.artist}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{art.description}</p>
                      <Button variant="outline" className="w-full mt-2">View Artwork</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recommended Artists */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <User className="text-accent h-6 w-6" />
                <h2 className="text-3xl font-bold font-headline">Artists You'll Love</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.recommendedArtists.map((artist, idx) => (
                  <Card key={idx} className="p-6 bg-background border border-primary/20 shadow-sm flex gap-6 items-start">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden shrink-0 border-2 border-primary/20">
                      <Image 
                        src={`https://picsum.photos/seed/artistrec${idx}/200/200`} 
                        alt={artist.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold font-headline">{artist.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <MapPin className="h-3 w-3" /> Lusaka, Zambia
                      </div>
                      <p className="text-accent font-bold text-sm uppercase">{artist.style}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{artist.bioSummary}</p>
                      <Button variant="ghost" className="text-primary p-0 h-auto hover:bg-transparent hover:underline">View Portfolio</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-20">
            <p>Something went wrong generating your recommendations.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        )}
      </main>
    </div>
  );
}
