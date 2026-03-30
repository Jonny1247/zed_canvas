import { 
  collection, doc, getDocs, getDoc, setDoc, query, where, addDoc, serverTimestamp, updateDoc, deleteDoc, orderBy, limit 
} from "firebase/firestore";
import { db } from "./config";
import type { ImagePlaceholder } from "../../app/lib/placeholder-images";

// Artworks
export interface ArtworkFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export async function getApprovedArtworks(filters?: ArtworkFilter): Promise<ImagePlaceholder[]> {
  // Add a filter for "approved" status for public view
  let q = query(collection(db, "artworks"), where("status", "==", "approved"));
  
  const querySnapshot = await getDocs(q);
  let artworks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

  // Filter for approved artworks AND verified artists
  // In a real app, you'd denormalize isVerified onto the artwork or use a join-like logic
  // For now, we'll fetch artist status if needed or assume artworks themselves have a status
  artworks = artworks.filter((art: any) => art.status !== "pending");

  // Further filter by artist verification
  const verifiedArtistIds = new Set<string>();
  const artistChecks = Array.from(new Set(artworks.map((a: any) => a.artistId)));
  
  for (const artistId of artistChecks) {
    if (!artistId) continue;
    const artistDoc = await getDoc(doc(db, "users", artistId as string));
    if (artistDoc.exists() && artistDoc.data().isVerified) {
      verifiedArtistIds.add(artistId);
    }
  }

  artworks = artworks.filter((art: any) => verifiedArtistIds.has(art.artistId));

  // Apply category filter if present
  if (filters?.category && filters.category !== "All") {
    artworks = artworks.filter((art: any) => art.category === filters.category);
  }

