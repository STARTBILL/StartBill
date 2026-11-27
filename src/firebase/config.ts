/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

// Configure log level to avoid false-positive offline timeout warnings in browser
try {
  setLogLevel('error');
} catch {
  // Ignore if already set
}

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

// Configure local persistence so sessions persist reliably across page loads and redirects
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Persistence set notice:', err);
  });
}

const firestoreDbId = appletConfig.firestoreDatabaseId || 'ai-studio-startbillcanada-524eafad-0649-45be-b2ab-addae2c302f0';
let firestoreInstance;

try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  }, firestoreDbId);
} catch {
  firestoreInstance = getFirestore(app, firestoreDbId);
}

export const db = firestoreInstance;
export const storage = getStorage(app);

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({ 
  prompt: 'select_account'
});

export default app;
