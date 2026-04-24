import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

const mapAuthError = (error) => {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ese email ya está registrado.';
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con Firebase. Revisa tu conexión.';
    default:
      return error?.message || 'No se pudo completar la autenticación.';
  }
};

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(auth));
  const isAuthEnabled = Boolean(auth);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    authUser,
    authLoading,
    isAuthEnabled,
    async signIn(email, password) {
      if (!auth) throw new Error('Firebase Auth no está configurado.');
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    async signUp({ name, email, password }) {
      if (!auth) throw new Error('Firebase Auth no está configurado.');
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(credential.user, { displayName: name });
        }
        return credential;
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    async signOutUser() {
      if (!auth) return;
      await signOut(auth);
    },
    async resetPassword(email) {
      if (!auth) throw new Error('Firebase Auth no está configurado.');
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    }
  }), [authLoading, authUser, isAuthEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
