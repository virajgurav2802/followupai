import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { FollowUp, FollowUpStatus, Lead, AIActionLog } from '../types';

export const followUpService = {
  async getFollowUps(userId: string): Promise<FollowUp[]> {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'followUps'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as FollowUp);
    } catch (error) {
      console.error('Error fetching followUps:', error);
      throw new Error('Unable to load follow-ups. Please try again.');
    }
  },

  async createFollowUp(followUp: FollowUp): Promise<void> {
    await setDoc(doc(db, 'followUps', followUp.id), followUp);
  },

  async updateFollowUpStatus(followUpId: string, status: FollowUpStatus): Promise<void> {
    const nowIso = new Date().toISOString();
    await updateDoc(doc(db, 'followUps', followUpId), {
      status,
      updatedAt: nowIso,
    });
  },

  async completeFollowUp(followUpId: string, leadId: string, userId: string): Promise<void> {
    if (!followUpId || !userId) {
      throw new Error('Unable to update follow-up. Your existing data has not been removed.');
    }
    const nowIso = new Date().toISOString();
    try {
      // 1. Fetch and verify follow-up record in Firestore
      const followUpRef = doc(db, 'followUps', followUpId);
      const followUpSnap = await getDoc(followUpRef);
      if (!followUpSnap.exists()) {
        throw new Error('Follow-up not found.');
      }
      const followUpData = followUpSnap.data() as FollowUp;
      if (followUpData.userId !== userId) {
        throw new Error('Unauthorized follow-up update.');
      }

      // Check if already completed
      if (followUpData.status === 'Completed') {
        return;
      }

      // 2. Verify critical approval gating
      let isApproved = followUpData.isApproved === true && followUpData.messageApprovalStatus === 'approved';
      let leadData: Lead | null = null;
      let leadRef: any = null;

      if (leadId) {
        leadRef = doc(db, 'leads', leadId);
        const leadSnap = await getDoc(leadRef);
        if (leadSnap.exists()) {
          leadData = leadSnap.data() as Lead;
          if (leadData.userId === userId) {
            if (leadData.approvalStatus === 'approved' && (leadData.isApproved === true || leadData.draftMessage?.isApproved === true)) {
              isApproved = true;
            }
          }
        }
      }

      // Critical rule: Gating prevents completion if message is Draft or Edited
      if (!isApproved) {
        throw new Error('Review & Approve the message before marking the follow-up complete.');
      }

      // 3. Mark follow-up as Completed in Firestore
      let prospectName = followUpData.prospectName || 'Prospect';
      let company = followUpData.company || 'Company';

      await updateDoc(followUpRef, {
        status: 'Completed' as FollowUpStatus,
        updatedAt: nowIso,
      });

      // 4. Update related lead if leadId is present
      if (leadData && leadRef) {
        prospectName = leadData.name || prospectName;
        company = leadData.company || company;
        const updatedTimeline = [
          ...(leadData.timeline || []),
          {
            id: `t-${Date.now()}-complete`,
            date: 'Today',
            title: 'Follow-up completed',
            description: 'Salesperson marked follow-up touchpoint as completed.',
            type: 'completed' as const,
          },
        ];
        await updateDoc(leadRef, {
          followUpStatus: 'Completed' as FollowUpStatus,
          timeline: updatedTimeline,
          updatedAt: nowIso,
        });
      }

      // 5. Log action in aiActions collection
      const actionId = `action-${followUpId}-complete-${Date.now()}`;
      const actionRecord: AIActionLog = {
        id: actionId,
        leadId,
        userId,
        leadName: prospectName,
        company,
        actionType: 'follow_up_completed',
        title: 'Follow-up completed',
        details: `Follow-up touchpoint marked as completed for ${prospectName} at ${company}.`,
        status: 'Completed',
        timestamp: 'Just now',
        createdAt: nowIso,
      };
      await setDoc(doc(db, 'aiActions', actionId), actionRecord);
    } catch (err: any) {
      console.error('Error completing follow-up:', err);
      if (err.message && err.message.includes('Review & Approve')) {
        throw err;
      }
      throw new Error('Unable to update follow-up. Your existing data has not been removed.');
    }
  },

  async syncFollowUpApproval(
    followUpId: string,
    isApproved: boolean,
    messageApprovalStatus: 'draft' | 'edited' | 'approved'
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    try {
      const followUpRef = doc(db, 'followUps', followUpId);
      const snap = await getDoc(followUpRef);
      if (snap.exists()) {
        await updateDoc(followUpRef, {
          isApproved,
          messageApprovalStatus,
          updatedAt: nowIso,
        });
      }
    } catch (err) {
      console.warn(`Failed to sync follow-up ${followUpId} approval:`, err);
    }
  },

  async deleteFollowUp(followUpId: string): Promise<void> {
    await deleteDoc(doc(db, 'followUps', followUpId));
  },
};
