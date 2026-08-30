export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type FollowUpStatus = 'Pending' | 'Due Today' | 'Upcoming' | 'Overdue' | 'Completed';

export type AnalysisStatus = 'completed' | 'pending' | 'failed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id?: string;
  leadId?: string;
  userId?: string;
  intent: string;
  interestLevel: 'High' | 'Medium' | 'Low';
  followUpRequired: boolean;
  priority: Priority;
  reason: string;
  suggestedFollowUpDate: string;
  recommendedAction?: string;
  buyingSignals?: string[];
  objections?: string[];
  painPoints?: string[];
  dealStage?: string;
  urgency?: 'High' | 'Medium' | 'Low';
  decisionFactors?: string[];
  createdAt?: string;
  analysisStatus?: AnalysisStatus;
}

export interface AIRecommendation {
  action: string;
  reason: string;
  suggestedDate: string;
}

export interface PersonalizedMessage {
  to: string;
  subject: string;
  message: string;
  isApproved: boolean;
  status?: 'draft' | 'edited' | 'approved';
  approvedAt?: string;
}

export interface ActivityEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: 'lead_created' | 'analyzed' | 'priority_detected' | 'followup_recommended' | 'message_generated' | 'message_edited' | 'approved' | 'saved' | 'completed';
}

export interface Lead {
  id: string;
  userId?: string;
  name: string;
  company: string;
  email: string;
  stage: string;
  intent: string;
  interestLevel: 'High' | 'Medium' | 'Low';
  priority: Priority;
  followUpRequired: boolean;
  followUpStatus: FollowUpStatus;
  followUpDueDate: string;
  lastContact: string;
  createdAt: string;
  updatedAt?: string;
  originalConversation: string;
  dealStage?: string;
  urgency?: 'High' | 'Medium' | 'Low';
  approvalStatus?: 'draft' | 'edited' | 'approved';
  isApproved?: boolean;
  approvedAt?: string;
  analysisStatus?: AnalysisStatus;
  aiAnalysis?: AIAnalysis;
  recommendedAction?: AIRecommendation;
  draftMessage?: PersonalizedMessage;
  timeline: ActivityEvent[];
}

export interface FollowUp {
  id: string;
  leadId: string;
  userId: string;
  prospectName: string;
  company: string;
  reason: string;
  recommendedAction: string;
  priority: Priority;
  status: FollowUpStatus;
  dueDate: string;
  dealStage?: string;
  interestLevel?: 'High' | 'Medium' | 'Low';
  isApproved?: boolean;
  messageApprovalStatus?: 'draft' | 'edited' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface AIActionLog {
  id: string;
  leadId?: string;
  userId?: string;
  leadName: string;
  company: string;
  actionType?: string;
  title: string;
  details: string;
  status: 'Completed' | 'Awaiting Approval' | 'Recommended' | 'Executed';
  timestamp: string;
  createdAt?: string;
}

export interface AIAnalysisRequest {
  conversation: string;
  prospectName: string;
  company: string;
  email?: string;
}

export interface StructuredAIResponse {
  intent: string;
  interestLevel: 'High' | 'Medium' | 'Low';
  followUpRequired: boolean;
  priority: Priority;
  reason: string;
  suggestedFollowUpDate: string;
  recommendedAction: string;
  buyingSignals: string[];
  objections: string[];
  painPoints: string[];
  dealStage: string;
  urgency: 'High' | 'Medium' | 'Low';
  decisionFactors: string[];
  draftMessage: {
    to: string;
    subject: string;
    message: string;
  };
}

export interface RegenerateMessageRequest {
  prospectName: string;
  company: string;
  email?: string;
  conversation: string;
  intent?: string;
  recommendedAction?: string;
  existingMessage?: string;
}

export interface RegenerateMessageResponse {
  draftMessage: {
    to: string;
    subject: string;
    message: string;
  };
}
