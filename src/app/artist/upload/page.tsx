"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Sparkles, Upload, Loader2, CheckCircle2, X, ImageIcon, 
  Plus, Info, AlertCircle 
} from "lucide-react";
import { artworkDescriptionAssistant } from "@/ai/flows/artwork-description-assistant-flow";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { uploadArtworkImage } from "@/lib/firebase/storage";
import { createArtwork } from "@/lib/firebase/firestore";

const CATEGORIES = [
  "Painting", "Sculpture", "Textile", "Pottery", 
  "Beadwork", "Wood Carving", "Digital Art", "Photography"
];

export default function UploadArtworkPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  // Multiple Images state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    isNegotiable: false,
    availability: "Available" as const,
    medium: "",
    dimensions: "",
    materials: "",
    story: "",
    tags: [] as string[]
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({ title: "Authentication Required", description: "Please sign in to exhibit artwork." });
        router.push("/login");
      } else if (user.role !== 'artist' && user.role !== 'admin') {
        toast({ title: "Access Denied", description: "Only artists can exhibit artwork.", variant: "destructive" });
        router.push("/");
      } else if (!user.isVerified && user.role !== 'admin') {
        toast({ title: "Verification Required", description: "Your account must be verified before you can upload artworks.", variant: "destructive" });
        router.push("/artist/dashboard");
      }
    }
  }, [user, authLoading, router, toast]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 5) {
      toast({ title: "Limit Exceeded", description: "You can upload up to 5 images.", variant: "destructive" });
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File", description: `${file.name} is not an image.`, variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File Too Large", description: `${file.name} exceeds 10MB.`, variant: "destructive" });
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiAssist = async () => {
    if (!formData.medium || !formData.story) {
      toast({
        title: "Missing Information",
        description: "Please provide the medium and the story behind the piece to help the AI.",
        variant: "destructive"
      });
      return;
    }
    setAiLoading(true);
    try {
      const result = await artworkDescriptionAssistant({
        title: formData.title,
        medium: formData.medium,
        dimensions: formData.dimensions,
        inspiration: formData.story,
        style: formData.category,
        colors: ""
      });
      setFormData(prev => ({ ...prev, description: result.description, tags: result.tags }));
      toast({ title: "Description Generated", description: "The AI has created a compelling description." });
    } catch {
      toast({ title: "Error", description: "Failed to generate description.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast({ title: "Image Required", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }
    if (!formData.category) {
      toast({ title: "Category Required", description: "Please select a category.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      // Step 1: Upload all images
      toast({ title: "Uploading Images...", description: "Processing your artwork gallery." });
      
      const uploadPromises = imageFiles.map(async (file, index) => {
        return await uploadArtworkImage(file, user.uid, (progress) => {
          setUploadProgress(prev => ({ ...prev, [index]: progress }));
        });
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Step 2: Write to Firestore
      await createArtwork({
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrls[0], // Primary image
        imageUrls: imageUrls,
        imageHint: formData.title.toLowerCase().split(" ").slice(0, 3).join(" "),
        price: parseFloat(formData.price),
        isNegotiable: formData.isNegotiable,
        category: formData.category,
        availability: formData.availability,
        medium: formData.medium,
        dimensions: formData.dimensions,
        materials: formData.materials,
        story: formData.story,
        year: new Date().getFullYear().toString(),
        tags: formData.tags,
        artistId: user.uid,
        location: user.location,
        views: 0
      });

      setSubmitted(true);
      toast({ title: "Success!", description: "Your artwork has been submitted for review." });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-md animate-in fade-in zoom-in duration-500">
            <div className="h-24 w-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold font-headline text-white tracking-tighter">Art Submitted.</h1>
              <p className="text-white/40 text-lg font-light leading-relaxed">
                Your masterpiece is now in the queue for curation. It'll be visible in the gallery once approved.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => window.location.reload()} className="rounded-none h-14 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs">Exhibit Another Piece</Button>
              <Button variant="outline" onClick={() => router.push("/artist/dashboard")} className="rounded-none h-14 border-white/10 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs">Return to Dashboard</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-12 border-b border-white/5 pb-8">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold mb-3">Artist Studio / New Exhibition</p>
          <h1 className="text-6xl font-bold font-headline text-white tracking-tighter">Exhibit Your Work.</h1>
          <p className="text-white/40 text-lg mt-4 font-light max-w-2xl leading-relaxed">
            Fill in the details of your creation. Be as descriptive as possible to capture the interest of collectors.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            {/* Basic Info */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">01</span>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-white">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">Artwork Title</Label>
                  <Input placeholder="e.g. Whispers of the Zambezi" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="bg-neutral-900 border-white/10 text-white rounded-none h-12 focus-visible:ring-0 focus-visible:border-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">Category</Label>
                  <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                    <SelectTrigger className="bg-neutral-900 border-white/10 text-white rounded-none h-12 focus:ring-0">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-none">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="focus:bg-white focus:text-black cursor-pointer">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">Price (ZMW)</Label>
                  <Input type="number" min="0" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="bg-neutral-900 border-white/10 text-white rounded-none h-12" />
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">Price Negotiable?</Label>
                  <div className="flex items-center gap-3 h-12">
                    <Switch checked={formData.isNegotiable} onCheckedChange={val => setFormData({...formData, isNegotiable: val})} />
                    <span className="text-xs text-white/40">{formData.isNegotiable ? "Yes, I'm open to offers" : "Fixed Price"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Availability Status</Label>
                <Select value={formData.availability} onValueChange={(val: any) => setFormData({...formData, availability: val})}>
                  <SelectTrigger className="bg-neutral-900 border-white/10 text-white rounded-none h-12 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-none">
                    <SelectItem value="Available" className="focus:bg-white focus:text-black">Available for Sale</SelectItem>
                    <SelectItem value="Sold" className="focus:bg-white focus:text-black">Sold / Not for Sale</SelectItem>
                    <SelectItem value="Reserved" className="focus:bg-white focus:text-black">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Technical Details */}
            <section className="space-y-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">02</span>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-white">Technical Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">Medium</Label>
                  <Input placeholder="e.g. Oil on Canvas" value={formData.medium} onChange={e => setFormData({...formData, medium: e.target.value})} className="bg-neutral-900 border-white/10 text-white rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">Dimensions</Label>
                  <Input placeholder="e.g. 100cm x 120cm" value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} className="bg-neutral-900 border-white/10 text-white rounded-none h-12" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Materials Used</Label>
                <Input placeholder="e.g. Acrylic paint, recycled copper, wood" value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} className="bg-neutral-900 border-white/10 text-white rounded-none h-12" />
              </div>
            </section>

            {/* Story & Description */}
            <section className="space-y-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">03</span>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-white">The Narrative</h2>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Story Behind This Piece</Label>
                <Textarea placeholder="What inspired you? What is the journey of this creation?" value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} className="bg-neutral-900 border-white/10 text-white rounded-none min-h-[120px]" />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase tracking-widest text-white/50">AI-Enhanced Description</Label>
                  <Button type="button" variant="outline" size="sm" className="h-8 text-[9px] uppercase tracking-widest border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-none gap-2" onClick={handleAiAssist} disabled={aiLoading}>
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {aiLoading ? "Consulting Museum..." : "Fine-tune with AI"}
                  </Button>
                </div>
                <Textarea placeholder="A professional gallery description for your artwork..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-neutral-900 border-white/10 text-white rounded-none min-h-[150px]" />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase tracking-widest font-bold bg-white/5 px-3 py-1 text-white/40">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Image Upload */}
          <div className="lg:col-span-5 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-white">Visuals ({imageFiles.length}/5)</h2>
                {imageFiles.length > 0 && (
                  <button type="button" onClick={() => { setImageFiles([]); setImagePreviews([]); }} className="text-[9px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">Clear All</button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Main Image Dropzone */}
                {imagePreviews.length < 5 && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/5] border-2 border-dashed border-white/10 bg-neutral-950/50 flex flex-col items-center justify-center text-center p-8 transition-all hover:border-white/30 cursor-pointer group"
                  >
                    <div className="h-16 w-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-white/40" />
                    </div>
                    <p className="text-sm font-bold text-white mb-2">Upload Artwork</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-6">JPEG, PNG or WebP</p>
                    <div className="bg-white/5 px-4 py-2 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest">Select Files</div>
                  </div>
                )}

                {/* Preview Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square border border-white/10 bg-neutral-900 group overflow-hidden">
                      <Image src={src} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => handleRemoveImage(i)} className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-none border border-white/10">
                        {uploadProgress[i] !== undefined && uploadProgress[i] < 100 ? (
                          <span className="text-[8px] font-bold text-white animate-pulse">{uploadProgress[i]}%</span>
                        ) : (
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest">{i === 0 ? "Primary" : `View ${i+1}`}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
              
              <div className="bg-neutral-900/50 border border-white/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Best Practices</span>
                </div>
                <div className="space-y-3">
                  {[
                    "Use neutral, well-lit backgrounds.",
                    "Include close-ups of texture and materials.",
                    "Ensure photos are sharp and color-accurate.",
                    "Include the primary view as the first upload."
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="h-1 w-1 rounded-full bg-white/20 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-white/30 leading-relaxed font-light">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="pt-8 space-y-6">
              <Button 
                type="submit" 
                disabled={submitting || imageFiles.length === 0} 
                className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-none text-xs uppercase tracking-[0.4em] font-bold shadow-2xl transition-all disabled:opacity-20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Publishing Exhibition...
                  </>
                ) : "Publish to Gallery"}
              </Button>
              <p className="text-center text-[9px] uppercase tracking-[0.2em] text-white/20 px-8 leading-relaxed">
                By publishing, you confirm that this is your original work and complies with our community standards.
              </p>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
