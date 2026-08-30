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
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Lead, AIAnalysis, AIActionLog } from '../types';

export const leadService = {
  /**
   * Preserved for compatibility: delegates directly to the active Stage 3 agentService workflow.
   * Never executes mock AI.
   */
  async createLead(
    leadInput: {
      name: string;
      company: string;
      email: string;
      conversation: string;
    },
    _userId?: string
  ): Promise<Lead> {
    const { agentService } = await import('./agentService');
    return agentService.processNewLead(leadInput);
  },

  async saveLeadDoc(lead: Lead): Promise<void> {
    if (!lead.id || !lead.userId) {
      throw new Error('Lead must have valid id and userId.');
    }
    await setDoc(doc(db, 'leads', lead.id), lead);
  },

  async saveAIAnalysisDoc(analysis: AIAnalysis): Promise<void> {
    if (!analysis.id || !analysis.userId) {
      throw new Error('AI Analysis must have valid id and userId.');
    }
    await setDoc(doc(db, 'aiAnalyses', analysis.id), analysis);
  },

  async getLeads(userId: string): Promise<Lead[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, 'leads'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => docSnap.data() as Lead);
    } catch (error) {
      console.error('Error fetching leads from Firestore:', error);
      // Fallback query without orderBy if index is still propagating
      try {
        const qSimple = query(collection(db, 'leads'), where('userId', '==', userId));
        const snapshot = await getDocs(qSimple);
        const leads = snapshot.docs.map((docSnap) => docSnap.data() as Lead);
        return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (_innerError) {
        throw new Error('Unable to load your leads. Please try again.');
      }
    }
  },

  async getLead(leadId: string, userId: string): Promise<Lead | null> {
    if (!leadId || !userId) return null;
    try {
      const docRef = doc(db, 'leads', leadId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;

      const lead = docSnap.data() as Lead;
      // Strict ownership check
      if (lead.userId !== userId) {
        console.warn(`Unauthorized lead access attempt: User ${userId} requested lead owned by ${lead.userId}`);
        return null;
      }
      return lead;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error('Unable to load lead details.');
    }
  },

  async saveEditedMessage(leadId: string, userId: string, messageBody: string): Promise<Lead> {
    const lead = await this.getLead(leadId, userId);
    if (!lead) throw new Error('Lead not found or unauthorized.');

    const nowIso = new Date().toISOString();
    const updatedDraftMessage = {
      ...(lead.draftMessage || {
        to: `${lead.name} <${lead.email}>`,
        subject: `Follow-up regarding ${lead.company}`,
      }),
      message: messageBody,
      isApproved: false,
      status: 'edited' as const,
    };

    const updatedTimeline = [
      ...(lead.timeline || []),
      {
        id: `t-${Date.now()}-edit`,
        date: 'Today',
        title: 'Message edited',
        description: 'Salesperson manually edited the follow-up message.',
        type: 'message_edited' as const,
      },
    ];

    const leadUpdates: Partial<Lead> = {
      approvalStatus: 'edited',
      isApproved: false,
      draftMessage: updatedDraftMessage,
      timeline: updatedTimeline,
      updatedAt: nowIso,
    };

    // 1. Update lead in Firestore
    await updateDoc(doc(db, 'leads', leadId), leadUpdates);

    // 2. Synchronize related follow-up record
    const followUpId = `followup-${leadId}`;
    try {
      const followUpRef = doc(db, 'followUps', followUpId);
      const snap = await getDoc(followUpRef);
      if (snap.exists()) {
        await updateDoc(followUpRef, {
          isApproved: false,
          messageApprovalStatus: 'edited',
          updatedAt: nowIso,
        });
      }
    } catch (fErr) {
      console.warn('Could not sync follow-up approval status:', fErr);
    }

    // 3. Log 'message_edited' action in 'aiActions'
    const actionId = `action-${Date.now()}-edit`;
    const actionRecord: AIActionLog = {
      id: actionId,
      leadId,
      userId,
      leadName: lead.name,
      company: lead.company,
      actionType: 'message_edited',
      title: 'Follow-up message edited',
      details: `Draft message edited by salesperson for ${lead.name} at ${lead.company}. Pending human review and approval.`,
      status: 'Awaiting Approval',
      timestamp: 'Just now',
      createdAt: nowIso,
    };
    await setDoc(doc(db, 'aiActions', actionId), actionRecord);

    return {
      ...lead,
      ...leadUpdates,
    };
  },

  async approveFollowUp(leadId: string, userId: string, messageBody: string): Promise<Lead> {
    const lead = await this.getLead(leadId, userId);
    if (!lead) throw new Error('Lead not found or unauthorized.');

    const nowIso = new Date().toISOString();
    const updatedDraftMessage = {
      ...(lead.draftMessage || {
        to: `${lead.name} <${lead.email}>`,
        subject: `Follow-up regarding ${lead.company}`,
      }),
      message: messageBody,
      isApproved: true,
      status: 'approved' as const,
      approvedAt: nowIso,
    };

    const updatedTimeline = [
      ...(lead.timeline || []),
      {
        id: `t-${Date.now()}-approve`,
        date: 'Today',
        title: 'Follow-up approved',
        description: 'Salesperson reviewed and explicitly approved the follow-up message.',
        type: 'approved' as const,
      },
    ];

    const leadUpdates: Partial<Lead> = {
      approvalStatus: 'approved',
      isApproved: true,
      approvedAt: nowIso,
      draftMessage: updatedDraftMessage,
      timeline: updatedTimeline,
      updatedAt: nowIso,
    };

    // 1. Update lead in Firestore
    await updateDoc(doc(db, 'leads', leadId), leadUpdates);

    // 2. Synchronize related follow-up record
    const followUpId = `followup-${leadId}`;
    try {
      const followUpRef = doc(db, 'followUps', followUpId);
      const snap = await getDoc(followUpRef);
      if (snap.exists()) {
        await updateDoc(followUpRef, {
          isApproved: true,
          messageApprovalStatus: 'approved',
          updatedAt: nowIso,
        });
      }
    } catch (fErr) {
      console.warn('Could not sync follow-up approval status:', fErr);
    }

    // 3. Log 'follow_up_approved' action in 'aiActions'
    const actionId = `action-${Date.now()}-approve`;
    const actionRecord: AIActionLog = {
      id: actionId,
      leadId,
      userId,
      leadName: lead.name,
      company: lead.company,
      actionType: 'follow_up_approved',
      title: 'Follow-up approved',
      details: `Follow-up approved by the salesperson and saved successfully for ${lead.name} at ${lead.company}. Ready for communication.`,
      status: 'Completed',
      timestamp: 'Just now',
      createdAt: nowIso,
    };
    await setDoc(doc(db, 'aiActions', actionId), actionRecord);

    return {
      ...lead,
      ...leadUpdates,
    };
  },

  async saveRegeneratedMessage(
    leadId: string,
    userId: string,
    newMessage: { to: string; subject: string; message: string }
  ): Promise<Lead> {
    const lead = await this.getLead(leadId, userId);
    if (!lead) throw new Error('Lead not found or unauthorized.');

    const nowIso = new Date().toISOString();
    const updatedDraftMessage = {
      ...newMessage,
      isApproved: false,
      status: 'draft' as const,
    };

    const updatedTimeline = [
      ...(lead.timeline || []),
      {
        id: `t-${Date.now()}-regen`,
        date: 'Today',
        title: 'New message generated',
        description: 'Alternative follow-up draft generated with real Gemini sales intelligence.',
        type: 'message_generated' as const,
      },
    ];

    const leadUpdates: Partial<Lead> = {
      approvalStatus: 'draft',
      isApproved: false,
      draftMessage: updatedDraftMessage,
      timeline: updatedTimeline,
      updatedAt: nowIso,
    };

    // 1. Update lead in Firestore
    await updateDoc(doc(db, 'leads', leadId), leadUpdates);

    // 2. Synchronize related follow-up record
    const followUpId = `followup-${leadId}`;
    try {
      const followUpRef = doc(db, 'followUps', followUpId);
      const snap = await getDoc(followUpRef);
      if (snap.exists()) {
        await updateDoc(followUpRef, {
          isApproved: false,
          messageApprovalStatus: 'draft',
          updatedAt: nowIso,
        });
      }
    } catch (fErr) {
      console.warn('Could not sync follow-up approval status:', fErr);
    }

    // 3. Log 'message_regenerated' action in 'aiActions'
    const actionId = `action-${Date.now()}-regen`;
    const actionRecord: AIActionLog = {
      id: actionId,
      leadId,
      userId,
      leadName: lead.name,
      company: lead.company,
      actionType: 'message_regenerated',
      title: 'New message generated',
      details: `Gemini regenerated follow-up message for ${lead.name} at ${lead.company}. Pending human review and approval.`,
      status: 'Awaiting Approval',
      timestamp: 'Just now',
      createdAt: nowIso,
    };
    await setDoc(doc(db, 'aiActions', actionId), actionRecord);

    return {
      ...lead,
      ...leadUpdates,
    };
  },

  /**
   * Alias preserved for backward compatibility
   */
  async updateLeadApproval(leadId: string, userId: string, messageBody: string): Promise<Lead> {
    return this.approveFollowUp(leadId, userId, messageBody);
  },

  async deleteLead(leadId: string, userId: string): Promise<void> {
    const lead = await this.getLead(leadId, userId);
    if (!lead) throw new Error('Lead not found or unauthorized.');
    await deleteDoc(doc(db, 'leads', leadId));
  },
};
