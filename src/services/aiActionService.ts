import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AIActionLog } from '../types';

export const aiActionService = {
  async getAIActions(userId: string): Promise<AIActionLog[]> {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'aiActions'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const actions = snapshot.docs.map((d) => d.data() as AIActionLog);
      return actions.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } catch (error) {
      console.error('Error fetching aiActions:', error);
      return [];
    }
  },

  async createAIAction(action: AIActionLog): Promise<void> {
    await setDoc(doc(db, 'aiActions', action.id), action);
  },
};
