/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

// In AI Studio sandbox environments, VITE_FIREBASE_* environment variables may contain
// internal API gateway proxy tokens (prefixed with "AQ.") rather than real Google API keys.
// Real Firebase API keys start with "AIza". We validate to strictly avoid passing proxy tokens to the Firebase client SDK.
const isRealApiKey = (key?: unknown): boolean =>
  typeof key === 'string' && key.startsWith('AIza') && key.length > 30;

const isRealValue = (val?: unknown): boolean =>
  typeof val === 'string' && val.length > 0 && !val.startsWith('AQ.');

export const firebaseConfig = {
  apiKey: isRealApiKey(import.meta.env?.VITE_FIREBASE_API_KEY)
    ? (import.meta.env.VITE_FIREBASE_API_KEY as string)
    : appletConfig.apiKey,
  authDomain: isRealValue(import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN)
    ? (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string)
    : appletConfig.authDomain,
  projectId: isRealValue(import.meta.env?.VITE_FIREBASE_PROJECT_ID)
    ? (import.meta.env.VITE_FIREBASE_PROJECT_ID as string)
    : appletConfig.projectId,
  storageBucket: isRealValue(import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET)
    ? (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string)
    : appletConfig.storageBucket,
  messagingSenderId: isRealValue(import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID)
    ? (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string)
    : appletConfig.messagingSenderId,
  appId: isRealValue(import.meta.env?.VITE_FIREBASE_APP_ID)
    ? (import.meta.env.VITE_FIREBASE_APP_ID as string)
    : appletConfig.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, appletConfig.firestoreDatabaseId || 'ai-studio-startbillcanada-524eafad-0649-45be-b2ab-addae2c302f0');
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
