import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'artist' | 'customer';
  phone: string;
  whatsapp: string;
}

export async function signUpWithEmail({ email, password, name, role, phone, whatsapp }: SignUpData) {
  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create associated user profile in Firestore with all fields
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    role,
    phone,
    whatsapp,
    isVerified: false,
    verificationStatus: 'unverified' as const,
    createdAt: new Date().toISOString()
  });

  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
