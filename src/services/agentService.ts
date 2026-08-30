import { leadService } from './leadService';
import { followUpService } from './followUpService';
import { aiActionService } from './aiActionService';
import { aiService } from './aiService';
import { auth } from './firebase';
import type {
  Lead,
  AIAnalysis,
  FollowUp,
  AIActionLog,
  StructuredAIResponse,
} from '../types';

export interface ProcessLeadParams {
  name: string;
  company: string;
  email: string;
  conversation: string;
  onProgress?: (status: string) => void;
}

/**
 * AgentService:
 * Controlled agentic workflow engine for sales intelligence.
 * The AI recommends decisions; the application executes controlled database operations.
 */
export const agentService = {
  /**
   * Complete Add Lead Workflow:
   * 1. Persist lead base safely in Firestore first (failure-safe).
   * 2. Call AI service with real-time UI status updates.
   * 3. On success: store analysis, follow-up, and action logs.
   * 4. On failure: preserve lead with analysisStatus: 'failed', provide retry.
   */
  async processNewLead(params: ProcessLeadParams): Promise<Lead> {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be signed in to add leads.');

    const nowIso = new Date().toISOString();
    const todayStr = 'Today';
    const leadId = `lead-${Date.now()}`;

    params.onProgress?.('Saving lead to pipeline...');

    // 1. Failure-Safe Lead Base (Persisted in Firestore before AI processing)
    const initialLead: Lead = {
      id: leadId,
      userId: user.uid,
      name: params.name,
      company: params.company,
      email: params.email,
      stage: 'Prospect',
      intent: 'Analysis Pending',
      interestLevel: 'Medium',
      priority: 'MEDIUM',
      followUpRequired: false,
      followUpStatus: 'Pending',
      followUpDueDate: 'Pending AI Analysis',
      lastContact: todayStr,
      createdAt: nowIso,
      updatedAt: nowIso,
      originalConversation: params.conversation,
      approvalStatus: 'draft',
      analysisStatus: 'pending',
      timeline: [
        { id: `t-${Date.now()}-1`, date: todayStr, title: 'Lead created', type: 'lead_created' },
      ],
    };

    // Save lead safely first
    await leadService.saveLeadDoc(initialLead);

    // Audit log: Lead created
    const createdActionLog: AIActionLog = {
      id: `action-${leadId}-created`,
      leadId,
      userId: user.uid,
      leadName: params.name,
      company: params.company,
      actionType: 'lead_created',
      title: 'Lead created',
      details: `Created prospect record for ${params.name} at ${params.company}.`,
      status: 'Completed',
      timestamp: 'Just now',
      createdAt: nowIso,
    };
    await aiActionService.createAIAction(createdActionLog);

    // 2. Call AI Service with sequential progress indicators
    let aiResponse: StructuredAIResponse | null = null;

    try {
      params.onProgress?.('Analyzing conversation with sales intelligence...');
      
      aiResponse = await aiService.analyzeConversation({
        conversation: params.conversation,
        prospectName: params.name,
        company: params.company,
        email: params.email,
      });

      params.onProgress?.('Extracting buying signals & priority...');
      // Brief pause to allow salesperson to register cognitive transition
      await new Promise((r) => setTimeout(r, 200));

      params.onProgress?.('Determining next best action...');
      await new Promise((r) => setTimeout(r, 200));

      params.onProgress?.('Generating personalized follow-up...');
    } catch (aiError: any) {
      console.warn('[Agent Service] AI analysis failed, maintaining failure-safe lead record:', aiError.message);
      
      // Update lead to failed status without losing user's conversation
      const failedLead: Lead = {
        ...initialLead,
        analysisStatus: 'failed',
        timeline: [
          ...initialLead.timeline,
          {
            id: `t-${Date.now()}-err`,
            date: todayStr,
            title: 'AI analysis pending retry',
            description: 'AI processing temporarily unavailable; retry anytime.',
            type: 'analyzed',
          },
        ],
      };
      await leadService.saveLeadDoc(failedLead);

      // Log failure in aiActions
      const actionLog: AIActionLog = {
        id: `action-${leadId}-fail`,
        leadId,
        userId: user.uid,
        leadName: params.name,
        company: params.company,
        actionType: 'analysis_deferred',
        title: 'AI analysis deferred',
        details: 'Sales context safely stored. Analysis pending retry.',
        status: 'Recommended',
        timestamp: 'Just now',
        createdAt: nowIso,
      };
      await aiActionService.createAIAction(actionLog);

      throw new Error(`AI analysis is currently unavailable. Your lead was saved safely. (${aiError.message})`);
    }

    // 3. Application Execution of Controlled Operations upon AI Success
    return this.applyAIResultsToLead(initialLead, aiResponse, user.uid);
  },

  /**
   * Retries AI analysis for an existing lead whose analysis was pending or failed.
   */
  async retryLeadAnalysis(lead: Lead): Promise<Lead> {
    const user = auth.currentUser;
    if (!user || user.uid !== lead.userId) {
      throw new Error('Unauthorized lead retry.');
    }

    const aiResponse = await aiService.analyzeConversation({
      conversation: lead.originalConversation,
      prospectName: lead.name,
      company: lead.company,
      email: lead.email,
    });

    return this.applyAIResultsToLead(lead, aiResponse, user.uid);
  },

  /**
   * Helper executing controlled application database updates with validated AI data.
   */
  async applyAIResultsToLead(
    baseLead: Lead,
    ai: StructuredAIResponse,
    userId: string
  ): Promise<Lead> {
    const nowIso = new Date().toISOString();
    const todayStr = 'Today';
    const leadId = baseLead.id;

    const followUpStatus = ai.followUpRequired
      ? ai.priority === 'HIGH'
        ? 'Due Today'
        : 'Upcoming'
      : 'Pending';

    // Construct structured analysis record
    const analysisId = `analysis-${leadId}`;
    const analysisRecord: AIAnalysis = {
      id: analysisId,
      leadId,
      userId,
      intent: ai.intent,
      interestLevel: ai.interestLevel,
      followUpRequired: ai.followUpRequired,
      priority: ai.priority,
      reason: ai.reason,
      suggestedFollowUpDate: ai.suggestedFollowUpDate,
      recommendedAction: ai.recommendedAction,
      buyingSignals: ai.buyingSignals,
      objections: ai.objections,
      painPoints: ai.painPoints,
      dealStage: ai.dealStage,
      urgency: ai.urgency,
      decisionFactors: ai.decisionFactors,
      createdAt: nowIso,
      analysisStatus: 'completed',
    };

    // Controlled Tool 1: Store AI Analysis in Firestore
    await leadService.saveAIAnalysisDoc(analysisRecord);

    // Controlled Tool 2: If follow-up required, create follow-up record in Firestore
    if (ai.followUpRequired) {
      const followUpId = `followup-${leadId}`;
      const followUpRecord: FollowUp = {
        id: followUpId,
        leadId,
        userId,
        prospectName: baseLead.name,
        company: baseLead.company,
        reason: ai.reason,
        recommendedAction: ai.recommendedAction,
        priority: ai.priority,
        status: followUpStatus,
        dueDate: ai.suggestedFollowUpDate,
        dealStage: ai.dealStage || 'Discovery',
        interestLevel: ai.interestLevel || 'Medium',
        isApproved: false,
        messageApprovalStatus: 'draft',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await followUpService.createFollowUp(followUpRecord);
    }

    // Controlled Tool 3: Log factual AI events in aiActions audit trail
    // 1. Lead analyzed
    const analysisActionLog: AIActionLog = {
      id: `action-${leadId}-analysis`,
      leadId,
      userId,
      leadName: baseLead.name,
      company: baseLead.company,
      actionType: 'lead_analyzed',
      title: 'Lead analyzed',
      details: `Analyzed sales notes for ${baseLead.name}; intent: ${ai.intent}; deal stage: ${ai.dealStage || 'Discovery'}.`,
      status: 'Completed',
      timestamp: 'Just now',
      createdAt: nowIso,
    };
    await aiActionService.createAIAction(analysisActionLog);

    // 2. Priority detected
    const priorityActionLog: AIActionLog = {
      id: `action-${leadId}-priority`,
      leadId,
      userId,
      leadName: baseLead.name,
      company: baseLead.company,
      actionType: 'priority_detected',
      title: `${ai.priority} priority detected`,
      details: `Classified as ${ai.priority} priority based on ${ai.interestLevel} interest level and ${ai.urgency || 'standard'} urgency.`,
      status: 'Completed',
      timestamp: 'Just now',
      createdAt: nowIso,
    };
    await aiActionService.createAIAction(priorityActionLog);

    // 3. Follow-up recommended
    if (ai.followUpRequired) {
      const followUpActionLog: AIActionLog = {
        id: `action-${leadId}-followup`,
        leadId,
        userId,
        leadName: baseLead.name,
        company: baseLead.company,
        actionType: 'followup_recommended',
        title: 'Follow-up recommended',
        details: `Recommended action: "${ai.recommendedAction}". Target window: ${ai.suggestedFollowUpDate}.`,
        status: 'Completed',
        timestamp: 'Just now',
        createdAt: nowIso,
      };
      await aiActionService.createAIAction(followUpActionLog);
    }

    // 4. Message generated
    if (ai.draftMessage?.message) {
      const messageActionLog: AIActionLog = {
        id: `action-${leadId}-message`,
        leadId,
        userId,
        leadName: baseLead.name,
        company: baseLead.company,
        actionType: 'message_generated',
        title: 'Follow-up message generated',
        details: `Generated personalized draft: "${ai.draftMessage.subject}". Awaiting salesperson review and approval.`,
        status: 'Awaiting Approval',
        timestamp: 'Just now',
        createdAt: nowIso,
      };
      await aiActionService.createAIAction(messageActionLog);
    }

    // Controlled Tool 4: Update Lead document with full intelligence
    const updatedTimeline = [
      ...baseLead.timeline,
      { id: `t-${Date.now()}-2`, date: todayStr, title: 'AI analysis completed', type: 'analyzed' as const },
      { id: `t-${Date.now()}-3`, date: todayStr, title: `${ai.priority} priority detected`, type: 'priority_detected' as const },
      { id: `t-${Date.now()}-4`, date: todayStr, title: 'Follow-up recommended', type: 'followup_recommended' as const },
      { id: `t-${Date.now()}-5`, date: todayStr, title: 'Message awaiting approval', type: 'message_generated' as const },
    ];

    const completedLead: Lead = {
      ...baseLead,
      stage: ai.dealStage || 'AI Analyzed',
      intent: ai.intent,
      interestLevel: ai.interestLevel,
      priority: ai.priority,
      followUpRequired: ai.followUpRequired,
      followUpStatus,
      followUpDueDate: ai.suggestedFollowUpDate,
      analysisStatus: 'completed',
      approvalStatus: 'draft',
      isApproved: false,
      aiAnalysis: analysisRecord,
      recommendedAction: {
        action: ai.recommendedAction,
        reason: ai.reason,
        suggestedDate: ai.suggestedFollowUpDate,
      },
      draftMessage: {
        to: ai.draftMessage.to,
        subject: ai.draftMessage.subject,
        message: ai.draftMessage.message,
        isApproved: false,
        status: 'draft',
      },
      timeline: updatedTimeline,
      updatedAt: nowIso,
    };

    await leadService.saveLeadDoc(completedLead);
    return completedLead;
  },
};
