
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Sparkles, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { artworkDescriptionAssistant } from "@/ai/flows/artwork-description-assistant-flow";
import { useToast } from "@/hooks/use-toast";

export default function SellPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    medium: "",
    dimensions: "",
    inspiration: "",
    style: "",
    colors: "",
    price: "",
    description: "",
    tags: [] as string[]
  });

  const handleAiAssist = async () => {
    if (!formData.medium || !formData.inspiration) {
      toast({
        title: "Missing Information",
        description: "Please provide the medium and inspiration to help the AI generate a description.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await artworkDescriptionAssistant({
        title: formData.title,
        medium: formData.medium,
        dimensions: formData.dimensions,
        inspiration: formData.inspiration,
        style: formData.style,
        colors: formData.colors
      });

      setFormData(prev => ({
        ...prev,
        description: result.description,
        tags: result.tags
      }));
      
      toast({
        title: "Description Generated",
        description: "The AI has created a compelling description for your artwork.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Artwork Listed",
      description: "Your masterpiece is now live in the gallery.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <CheckCircle2 className="h-20 w-20 text-primary mx-auto" />
            <h1 className="text-4xl font-bold font-headline">Successfully Listed!</h1>
            <p className="text-muted-foreground text-lg">
              Your artwork has been submitted to the Zambian Canvas marketplace. We'll notify you when buyers show interest.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setSubmitted(false)}>List Another Piece</Button>
              <Button variant="outline" asChild><a href="/explore">Go to Gallery</a></Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-headline mb-2">Exhibit Your Talent</h1>
          <p className="text-muted-foreground">Share your artistic vision with our vibrant community of collectors.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="clay-shadow border-none">
              <CardHeader>
                <CardTitle className="font-headline">Artwork Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title of Piece</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Whispering Savannah" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (ZMW)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="3500" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Input 
                      id="medium" 
                      placeholder="e.g., Oil on Canvas, Wood" 
                      value={formData.medium}
                      onChange={e => setFormData({...formData, medium: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input 
                      id="dimensions" 
                      placeholder="e.g., 24x36 inches" 
                      value={formData.dimensions}
                      onChange={e => setFormData({...formData, dimensions: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspiration">The Inspiration / Theme</Label>
                  <Textarea 
                    id="inspiration" 
                    placeholder="Tell us the story behind this piece..." 
                    className="min-h-[100px]"
                    value={formData.inspiration}
                    onChange={e => setFormData({...formData, inspiration: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-headline">Description</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="text-primary border-primary gap-2"
                      onClick={handleAiAssist}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {loading ? "Crafting..." : "AI Assistant"}
                    </Button>
                  </div>
                  <Textarea 
                    id="description" 
                    placeholder="A compelling description for potential buyers..." 
                    className="min-h-[150px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="bg-secondary text-primary text-xs font-bold px-2 py-1 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full shadow-lg clay-shadow h-12">
                  Publish to Gallery
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-dashed border-2 bg-secondary/20 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
              <Upload className="h-12 w-12 text-primary mb-4" />
              <p className="font-bold">Upload Artwork Images</p>
              <p className="text-sm text-muted-foreground mt-2">JPEG or PNG, up to 10MB. High resolution recommended for better sales.</p>
              <input type="file" className="hidden" />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-headline">Submission Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Use natural lighting for photos.</p>
                <p>• Include multiple angles if it's a 3D piece.</p>
                <p>• Be specific about shipping availability.</p>
                <p>• Respond to buyer inquiries within 24 hours.</p>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
