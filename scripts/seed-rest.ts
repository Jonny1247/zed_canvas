/**
 * Seed script using Firestore REST API with API key
 * Populates: users, artworks, orders, reviews, verifications
 */

const PROJECT_ID = "zambian-canvas-dev-3a9f";
const API_KEY = "AIzaSyCx_cP_EeOtzJqEbvyUBiMLUi-8Hj-DxRk";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const ARTIST_ID = "seed-artist-musa-roy";

async function setDoc(collection: string, docId: string, data: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map((i: any) => ({ stringValue: i })) } };
    else if (typeof v === "object" && v !== null) {
      const sub: Record<string, any> = {};
      for (const [sk, sv] of Object.entries(v)) sub[sk] = { stringValue: String(sv) };
      fields[k] = { mapValue: { fields: sub } };
    }
  }
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  if (!res.ok) throw new Error(`Failed to write ${collection}/${docId}: ${await res.text()}`);
}

async function addDoc(collection: string, data: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
  }
  const url = `${BASE_URL}/${collection}?key=${API_KEY}`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  if (!res.ok) throw new Error(`Failed to add to ${collection}: ${await res.text()}`);
  return res.json();
}

const artworks = [
  { id: "art-1", title: "Ingoma: The Divine Rhythm", description: "A detailed acrylic study of the traditional Ngoni drum.", imageUrl: "https://picsum.photos/seed/ingoma/800/1000", imageHint: "Zambian drum", price: 2500, year: "2024", medium: "Mixed Media / Acrylic", dimensions: "36 x 48 inches" },
  { id: "art-2", title: "Mosi-oa-Tunya", description: "The Smoke That Thunders. Impressionist view of the Victoria Falls.", imageUrl: "https://picsum.photos/seed/falls/1200/800", imageHint: "Victoria Falls", price: 4800, year: "2023", medium: "Oil on Canvas", dimensions: "60 x 40 inches" },
  { id: "art-3", title: "Dr. Kenneth Kaunda: The Patriot", description: "A solemn and vibrant portrait of Zambia's founding father.", imageUrl: "https://picsum.photos/seed/kk/800/800", imageHint: "Kenneth Kaunda", price: 3200, year: "2024", medium: "Acrylic Portrait", dimensions: "30 x 30 inches" },
  { id: "art-4", title: "Lusaka Skyline at Dusk", description: "Contemporary cityscape of Cairo Road at golden hour.", imageUrl: "https://picsum.photos/seed/lusaka/1000/600", imageHint: "Lusaka city", price: 1900, year: "2024", medium: "Digital Painting", dimensions: "24 x 36 inches" },
  { id: "art-5", title: "Luangwa Giant", description: "Charcoal and ochre depiction of a majestic elephant.", imageUrl: "https://picsum.photos/seed/elephant/800/600", imageHint: "Zambian elephant", price: 2100, year: "2023", medium: "Charcoal and Ochre", dimensions: "20 x 30 inches" },
  { id: "art-6", title: "Chitenge Reverie", description: "Abstract patterns inspired by the vibrant textiles of the Copperbelt.", imageUrl: "https://picsum.photos/seed/chitenge/800/1000", imageHint: "African textile", price: 1500, year: "2024", medium: "Textile Collage", dimensions: "24 x 24 inches" },
];

async function seed() {
  console.log("\n🌱 Seeding Zambian Canvas database via REST API...\n");

  // users
  await setDoc("users", ARTIST_ID, { name: "Musa Roy", profileImage: "https://picsum.photos/seed/musaroy-artist/800/1000", bio: "Contemporary mixed-media artist.", location: "Lusaka, Zambia", role: "artist", verified: true });
  console.log("✅ Artist user seeded");

  // artworks
  for (const art of artworks) {
    const { id, ...data } = art;
    await setDoc("artworks", id, { ...data, artistId: ARTIST_ID, status: "approved" });
    console.log(`  🖼  Seeded: ${art.title}`);
  }

  // orders
  await addDoc("orders", { artworkId: "art-1", customerId: "seed-customer-1", status: "pending" });
  console.log("✅ Sample order seeded");

  // reviews
  await addDoc("reviews", { artworkId: "art-1", customerId: "seed-customer-1", rating: 5, comment: "Absolutely breathtaking piece." });
  console.log("✅ Sample review seeded");

  // verifications
  await addDoc("verifications", { artistId: ARTIST_ID, status: "approved" });
  console.log("✅ Verification record seeded");

  console.log("\n🎉 Database seeding complete! All 5 collections populated.\n");
}

seed().catch(e => { console.error("❌ Seed failed:", e.message); process.exit(1); });
