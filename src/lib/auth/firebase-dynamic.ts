/**
 * Firebase Dynamic Loading
 *
 * Phase 4: Bundle optimization through dynamic Firebase imports
 * Reduces initial bundle size by loading Firebase modules on demand
 */

import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';

// Dynamic Firebase imports with loading states
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;

// Initialize Firebase app dynamically
export async function initializeFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  // Check if Firebase credentials are available
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn('Firebase credentials not configured - skipping initialization');
    return null;
  }

  try {
    const { initializeApp } = await import('firebase/app');

    firebaseApp = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });

    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase app:', error);
    // Return null instead of throwing to allow build to continue
    return null;
  }
}

// Get Firebase Auth dynamically
export async function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;

  try {
    const [{ getAuth }, app] = await Promise.all([import('firebase/auth'), initializeFirebaseApp()]);

    if (!app) {
      console.warn('Firebase app not initialized - auth unavailable');
      return null;
    }

    firebaseAuth = getAuth(app);
    return firebaseAuth;
  } catch (error) {
    console.error('Failed to get Firebase auth:', error);
    return null;
  }
}

// Get Firestore dynamically
export async function getFirebaseFirestore() {
  if (firebaseFirestore) return firebaseFirestore;

  try {
    const [{ getFirestore }, app] = await Promise.all([import('firebase/firestore'), initializeFirebaseApp()]);

    if (!app) {
      console.warn('Firebase app not initialized - Firestore unavailable');
      return null;
    }

    firebaseFirestore = getFirestore(app);
    return firebaseFirestore;
  } catch (error) {
    console.error('Failed to get Firebase firestore:', error);
    return null;
  }
}

// Dynamic auth methods
export async function signInWithEmailAndPasswordDynamic(email: string, password: string) {
  const [{ signInWithEmailAndPassword }, auth] = await Promise.all([import('firebase/auth'), getFirebaseAuth()]);

  if (!auth) {
    throw new Error('Firebase Auth not available - check configuration');
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutDynamic() {
  const [{ signOut }, auth] = await Promise.all([import('firebase/auth'), getFirebaseAuth()]);

  if (!auth) {
    throw new Error('Firebase Auth not available - check configuration');
  }

  return signOut(auth);
}

export async function createUserWithEmailAndPasswordDynamic(email: string, password: string) {
  const [{ createUserWithEmailAndPassword }, auth] = await Promise.all([import('firebase/auth'), getFirebaseAuth()]);

  if (!auth) {
    throw new Error('Firebase Auth not available - check configuration');
  }

  return createUserWithEmailAndPassword(auth, email, password);
}

export async function sendPasswordResetEmailDynamic(email: string) {
  const [{ sendPasswordResetEmail }, auth] = await Promise.all([import('firebase/auth'), getFirebaseAuth()]);

  if (!auth) {
    throw new Error('Firebase Auth not available - check configuration');
  }

  return sendPasswordResetEmail(auth, email);
}

// Dynamic Firestore methods
export async function getDocDynamic(path: string) {
  const [{ doc, getDoc }, firestore] = await Promise.all([import('firebase/firestore'), getFirebaseFirestore()]);

  if (!firestore) {
    throw new Error('Firebase Firestore not available - check configuration');
  }

  const docRef = doc(firestore, path);
  return getDoc(docRef);
}

export async function setDocDynamic(path: string, data: object) {
  const [{ doc, setDoc }, firestore] = await Promise.all([import('firebase/firestore'), getFirebaseFirestore()]);

  if (!firestore) {
    throw new Error('Firebase Firestore not available - check configuration');
  }

  const docRef = doc(firestore, path);
  return setDoc(docRef, data);
}

export async function updateDocDynamic(path: string, data: object) {
  const [{ doc, updateDoc }, firestore] = await Promise.all([import('firebase/firestore'), getFirebaseFirestore()]);

  if (!firestore) {
    throw new Error('Firebase Firestore not available - check configuration');
  }

  const docRef = doc(firestore, path);
  return updateDoc(docRef, data);
}

export async function deleteDocDynamic(path: string) {
  const [{ doc, deleteDoc }, firestore] = await Promise.all([import('firebase/firestore'), getFirebaseFirestore()]);

  if (!firestore) {
    throw new Error('Firebase Firestore not available - check configuration');
  }

  const docRef = doc(firestore, path);
  return deleteDoc(docRef);
}

// Dynamic collection queries
export async function getCollectionDynamic(path: string) {
  const [{ collection, getDocs }, firestore] = await Promise.all([
    import('firebase/firestore'),
    getFirebaseFirestore(),
  ]);

  if (!firestore) {
    throw new Error('Firebase Firestore not available - check configuration');
  }

  const collectionRef = collection(firestore, path);
  return getDocs(collectionRef);
}

export async function queryCollectionDynamic(path: string, queryConstraints: unknown[]) {
  const [{ collection, query, getDocs }, firestore] = await Promise.all([
    import('firebase/firestore'),
    getFirebaseFirestore(),
  ]);

  if (!firestore) {
    throw new Error('Firebase Firestore not available - check configuration');
  }

  const collectionRef = collection(firestore, path);

  // Apply query constraints dynamically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = collectionRef;
  for (const constraint of queryConstraints) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    q = query(q, constraint as any);
  }

  return getDocs(q);
}

// Utility function to check if Firebase is initialized
export function isFirebaseInitialized() {
  return firebaseApp !== null;
}

// Cleanup function
export function cleanupFirebase() {
  firebaseApp = null;
  firebaseAuth = null;
  firebaseFirestore = null;
}