  // In-memory filtering for price if provided
  if (filters?.minPrice !== undefined) {
    artworks = artworks.filter(a => (a as any).price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    artworks = artworks.filter(a => (a as any).price <= filters.maxPrice!);
  }
  // Location would require artist data, so we'll handle that later or locally

  return artworks;
}

export async function getArtworkById(id: string): Promise<ImagePlaceholder | null> {
  const docRef = doc(db, "artworks", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as ImagePlaceholder;
}

export async function getArtworksByArtist(artistId: string): Promise<ImagePlaceholder[]> {
  const q = query(collection(db, "artworks"), where("artistId", "==", artistId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImagePlaceholder));
}

// Orders
export async function createOrder(artworkId: string, customerId: string = 'demo-customer', agreedPrice?: number) {
  const ordersRef = collection(db, "orders");
  return await addDoc(ordersRef, {
    artworkId,
    customerId,
    agreedPrice: agreedPrice || null,
    status: "pending",
    timestamp: serverTimestamp(),
  });
}

// Reviews
export async function getReviewsByArtwork(artworkId: string) {
  const q = query(collection(db, "reviews"), where("artworkId", "==", artworkId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Verifications
export async function createVerification(artistId: string, documents: string[]) {
  const verificationsRef = collection(db, "verifications");
  return await addDoc(verificationsRef, {
    artistId,
    status: "pending",
    documents,
    submittedAt: serverTimestamp(),
  });
}

// Create Artwork
export interface ArtworkData {
  title: string;
  description: string;
  imageUrl: string;
  imageUrls: string[]; // Support for multiple images
  imageHint: string;
  price: number;
  isNegotiable: boolean;
  category: string;
  availability: "Available" | "Sold" | "Reserved";
  medium: string;
  dimensions: string;
  materials: string;
  story: string;
  year: string;
  tags: string[];
  artistId: string;
  location?: string;
  views?: number;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected';
}

export interface VerificationRequest {
  userId: string;
  role: 'artist' | 'customer';
  portraitUrl?: string;
  nrcFrontUrl?: string;
  nrcBackUrl?: string;
  portfolioUrl?: string;
  otpCode?: string;
  otpExpiry?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export async function createArtwork(data: ArtworkData) {
  const artworksRef = collection(db, "artworks");
  const docRef = await addDoc(artworksRef, {
    ...data,
    status: "pending", // Requires admin approval before appearing in gallery
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateArtwork(id: string, data: Partial<ArtworkData>) {
  const docRef = doc(db, "artworks", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteArtwork(id: string) {
  const docRef = doc(db, "artworks", id);
  await deleteDoc(docRef);
}

export async function verifyCustomerOTP(userId: string, enteredCode: string) {
  const docRef = doc(db, "otps", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.code === enteredCode && new Date(data.expiry) > new Date()) {
      await updateDoc(doc(db, "users", userId), {
        isVerified: true,
        verificationStatus: 'approved'
      });
      return true;
    }
  }
  return false;
}

export async function submitVerificationRequest(data: {
  userId: string;
  role: 'artist' | 'customer';
  portraitUrl?: string;
  nrcFrontUrl?: string;
  nrcBackUrl?: string;
  portfolioUrl?: string;
}) {
  const verificationsRef = collection(db, "verifications");
  await addDoc(verificationsRef, {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  // Update user's verification status to pending
  await updateDoc(doc(db, "users", data.userId), {
    verificationStatus: 'pending',
  });
}

export async function submitCustomerOTP(userId: string, otp: string) {
  const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  await setDoc(doc(db, "otps", userId), {
    code: otp,
    expiry,
    createdAt: serverTimestamp(),
  });
}

export async function getPendingVerifications() {
  const q = query(
    collection(db, "verifications"), 
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  // We need to fetch user names too
  const requests = await Promise.all(snapshot.docs.map(async d => {
    const data = d.data();
    const userSnap = await getDoc(doc(db, "users", data.userId));
    return {
      id: d.id,
      ...data,
      userName: userSnap.exists() ? userSnap.data().name : "Unknown User"
    };
  }));
  return requests;
}

export async function approveVerification(requestId: string, userId: string) {
  // Update request status
  await updateDoc(doc(db, "verifications", requestId), {
    status: 'approved'
  });

  // Update user status
  await updateDoc(doc(db, "users", userId), {
    isVerified: true,
    verificationStatus: 'approved'
  });

  // In a real app, trigger email here via Cloud Function
  console.log(`[SIMULATED] Email sent to ${userId}: You are now a verified artist on Zambian Crafted!`);
}

export async function rejectVerification(requestId: string, userId: string, reason: string) {
  // Update request status
  await updateDoc(doc(db, "verifications", requestId), {
    status: 'rejected',
    rejectionReason: reason
  });

  // Update user status
  await updateDoc(doc(db, "users", userId), {
    isVerified: false,
    verificationStatus: 'rejected'
  });

  // In a real app, trigger email here via Cloud Function
  console.log(`[SIMULATED] Email sent to ${userId}: Your verification was rejected. Reason: ${reason}. Link to resubmit: /verify/artist`);
}

// User Profiles
export async function getUserById(uid: string) {
  const docRef = doc(db, "users", uid);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...snapshot.data() };
}

export async function updateUserProfile(uid: string, data: any) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Messaging
export interface Conversation {
  id: string;
  participants: string[];
  artworkId: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  unreadCount: Record<string, number>;
  status: 'active' | 'blocked';
  blockedBy?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  type: 'text' | 'system' | 'image' | 'offer';
  imageUrl?: string;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined';
}

export async function startConversation(artworkId: string, buyerId: string, artistId: string) {
  // Check if conversation already exists between these 2 for this artwork
  const q = query(
    collection(db, "conversations"), 
    where("artworkId", "==", artworkId),
    where("participants", "array-contains", buyerId)
  );
  
  const snapshot = await getDocs(q);
  const existing = snapshot.docs.find(d => d.data().participants.includes(artistId));
  
  if (existing) {
    return existing.id;
  }

  const convRef = collection(db, "conversations");
  const docRef = await addDoc(convRef, {
    participants: [buyerId, artistId],
    artworkId,
    unreadCount: { [buyerId]: 0, [artistId]: 0 },
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  // Create automated safety message
  await addDoc(collection(db, "conversations", docRef.id, "messages"), {
    text: "For your safety, keep all negotiations and payments within Zambian Canvas. Avoid sharing personal banking details in chat.",
    senderId: "system",
    type: "system",
    timestamp: serverTimestamp()
  });

  return docRef.id;
}

export async function sendMessage(
  conversationId: string, 
  senderId: string, 
  text: string, 
  receiverId: string,
  options?: {
    type?: 'text' | 'system' | 'image' | 'offer';
    imageUrl?: string;
    offerAmount?: number;
    offerStatus?: 'pending' | 'accepted' | 'declined';
  }
) {
  const convRef = doc(db, "conversations", conversationId);
  const messageRef = collection(db, "conversations", conversationId, "messages");
  
  await addDoc(messageRef, {
    text,
    senderId,
    type: options?.type || "text",
    imageUrl: options?.imageUrl || null,
    offerAmount: options?.offerAmount || null,
    offerStatus: options?.offerStatus || null,
    timestamp: serverTimestamp()
  });

  const snap = await getDoc(convRef);
  if (snap.exists()) {
    const data = snap.data();
    const currentUnread = data.unreadCount?.[receiverId] || 0;
    await updateDoc(convRef, {
      lastMessage: {
        text,
        senderId,
        timestamp: serverTimestamp()
      },
      [`unreadCount.${receiverId}`]: currentUnread + 1,
      updatedAt: serverTimestamp()
    });
  }
}

export async function resetUnreadCount(conversationId: string, userId: string) {
  const convRef = doc(db, "conversations", conversationId);
  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0
  });
}

export async function blockUser(conversationId: string, userId: string) {
  const convRef = doc(db, "conversations", conversationId);
  await updateDoc(convRef, {
    status: 'blocked',
    blockedBy: userId,
    updatedAt: serverTimestamp()
  });
}

export async function updateMessage(conversationId: string, messageId: string, data: Partial<Message>) {
  const msgRef = doc(db, "conversations", conversationId, "messages", messageId);
  await updateDoc(msgRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function reportConversation(conversationId: string, reportedBy: string, transcript: any[]) {
  const reportsRef = collection(db, "reports");
  await addDoc(reportsRef, {
    conversationId,
    reportedBy,
    transcript,
    status: 'pending',
    reportedAt: serverTimestamp()
  });
}

export async function getReportedConversations() {
  const q = query(collection(db, "reports"), where("status", "==", "pending"), orderBy("reportedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function resolveReport(reportId: string, resolutionDetails: string) {
  const reportRef = doc(db, "reports", reportId);
  await updateDoc(reportRef, {
    status: 'resolved',
    resolutionDetails,
    resolvedAt: serverTimestamp()
  });
}
