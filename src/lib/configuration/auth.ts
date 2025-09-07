import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { type FireBaseType } from '@/src/lib/types/firebase';

const firebaseAuthConfig: FireBaseType = {
  apiKey: process.env.NEXT_PUBLIC_AUTH_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_FIREBASE_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_AUTH_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_AUTH_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_AUTH_FIREBASE_APP_ID,
  projectId: process.env.NEXT_PUBLIC_AUTH_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseAuthConfig);
export const auth = getAuth(app);
