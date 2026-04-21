// Configuracion preparada para conectar Firebase.
// Si no completas estas variables, la app sigue funcionando en modo demo local.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

export const isFirebaseConfigured = requiredKeys.every((key) => Boolean(firebaseConfig[key]));
export const workspaceId = import.meta.env.VITE_FIREBASE_WORKSPACE_ID || 'default';
export const isSharedWorkspaceEnabled = isFirebaseConfigured && Boolean(workspaceId);

const app = isFirebaseConfigured
  ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const workspaceDocRef = db ? doc(db, 'agrobalanceWorkspaces', workspaceId) : null;
