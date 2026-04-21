import './loadEnv.js';
import admin from 'firebase-admin';

const requiredEnv = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];

const hasInlineCredentials = requiredEnv.every((key) => Boolean(process.env[key]));

const getCredential = () => {
  if (hasInlineCredentials) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
  }

  return admin.credential.applicationDefault();
};

const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: getCredential()
    });

export const db = admin.firestore(app);
