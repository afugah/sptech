import '@/src/lib/configuration/auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';
import { isVoyadoMember } from '@/src/lib/framework/Voyado/shared/isVoyadoMember';

// Check if Firebase Admin credentials are available
const hasFirebaseAdminCreds =
  process.env.AUTH_FIREBASE_PROJECT_ID &&
  process.env.AUTH_FIREBASE_CLIENT_EMAIL &&
  process.env.AUTH_FIREBASE_PRIVATE_KEY;

if (hasFirebaseAdminCreds && !getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
        clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || undefined,
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export const dbAdmin = hasFirebaseAdminCreds ? getFirestore() : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  ...(hasFirebaseAdminCreds
    ? {
        adapter: FirestoreAdapter({
          credential: cert({
            projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
            clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || undefined,
          }),
        }),
      }
    : {}),
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const email = credentials.email;
        const password = credentials.password;

        if (typeof email !== 'string' || typeof password !== 'string') {
          throw new Error('Invalid credentials type');
        }

        try {
          const firebaseAuth = getAuth();

          const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
          const user = userCredential.user;

          if (user) {
            return {
              id: user.uid,
              email: user.email,
              name: user.displayName || 'User',
            };
          }
        } catch (error) {
          console.error('Error in Firebase Authentication:', error);
          throw new Error('Failed to sign in with Firebase');
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }

      return token;
    },

    async signIn({ user }) {
      try {
        if (!user.email) throw new Error('No email provided');

        const voyadoService = di.resolve(VoyadoService);
        const contact = await voyadoService.getContactByEmail(user.email);

        if (!isVoyadoMember(contact)) {
          return false;
        }

        return !!contact;
      } catch (error) {
        console.error('Failed to validate user:', error);
        return false;
      }
    },

    async session({ session, token }) {
      session.user.id = token.sub || 'F';
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
});
