import { setDoc, doc } from "firebase/firestore";
import { db } from "./firebase/config";
import { PlaceHolderImages, Artist } from "../app/lib/placeholder-images";

async function seed() {
  console.log("Seeding database...");
  
  // Seed User (Artist)
  const artistId = "artist-demo-1";
  await setDoc(doc(db, "users", artistId), {
    ...Artist,
    role: "artist",
    verified: true,
  });
  console.log("Artist seeded.");

  // Seed Artworks
  for (const art of PlaceHolderImages) {
    await setDoc(doc(db, "artworks", art.id), {
      ...art,
      artistId,
      status: "approved",
    });
    console.log(`Artwork ${art.id} seeded.`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
