import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile } from '../types';

export const authService = {
  async signUp(email: string, password: string, displayName: string, role = 'Sales Representative') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateFirebaseProfile(user, { displayName });

      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || email.split('@')[0],
        role: role || 'Sales Representative',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', user.uid), profile);
      return { user, profile };
    } catch (error: any) {
      throw new Error(this.formatErrorMessage(error));
    }
  },

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profile = await this.getUserProfile(user.uid);
      if (!profile) {
        const now = new Date().toISOString();
        profile = {
          uid: user.uid,
          email: user.email || email,
          displayName: user.displayName || email.split('@')[0],
          role: 'Sales Representative',
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'users', user.uid), profile);
      }

      return { user, profile };
    } catch (error: any) {
      throw new Error(this.formatErrorMessage(error));
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Unable to sign out. Please try again.');
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async updateUserProfile(uid: string, data: { displayName: string; role?: string }): Promise<UserProfile> {
    try {
      const now = new Date().toISOString();
      const updateData: Partial<UserProfile> = {
        displayName: data.displayName,
        updatedAt: now,
      };
      if (data.role) {
        updateData.role = data.role;
      }

      await updateDoc(doc(db, 'users', uid), updateData);

      if (auth.currentUser && auth.currentUser.uid === uid) {
        await updateFirebaseProfile(auth.currentUser, { displayName: data.displayName });
      }

      const updated = await this.getUserProfile(uid);
      if (!updated) throw new Error('Profile update verification failed.');
      return updated;
    } catch (error: any) {
      throw new Error('Unable to update your profile. Please try again.');
    }
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  formatErrorMessage(error: any): string {
    const code = error?.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Sign-in failed. Please check your email and password.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please provide a valid work email address.';
      case 'auth/too-many-requests':
        return 'Access to this account has been temporarily disabled due to many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return error?.message || 'Authentication failed. Please verify your credentials.';
    }
  },
};
