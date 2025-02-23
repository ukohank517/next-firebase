import { getApps, initializeApp, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import serviceAccount from './yoake-stg.service-accountkey.json';

console.log('Firebase Admin Config:', {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  // Note: Not logging private key for security reasons
});

export const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
    })
  : getApps()[0];