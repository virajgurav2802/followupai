import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Lead, FollowUp, AIActionLog } from '../types';

/**
 * Demo Seed Helper:
 * Per Stage 2 rules: Newly registered users start with clean empty states.
 * This helper is provided ONLY for explicit development/testing action
 * to populate sample leads under the tester's own authenticated UID.
 */
export const demoSeedService = {
  async seedDemoDataForUser(userId: string): Promise<void> {
    if (!userId) throw new Error('User ID required for demo seed.');

    const nowIso = new Date().toISOString();

    const sampleLeads: Lead[] = [
      {
        id: `lead-demo-1-${userId.slice(0, 5)}`,
        userId,
        name: 'Rahul Mehta',
        company: 'Acme Corporation',
        email: 'rahul.mehta@acme.corp',
        stage: 'Proposal Under Review',
        intent: 'Pricing Inquiry',
        interestLevel: 'High',
        priority: 'HIGH',
        followUpRequired: true,
        followUpStatus: 'Due Today',
        followUpDueDate: 'Today, 10:30 AM',
        lastContact: 'Aug 26, 2026',
        createdAt: nowIso,
        updatedAt: nowIso,
        originalConversation: `Rahul Mehta [Aug 26, 3:45 PM]:
Hi team, thanks for walking us through the enterprise demo yesterday. We reviewed the deck with our VP of Sales.
Could you share the custom tier breakdown for 120 seats? Also, if we finalize our procurement cycle by next Thursday, what onboarding lead time should we expect? We're evaluating one other platform this week as well, so timing is key.

Sales Rep [Aug 26, 4:10 PM]:
Hi Rahul, glad to hear! I'll compile the custom seat tier breakdown and standard 2-week implementation timeline for you right away.`,
        approvalStatus: 'draft',
        dealStage: 'Pricing Evaluation',
        urgency: 'High',
        aiAnalysis: {
          id: `analysis-demo-1`,
          leadId: `lead-demo-1-${userId.slice(0, 5)}`,
          userId,
          intent: 'Pricing Inquiry & Timeline Confirmation',
          interestLevel: 'High',
          followUpRequired: true,
          priority: 'HIGH',
          reason: 'The prospect requested custom tier pricing for 120 seats, highlighted a tight procurement deadline next Thursday, and indicated an active competitive bake-off.',
          suggestedFollowUpDate: 'Today',
          dealStage: 'Pricing Evaluation',
          urgency: 'High',
          buyingSignals: [
            'Evaluating custom tier breakdown for 120 seats',
            'Final procurement milestone scheduled for next Thursday',
            'VP of Sales actively engaged in evaluation',
          ],
          painPoints: [
            'Evaluating competitor platform in active bake-off',
            'Requires strict 2-week deployment lead time guarantee',
          ],
          objections: [
            'Needs competitive volume discount for >100 seats',
            'Requires assurance on onboarding timeline SLA',
          ],
          decisionFactors: [
            'Volume tier pricing competitiveness',
            'Onboarding turnaround speed',
            'Dedicated deployment engineer support',
          ],
          createdAt: nowIso,
        },
        recommendedAction: {
          action: 'Send pricing follow-up',
          reason: 'The prospect has shown strong purchase intent with an imminent procurement deadline. Providing the tier breakdown now prevents competitive slippage.',
          suggestedDate: 'Today',
        },
        draftMessage: {
          to: 'Rahul Mehta <rahul.mehta@acme.corp>',
          subject: 'Custom 120-Seat Tier Breakdown & Onboarding Schedule — Acme Corp',
          message: `Hi Rahul,\n\nFollowing up on our conversation regarding Acme's 120-seat rollout.\n\nI've outlined our tailored enterprise pricing options along with the accelerated onboarding roadmap to support your Thursday procurement milestone. With our dedicated deployment engineer, we can guarantee full kickoff within 10 business days.\n\nWould you have 10 minutes this afternoon at 2:00 PM or tomorrow morning at 10:30 AM to walk through these tier options before your internal leadership sync?\n\nBest regards,\nAlex Carter`,
          isApproved: false,
          status: 'draft',
        },
        timeline: [
          { id: 't1', date: 'Aug 24, 2026', title: 'Lead created', type: 'lead_created' },
          { id: 't2', date: 'Aug 26, 2026', title: 'Conversation analyzed', type: 'analyzed' },
          { id: 't3', date: 'Aug 26, 2026', title: 'High priority detected', type: 'priority_detected' },
          { id: 't4', date: 'Aug 27, 2026', title: 'Follow-up recommended', type: 'followup_recommended' },
          { id: 't5', date: 'Aug 29, 2026', title: 'Message awaiting approval', type: 'message_generated' },
        ],
      },
      {
        id: `lead-demo-2-${userId.slice(0, 5)}`,
        userId,
        name: 'Sarah Jenkins',
        company: 'CloudScale Technologies',
        email: 'sjenkins@cloudscale.io',
        stage: 'Contract Review',
        dealStage: 'Contract Review',
        intent: 'Legal Terms Sign-off',
        interestLevel: 'High',
        urgency: 'High',
        priority: 'HIGH',
        followUpRequired: true,
        followUpStatus: 'Due Today',
        followUpDueDate: 'Today, 2:00 PM',
        lastContact: 'Aug 25, 2026',
        createdAt: nowIso,
        updatedAt: nowIso,
        originalConversation: `Sarah Jenkins [Aug 25, 11:15 AM]:
We received the MSA and DPA. Our in-house counsel raised two minor points on Section 8 regarding data retention upon termination. If we get the redline updated by Wednesday, we should be ready to sign before end of month.`,
        approvalStatus: 'approved',
        isApproved: true,
        approvedAt: nowIso,
        aiAnalysis: {
          id: `analysis-demo-2`,
          leadId: `lead-demo-2-${userId.slice(0, 5)}`,
          userId,
          intent: 'Contract Review & Security Compliance',
          interestLevel: 'High',
          followUpRequired: true,
          priority: 'HIGH',
          reason: 'Legal redlines received with an end-of-month signature target. Immediate turnaround required to close within current billing cycle.',
          suggestedFollowUpDate: 'Today',
          dealStage: 'Contract Review',
          urgency: 'High',
          buyingSignals: [
            'MSA and DPA under active legal review',
            'In-house counsel review completed with minor redlines',
            'Ready to sign before end of month if redline updated',
          ],
          painPoints: [
            'Section 8 post-termination data retention clarity needed',
          ],
          objections: [
            'Standard contract clause clarification requested',
          ],
          decisionFactors: [
            'Fast turnaround on counsel redlines',
            'SOC2 and data protection compliance',
          ],
          createdAt: nowIso,
        },
        recommendedAction: {
          action: 'Send revised DPA & schedule legal sync',
          reason: 'Overdue contract review risking end-of-month target. Prompt response on Section 8 resolves blocker.',
          suggestedDate: 'Today',
        },
        draftMessage: {
          to: 'Sarah Jenkins <sjenkins@cloudscale.io>',
          subject: 'Revised MSA & DPA Section 8 Redline — CloudScale Technologies',
          message: `Hi Sarah,\n\nOur legal team reviewed Section 8 regarding the post-termination data retention window and incorporated your counsel's preferred standard language.\n\nAttached is the updated clean agreement ready for signature.\n\nBest regards,\nAlex Carter`,
          isApproved: true,
          status: 'approved',
          approvedAt: nowIso,
        },
        timeline: [
          { id: 't1', date: 'Aug 20, 2026', title: 'Lead created', type: 'lead_created' },
          { id: 't2', date: 'Aug 25, 2026', title: 'AI analysis completed', type: 'analyzed' },
          { id: 't3', date: 'Aug 25, 2026', title: 'High priority detected', type: 'priority_detected' },
          { id: 't4', date: 'Aug 28, 2026', title: 'Follow-up approved', type: 'approved' },
        ],
      },
      {
        id: `lead-demo-3-${userId.slice(0, 5)}`,
        userId,
        name: 'Elena Rostova',
        company: 'Apex Global Logistics',
        email: 'e.rostova@apexlogistics.com',
        stage: 'Closed Won',
        dealStage: 'Closed Won',
        intent: 'Enterprise Expansion',
        interestLevel: 'High',
        urgency: 'Medium',
        priority: 'MEDIUM',
        followUpRequired: false,
        followUpStatus: 'Completed',
        followUpDueDate: 'Completed',
        lastContact: 'Aug 28, 2026',
        createdAt: nowIso,
        updatedAt: nowIso,
        originalConversation: `Elena Rostova [Aug 28, 10:00 AM]:
All signed on our side! Thanks for accommodating our security team's questions. Looking forward to the onboarding call next week.`,
        approvalStatus: 'approved',
        isApproved: true,
        approvedAt: nowIso,
        aiAnalysis: {
          id: `analysis-demo-3`,
          leadId: `lead-demo-3-${userId.slice(0, 5)}`,
          userId,
          intent: 'Enterprise Expansion & Kickoff',
          interestLevel: 'High',
          followUpRequired: false,
          priority: 'MEDIUM',
          reason: 'Contract executed and onboarding scheduled. Milestone completed successfully.',
          suggestedFollowUpDate: 'Completed',
          dealStage: 'Closed Won',
          urgency: 'Medium',
          buyingSignals: ['Agreement fully executed', 'Onboarding scheduled'],
          painPoints: [],
          objections: [],
          decisionFactors: ['Security compliance verified'],
          createdAt: nowIso,
        },
        recommendedAction: {
          action: 'Send onboarding welcome pack',
          reason: 'Agreement signed. Introduce customer success onboarding engineer.',
          suggestedDate: 'Completed',
        },
        draftMessage: {
          to: 'Elena Rostova <e.rostova@apexlogistics.com>',
          subject: 'Welcome to FollowUpAI — Onboarding Kickoff Details',
          message: `Hi Elena,\n\nWelcome aboard! We are thrilled to partner with Apex Global Logistics.\n\nAttached is your kickoff packet and direct invite for next week's onboarding session.\n\nBest,\nAlex Carter`,
          isApproved: true,
          status: 'approved',
          approvedAt: nowIso,
        },
        timeline: [
          { id: 't1', date: 'Aug 22, 2026', title: 'Lead created', type: 'lead_created' },
          { id: 't2', date: 'Aug 24, 2026', title: 'AI analysis completed', type: 'analyzed' },
          { id: 't3', date: 'Aug 27, 2026', title: 'Follow-up approved', type: 'approved' },
          { id: 't4', date: 'Aug 28, 2026', title: 'Follow-up completed', type: 'completed' },
        ],
      },
    ];

    for (const lead of sampleLeads) {
      await setDoc(doc(db, 'leads', lead.id), lead);

      if (lead.aiAnalysis) {
        await setDoc(doc(db, 'aiAnalyses', lead.aiAnalysis.id!), lead.aiAnalysis);
      }

      const followUpId = `followup-${lead.id}`;
      const followUpRecord: FollowUp = {
        id: followUpId,
        leadId: lead.id,
        userId,
        prospectName: lead.name,
        company: lead.company,
        reason: lead.aiAnalysis?.reason || '',
        recommendedAction: lead.recommendedAction?.action || '',
        priority: lead.priority,
        status: lead.followUpStatus,
        dueDate: lead.followUpDueDate,
        dealStage: lead.dealStage || lead.stage || 'Proposal',
        interestLevel: lead.interestLevel || 'High',
        isApproved: lead.isApproved || false,
        messageApprovalStatus: lead.approvalStatus || 'draft',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await setDoc(doc(db, 'followUps', followUpId), followUpRecord);

      // Seed audit action records
      const auditRecords: AIActionLog[] = [
        {
          id: `action-${lead.id}-created`,
          leadId: lead.id,
          userId,
          leadName: lead.name,
          company: lead.company,
          actionType: 'lead_created',
          title: 'Lead created',
          details: `Created prospect account for ${lead.name} at ${lead.company}.`,
          status: 'Completed',
          timestamp: 'Aug 26',
          createdAt: nowIso,
        },
        {
          id: `action-${lead.id}-analyzed`,
          leadId: lead.id,
          userId,
          leadName: lead.name,
          company: lead.company,
          actionType: 'lead_analyzed',
          title: 'Lead analyzed',
          details: `Analyzed sales conversation; deal stage: ${lead.dealStage || 'Discovery'}; priority: ${lead.priority}.`,
          status: 'Completed',
          timestamp: 'Aug 26',
          createdAt: nowIso,
        },
        {
          id: `action-${lead.id}-priority`,
          leadId: lead.id,
          userId,
          leadName: lead.name,
          company: lead.company,
          actionType: 'priority_detected',
          title: `${lead.priority} priority detected`,
          details: `Classified as ${lead.priority} priority based on ${lead.interestLevel} buyer interest.`,
          status: 'Completed',
          timestamp: 'Aug 26',
          createdAt: nowIso,
        },
      ];

      if (lead.recommendedAction) {
        auditRecords.push({
          id: `action-${lead.id}-rec`,
          leadId: lead.id,
          userId,
          leadName: lead.name,
          company: lead.company,
          actionType: 'followup_recommended',
          title: 'Follow-up recommended',
          details: `Recommended action: "${lead.recommendedAction.action}". Target: ${lead.recommendedAction.suggestedDate}.`,
          status: 'Completed',
          timestamp: 'Aug 26',
          createdAt: nowIso,
        });
      }

      if (lead.approvalStatus === 'approved') {
        auditRecords.push({
          id: `action-${lead.id}-appr`,
          leadId: lead.id,
          userId,
          leadName: lead.name,
          company: lead.company,
          actionType: 'follow_up_approved',
          title: 'Follow-up approved',
          details: `Personalized follow-up message explicitly approved for ${lead.name}.`,
          status: 'Completed',
          timestamp: 'Aug 28',
          createdAt: nowIso,
        });
      }

      if (lead.followUpStatus === 'Completed') {
        auditRecords.push({
          id: `action-${lead.id}-comp`,
          leadId: lead.id,
          userId,
          leadName: lead.name,
          company: lead.company,
          actionType: 'follow_up_completed',
          title: 'Follow-up completed',
          details: `Follow-up communication successfully performed and logged for ${lead.name}.`,
          status: 'Completed',
          timestamp: 'Aug 28',
          createdAt: nowIso,
        });
      }

      for (const act of auditRecords) {
        await setDoc(doc(db, 'aiActions', act.id), act);
      }
    }
  },
};
