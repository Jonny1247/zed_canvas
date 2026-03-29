import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault(), projectId: "zambian-canvas-dev-3a9f" });
const db = getFirestore();

const ARTIST_ID = "seed-artist-musa-roy";

const artist = {
  name: "Musa Roy",
  profileImage: "https://picsum.photos/seed/musaroy-artist/800/1000",
  bio: "Contemporary mixed-media artist exploring the intersection of traditional Zambian motifs and modern urban life.",
  location: "Lusaka, Zambia",
  role: "artist",
  verified: true,
  socials: { instagram: "@musaroy_art", twitter: "@musaroy", website: "www.musaroy.com" }
};

const artworks = [
  { id: "art-1", title: "Ingoma: The Divine Rhythm", description: "A detailed acrylic study of the traditional Ngoni drum, capturing the resonance of Zambian heritage.", imageUrl: "https://picsum.photos/seed/ingoma/800/1000", imageHint: "Zambian drum", price: 2500, year: "2024", medium: "Mixed Media / Acrylic", dimensions: "36 x 48 inches", tags: ["drum", "heritage", "traditional"] },
  { id: "art-2", title: "Mosi-oa-Tunya", description: "The Smoke That Thunders. A breathtaking impressionist view of the Victoria Falls during the emerald season.", imageUrl: "https://picsum.photos/seed/falls/1200/800", imageHint: "Victoria Falls", price: 4800, year: "2023", medium: "Oil on Canvas", dimensions: "60 x 40 inches", tags: ["waterfall", "landscape", "victoria falls"] },
  { id: "art-3", title: "Dr. Kenneth Kaunda: The Patriot", description: "A solemn and vibrant portrait of Zambia's founding father, celebrating the spirit of One Zambia, One Nation.", imageUrl: "https://picsum.photos/seed/kk/800/800", imageHint: "Kenneth Kaunda", price: 3200, year: "2024", medium: "Acrylic Portrait", dimensions: "30 x 30 inches", tags: ["portrait", "history", "zambia"] },
  { id: "art-4", title: "Lusaka Skyline at Dusk", description: "Contemporary cityscape depicting the urban pulse of Cairo Road as the golden hour settles over the capital.", imageUrl: "https://picsum.photos/seed/lusaka/1000/600", imageHint: "Lusaka city", price: 1900, year: "2024", medium: "Digital Painting", dimensions: "24 x 36 inches", tags: ["cityscape", "lusaka", "urban"] },
  { id: "art-5", title: "Luangwa Giant", description: "A charcoal and ochre depiction of a majestic elephant roaming the South Luangwa National Park.", imageUrl: "https://picsum.photos/seed/elephant/800/600", imageHint: "Zambian elephant", price: 2100, year: "2023", medium: "Charcoal and Ochre", dimensions: "20 x 30 inches", tags: ["wildlife", "elephant", "nature"] },
  { id: "art-6", title: "Chitenge Reverie", description: "Abstract patterns and textures inspired by the vibrant textiles found in markets across the Copperbelt.", imageUrl: "https://picsum.photos/seed/chitenge/800/1000", imageHint: "African textile", price: 1500, year: "2024", medium: "Textile Collage", dimensions: "24 x 24 inches", tags: ["abstract", "textile", "copperbelt"] },
];

const sampleOrder = {
  artworkId: "art-2",
  customerId: "seed-customer-1",
  status: "pending",
  timestamp: Timestamp.now(),
};

const sampleReview = {
  artworkId: "art-1",
  customerId: "seed-customer-1",
  rating: 5,
  comment: "Absolutely breathtaking piece. The rhythm of Zambia captured so vividly.",
  createdAt: Timestamp.now(),
};

const sampleVerification = {
  artistId: ARTIST_ID,
  status: "approved",
  documents: [],
  submittedAt: Timestamp.now(),
};

async function seed() {
  console.log("\n🌱 Seeding Zambian Canvas database...\n");

  // Seed artist user
  await db.collection("users").doc(ARTIST_ID).set(artist);
  console.log("✅ Artist user seeded:", ARTIST_ID);

  // Seed artworks
  const batch = db.batch();
  for (const art of artworks) {
    const ref = db.collection("artworks").doc(art.id);
    batch.set(ref, { ...art, artistId: ARTIST_ID, status: "approved", createdAt: Timestamp.now() });
    console.log("  🖼  Artwork queued:", art.title);
  }
  await batch.commit();
  console.log("✅ All artworks seeded!");

  // Seed a sample order
  await db.collection("orders").add(sampleOrder);
  console.log("✅ Sample order seeded");

  // Seed a sample review
  await db.collection("reviews").add(sampleReview);
  console.log("✅ Sample review seeded");

  // Seed a verification
  await db.collection("verifications").add(sampleVerification);
  console.log("✅ Verification record seeded");

  console.log("\n🎉 Database seeding complete!\n");
  process.exit(0);
}

seed().catch(e => { console.error("❌ Seed failed:", e); process.exit(1); });
