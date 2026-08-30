import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { authService } from '../services/authService';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string, role?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const profile = await authService.getUserProfile(uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: authedUser, profile } = await authService.signIn(email, password);
    setUser(authedUser);
    setUserProfile(profile);
  };

  const signUp = async (email: string, password: string, displayName: string, role?: string) => {
    const { user: createdUser, profile } = await authService.signUp(email, password, displayName, role);
    setUser(createdUser);
    setUserProfile(profile);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (displayName: string, role?: string) => {
    if (!user) throw new Error('User not authenticated.');
    const updated = await authService.updateUserProfile(user.uid, { displayName, role });
    setUserProfile(updated);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
