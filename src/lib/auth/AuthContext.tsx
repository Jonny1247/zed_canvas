"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Combine Firebase Auth User with Firestore custom user profile metadata
export interface UserProfile {
  uid: string;
  email: string | null;
  role: "artist" | "customer" | "admin" | null;
  name: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  whatsapp?: string;
  phone?: string;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role and additional info from Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: data.role as any,
              name: data.name || firebaseUser.displayName || "User",
              profileImage: data.profileImage,
              bio: data.bio,
              location: data.location,
              whatsapp: data.whatsapp,
              phone: data.phone,
              isVerified: data.isVerified || false,
              verificationStatus: data.verificationStatus || 'unverified',
            });
          } else {
            // Document might not exist yet if they just signed up
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: null,
              name: firebaseUser.displayName || "New User",
            });
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: null, name: "User" });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
