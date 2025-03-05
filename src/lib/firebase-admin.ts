import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';

const firebaseConfig: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

// サーバー側で利用するfirebaseのsdk
export const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(firebaseConfig),
    })
  : getApp();