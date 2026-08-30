import type { AIAnalysis, AIRecommendation, PersonalizedMessage, Priority } from '../types';

export interface AIAnalysisResult {
  analysis: AIAnalysis;
  recommendedAction: AIRecommendation;
  draftMessage: PersonalizedMessage;
}

/**
 * MockAIService:
 * Pure mock AI abstraction for Stage 2 data flow demonstration.
 * In Stage 3, this service will be cleanly swapped with realAIService
 * connecting to the backend intelligence endpoint without altering UI components.
 */
export const mockAIService = {
  async analyzeConversation(
    conversation: string,
    prospectName: string,
    company: string,
    email?: string
  ): Promise<AIAnalysisResult> {
    // Artificial 600ms processing simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lower = (conversation || '').toLowerCase();
    const isPricing = lower.includes('pricing') || lower.includes('cost') || lower.includes('tier') || lower.includes('quote');
    const isLegal = lower.includes('contract') || lower.includes('msa') || lower.includes('dpa') || lower.includes('legal') || lower.includes('terms');
    const isTechnical = lower.includes('api') || lower.includes('security') || lower.includes('hipaa') || lower.includes('saml') || lower.includes('sso');
    const isUrgent = lower.includes('today') || lower.includes('urgent') || lower.includes('deadline') || lower.includes('thursday') || lower.includes('friday') || lower.includes('asap');

    let priority: Priority = 'MEDIUM';
    if (isUrgent || isPricing || isLegal) {
      priority = 'HIGH';
    } else if (lower.includes('exploratory') || lower.includes('general info') || lower.includes('q1 2027')) {
      priority = 'LOW';
    }

    let intent = 'Commercial Inquiries & Pricing';
    if (isLegal) intent = 'Contract & Legal Terms Sign-off';
    else if (isTechnical) intent = 'Technical & Compliance Verification';
    else if (priority === 'LOW') intent = 'General Product Evaluation';

    const followUpRequired = priority !== 'LOW';

    const firstName = prospectName.split(' ')[0] || prospectName;

    const analysis: AIAnalysis = {
      intent,
      interestLevel: priority === 'HIGH' ? 'High' : priority === 'MEDIUM' ? 'Medium' : 'Low',
      followUpRequired,
      priority,
      reason: isPricing
        ? `The prospect requested custom tier pricing and highlighted active timeline constraints for ${company}.`
        : isLegal
        ? `Legal redlines and contract terms raised for ${company}; response needed to unblock signing.`
        : isTechnical
        ? `Technical architecture and compliance details requested for ${company} evaluation.`
        : `Sales conversation notes analyzed for ${company}; follow-up scheduled to maintain momentum.`,
      suggestedFollowUpDate: isUrgent ? 'Today' : 'Within 3 business days',
    };

    const recommendedAction: AIRecommendation = {
      action: isPricing
        ? 'Send pricing follow-up and schedule review'
        : isLegal
        ? 'Send revised redline agreement and schedule legal sync'
        : isTechnical
        ? 'Share technical documentation and security compliance pack'
        : 'Send product capabilities overview',
      reason: isPricing
        ? 'Prospect showed strong purchase intent with an active decision window. Providing commercials prevents competitive slippage.'
        : isLegal
        ? 'Overdue legal reviews risk pushout of deal close dates.'
        : 'Proactive follow-up demonstrates technical partnership and accelerates evaluation.',
      suggestedDate: isUrgent ? 'Today' : 'Within 3 days',
    };

    const recipient = email ? `${prospectName} <${email}>` : prospectName;

    const draftMessage: PersonalizedMessage = {
      to: recipient,
      subject: isPricing
        ? `Tailored Enterprise Pricing & Rollout Roadmap — ${company}`
        : isLegal
        ? `Updated Terms & Clean Agreement Redline — ${company}`
        : `Technical Specifications & Documentation — ${company}`,
      message: `Hi ${firstName},\n\nFollowing up on our recent discussion regarding ${company}'s requirements.\n\nI've outlined the details we discussed and have prepared the tailored materials for your team. Would you have 10 minutes this afternoon or tomorrow morning for a brief sync?\n\nBest regards,\nAlex Carter`,
      isApproved: false,
    };

    return {
      analysis,
      recommendedAction,
      draftMessage,
    };
  },
};
