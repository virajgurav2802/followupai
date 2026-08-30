import type { Lead, AIActionLog } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
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
    createdAt: 'Aug 24, 2026',
    originalConversation: `Rahul Mehta [Aug 26, 3:45 PM]:
Hi team, thanks for walking us through the enterprise demo yesterday. We reviewed the deck with our VP of Sales.
Could you share the custom tier breakdown for 120 seats? Also, if we finalize our procurement cycle by next Thursday, what onboarding lead time should we expect? We're evaluating one other platform this week as well, so timing is key.

Sales Rep [Aug 26, 4:10 PM]:
Hi Rahul, glad to hear! I'll compile the custom seat tier breakdown and standard 2-week implementation timeline for you right away.`,
    aiAnalysis: {
      intent: 'Pricing Inquiry & Timeline Confirmation',
      interestLevel: 'High',
      followUpRequired: true,
      priority: 'HIGH',
      reason: 'The prospect requested custom tier pricing for 120 seats, highlighted a tight procurement deadline next Thursday, and indicated an active competitive bake-off.',
      suggestedFollowUpDate: 'Aug 29, 2026',
    },
    recommendedAction: {
      action: 'Send pricing follow-up',
      reason: 'The prospect has shown strong purchase intent with an imminent procurement deadline. Providing the tier breakdown now prevents competitive slippage.',
      suggestedDate: 'Aug 29, 2026',
    },
    draftMessage: {
      to: 'Rahul Mehta <rahul.mehta@acme.corp>',
      subject: 'Custom 120-Seat Tier Breakdown & Onboarding Schedule — Acme Corp',
      message: `Hi Rahul,

Following up on our conversation regarding Acme's 120-seat rollout. 

I've outlined our tailored enterprise pricing options along with the accelerated onboarding roadmap to support your Thursday procurement milestone. With our dedicated deployment engineer, we can guarantee full kickoff within 10 business days.

Would you have 10 minutes this afternoon at 2:00 PM or tomorrow morning at 10:30 AM to walk through these tier options before your internal leadership sync?

Best regards,
Alex Carter`,
      isApproved: false,
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
    id: 'lead-2',
    name: 'Sarah Jenkins',
    company: 'CloudScale Technologies',
    email: 'sjenkins@cloudscale.io',
    stage: 'Contract Review',
    intent: 'Legal Terms Sign-off',
    interestLevel: 'High',
    priority: 'HIGH',
    followUpRequired: true,
    followUpStatus: 'Overdue',
    followUpDueDate: 'Yesterday, 4:00 PM',
    lastContact: 'Aug 25, 2026',
    createdAt: 'Aug 20, 2026',
    originalConversation: `Sarah Jenkins [Aug 25, 11:15 AM]:
We received the MSA and DPA. Our in-house counsel raised two minor points on Section 8 regarding data retention upon termination. If we get the redline updated by Wednesday, we should be ready to sign before end of month.`,
    aiAnalysis: {
      intent: 'Contract Review & Security Compliance',
      interestLevel: 'High',
      followUpRequired: true,
      priority: 'HIGH',
      reason: 'Legal redlines received with an end-of-month signature target. Immediate turnaround required to close within current billing cycle.',
      suggestedFollowUpDate: 'Aug 28, 2026',
    },
    recommendedAction: {
      action: 'Send revised DPA & schedule legal sync',
      reason: 'Overdue contract review risking end-of-month target. Prompt response on Section 8 resolves blocker.',
      suggestedDate: 'Aug 28, 2026',
    },
    draftMessage: {
      to: 'Sarah Jenkins <sjenkins@cloudscale.io>',
      subject: 'Revised MSA & DPA Section 8 Redline — CloudScale Technologies',
      message: `Hi Sarah,

Our legal team reviewed Section 8 regarding the post-termination data retention window and incorporated your counsel's preferred standard language. 

Attached is the updated clean agreement ready for signature. Let me know if you need our lead counsel on a quick 5-minute call today to clear any remaining questions.

Best regards,
Alex Carter`,
      isApproved: true,
      approvedAt: 'Aug 28, 2026',
    },
    timeline: [
      { id: 't1', date: 'Aug 20, 2026', title: 'Lead created', type: 'lead_created' },
      { id: 't2', date: 'Aug 25, 2026', title: 'AI analysis completed', type: 'analyzed' },
      { id: 't3', date: 'Aug 25, 2026', title: 'High priority detected', type: 'priority_detected' },
      { id: 't4', date: 'Aug 28, 2026', title: 'Follow-up became overdue', type: 'followup_recommended' },
    ],
  },
  {
    id: 'lead-3',
    name: 'David Chen',
    company: 'Horizon Health',
    email: 'dchen@horizonhealth.org',
    stage: 'Discovery Completed',
    intent: 'Technical Evaluation',
    interestLevel: 'Medium',
    priority: 'MEDIUM',
    followUpRequired: true,
    followUpStatus: 'Due Today',
    followUpDueDate: 'Today, 2:15 PM',
    lastContact: 'Aug 27, 2026',
    createdAt: 'Aug 25, 2026',
    originalConversation: `David Chen [Aug 27, 10:00 AM]:
Thanks for the architecture overview. Our security team wants to verify HIPAA compliance certification and SSO SAML 2.0 documentation before we schedule the pilot trial.`,
    aiAnalysis: {
      intent: 'Technical & Compliance Verification',
      interestLevel: 'Medium',
      followUpRequired: true,
      priority: 'MEDIUM',
      reason: 'Prospect needs HIPAA compliance validation and SSO technical documentation prior to greenlighting pilot.',
      suggestedFollowUpDate: 'Aug 29, 2026',
    },
    recommendedAction: {
      action: 'Share SOC2/HIPAA package and SAML setup guide',
      reason: 'Providing compliance documentation unlocks pilot trial phase.',
      suggestedDate: 'Aug 29, 2026',
    },
    draftMessage: {
      to: 'David Chen <dchen@horizonhealth.org>',
      subject: 'HIPAA Attestation & SAML 2.0 Configuration Guide — Horizon Health',
      message: `Hi David,

Following our architecture discussion, I have gathered our third-party HIPAA audit report and our Okta/SAML 2.0 configuration guide for your security team.

Please find the secured documentation link attached. Once your team gives the preliminary nod, we can enable your sandbox environment within an hour.

Best regards,
Alex Carter`,
      isApproved: false,
    },
    timeline: [
      { id: 't1', date: 'Aug 25, 2026', title: 'Lead created', type: 'lead_created' },
      { id: 't2', date: 'Aug 27, 2026', title: 'Security inquiry analyzed', type: 'analyzed' },
      { id: 't3', date: 'Aug 27, 2026', title: 'Follow-up scheduled for today', type: 'followup_recommended' },
    ],
  },
  {
    id: 'lead-4',
    name: 'Elena Rostova',
    company: 'Summit Logistics',
    email: 'elena@summitlogistics.eu',
    stage: 'Initial Contact',
    intent: 'General Information',
    interestLevel: 'Low',
    priority: 'LOW',
    followUpRequired: false,
    followUpStatus: 'Upcoming',
    followUpDueDate: 'Sep 05, 2026',
    lastContact: 'Aug 28, 2026',
    createdAt: 'Aug 28, 2026',
    originalConversation: `Elena Rostova [Aug 28, 9:20 AM]:
We are currently under an existing agreement with another provider through Q1 2027. We are just exploring what newer platforms offer. Feel free to send a whitepaper or case study.`,
    aiAnalysis: {
      intent: 'Exploratory Research',
      interestLevel: 'Low',
      followUpRequired: false,
      priority: 'LOW',
      reason: 'Prospect is locked into an incumbent contract until Q1 2027. No immediate budget or intent to switch.',
      suggestedFollowUpDate: 'Sep 05, 2026',
    },
    recommendedAction: {
      action: 'Send industry whitepaper and add to quarterly nurture cycle',
      reason: 'No immediate purchase intent; maintain warm touchpoint without sales pressure.',
      suggestedDate: 'Sep 05, 2026',
    },
    draftMessage: {
      to: 'Elena Rostova <elena@summitlogistics.eu>',
      subject: 'Global Logistics Follow-Up Automation Case Study',
      message: `Hi Elena,

Thank you for your interest. As you explore options ahead of your Q1 planning, here is our recent case study on how logistics leaders automated their workflow efficiencies.

I will keep in touch periodically and reconnect when your vendor review window approaches.

Best regards,
Alex Carter`,
      isApproved: false,
    },
    timeline: [
      { id: 't1', date: 'Aug 28, 2026', title: 'Lead created', type: 'lead_created' },
      { id: 't2', date: 'Aug 28, 2026', title: 'Low priority detected', type: 'priority_detected' },
    ],
  },
  {
    id: 'lead-5',
    name: 'Marcus Vance',
    company: 'Apex Financial',
    email: 'mvance@apexfin.com',
    stage: 'Executive Review',
    intent: 'Pricing Inquiry',
    interestLevel: 'High',
    priority: 'HIGH',
    followUpRequired: true,
    followUpStatus: 'Overdue',
    followUpDueDate: 'Aug 27, 2026',
    lastContact: 'Aug 23, 2026',
    createdAt: 'Aug 21, 2026',
    originalConversation: `Marcus Vance [Aug 23, 2:30 PM]:
The executive committee liked the demo. We have budget allocated for Q3 rollout if we can finalize the multi-entity license terms before the end of this month. Can we see the customized multi-entity terms?`,
    aiAnalysis: {
      intent: 'Multi-entity Licensing Inquiry',
      interestLevel: 'High',
      followUpRequired: true,
      priority: 'HIGH',
      reason: 'Allocated Q3 budget with explicit executive backing. Prospect requested multi-entity license proposal 6 days ago with no record of response.',
      suggestedFollowUpDate: 'Aug 27, 2026',
    },
    recommendedAction: {
      action: 'Send multi-entity pricing and request executive call',
      reason: 'Pricing follow-up missed. Urgent intervention needed to capture allocated Q3 budget.',
      suggestedDate: 'Aug 27, 2026',
    },
    draftMessage: {
      to: 'Marcus Vance <mvance@apexfin.com>',
      subject: 'Multi-Entity Licensing Options & Q3 Deployment — Apex Financial',
      message: `Hi Marcus,

I wanted to follow up with our multi-entity licensing schedule tailored specifically for Apex Financial's business units.

Given your committee's Q3 rollout target, I'd welcome the chance to answer any questions directly with your procurement team this week.

Best regards,
Alex Carter`,
      isApproved: false,
    },
    timeline: [
      { id: 't1', date: 'Aug 21, 2026', title: 'Lead created', type: 'lead_created' },
      { id: 't2', date: 'Aug 23, 2026', title: 'High priority detected', type: 'priority_detected' },
      { id: 't3', date: 'Aug 27, 2026', title: 'Follow-up overdue', type: 'followup_recommended' },
    ],
  },
  {
    id: 'lead-6',
    name: 'Priya Patel',
    company: 'Quantum Dynamics',
    email: 'ppatel@quantumdyn.com',
    stage: 'Solution Demo',
    intent: 'Feature Clarification',
    interestLevel: 'Medium',
    priority: 'MEDIUM',
    followUpRequired: true,
    followUpStatus: 'Upcoming',
    followUpDueDate: 'Aug 31, 2026',
    lastContact: 'Aug 28, 2026',
    createdAt: 'Aug 27, 2026',
    originalConversation: `Priya Patel [Aug 28, 4:00 PM]:
Great session today. We're testing the webhook payload structure. Our engineering lead will be back from leave on Monday and we'll compare findings.`,
    aiAnalysis: {
      intent: 'Technical Integration Verification',
      interestLevel: 'Medium',
      followUpRequired: true,
      priority: 'MEDIUM',
      reason: 'Prospect awaiting internal engineering review on Monday regarding webhook payloads.',
      suggestedFollowUpDate: 'Aug 31, 2026',
    },
    recommendedAction: {
      action: 'Check in on engineering review and offer developer office hours',
      reason: 'Keeps momentum active post-engineering review on Monday.',
      suggestedDate: 'Aug 31, 2026',
    },
    draftMessage: {
      to: 'Priya Patel <ppatel@quantumdyn.com>',
      subject: 'Developer Resources & Engineering Review — Quantum Dynamics',
      message: `Hi Priya,

Hope you had a great weekend! Following up on your engineering review today regarding the webhook payloads.

If your technical lead has any questions during their review, our solutions architects are happy to jump on a brief session.

Best regards,
Alex Carter`,
      isApproved: false,
    },
    timeline: [
      { id: 't1', date: 'Aug 27, 2026', title: 'Lead created', type: 'lead_created' },
      { id: 't2', date: 'Aug 28, 2026', title: 'Conversation analyzed', type: 'analyzed' },
    ],
  },
];

export const INITIAL_AI_ACTIONS: AIActionLog[] = [
  {
    id: 'act-1',
    timestamp: 'Today, 9:15 AM',
    title: 'Lead analysis completed',
    leadId: 'lead-1',
    leadName: 'Rahul Mehta',
    company: 'Acme Corporation',
    status: 'Completed',
    details: 'Identified Pricing Inquiry with high buying intent; flagged 120-seat custom tier request.',
  },
  {
    id: 'act-2',
    timestamp: 'Today, 9:16 AM',
    title: 'High priority identified',
    leadId: 'lead-1',
    leadName: 'Rahul Mehta',
    company: 'Acme Corporation',
    status: 'Completed',
    details: 'Priority elevated to HIGH due to competitive evaluation and procurement deadline next Thursday.',
  },
  {
    id: 'act-3',
    timestamp: 'Today, 9:16 AM',
    title: 'Follow-up recommendation generated',
    leadId: 'lead-1',
    leadName: 'Rahul Mehta',
    company: 'Acme Corporation',
    status: 'Recommended',
    details: 'Recommended action: Send pricing follow-up within 3 days.',
  },
  {
    id: 'act-4',
    timestamp: 'Today, 9:17 AM',
    title: 'Personalized message generated',
    leadId: 'lead-1',
    leadName: 'Rahul Mehta',
    company: 'Acme Corporation',
    status: 'Awaiting Approval',
    details: 'Drafted tailored pricing breakdown proposal; awaiting salesperson human approval before dispatch.',
  },
  {
    id: 'act-5',
    timestamp: 'Yesterday, 4:30 PM',
    title: 'Follow-up flagged as overdue',
    leadId: 'lead-2',
    leadName: 'Sarah Jenkins',
    company: 'CloudScale Technologies',
    status: 'Executed',
    details: 'Action scheduled for Aug 28 was not logged as completed. Escalated in Attention Queue.',
  },
  {
    id: 'act-6',
    timestamp: 'Aug 27, 11:00 AM',
    title: 'Lead analysis completed',
    leadId: 'lead-3',
    leadName: 'David Chen',
    company: 'Horizon Health',
    status: 'Completed',
    details: 'Detected HIPAA and SSO SAML documentation requirement.',
  },
  {
    id: 'act-7',
    timestamp: 'Aug 27, 11:02 AM',
    title: 'Follow-up recommendation generated',
    leadId: 'lead-3',
    leadName: 'David Chen',
    company: 'Horizon Health',
    status: 'Recommended',
    details: 'Recommended sharing security documentation package.',
  },
];

// Local state container for mock interaction during frontend prototype
let leadsStore = [...INITIAL_LEADS];
let actionsStore = [...INITIAL_AI_ACTIONS];

export function getMockLeads(): Lead[] {
  return [...leadsStore];
}

export function getMockLeadById(id: string): Lead | undefined {
  return leadsStore.find((l) => l.id === id);
}

export function addMockLead(newLead: Partial<Lead> & { name: string; company: string; email: string; originalConversation: string }): Lead {
  const id = `lead-${Date.now()}`;
  const nowStr = 'Aug 29, 2026';
  
  // Intelligent mock detection based on input content
  const lowerConvo = (newLead.originalConversation || '').toLowerCase();
  const isHighIntent = lowerConvo.includes('pricing') || lowerConvo.includes('cost') || lowerConvo.includes('contract') || lowerConvo.includes('sign') || lowerConvo.includes('proposal');
  const isUrgent = lowerConvo.includes('today') || lowerConvo.includes('urgent') || lowerConvo.includes('soon') || lowerConvo.includes('deadline');
  
  const priority = isUrgent || isHighIntent ? 'HIGH' : 'MEDIUM';
  const followUpRequired = true;
  
  const created: Lead = {
    id,
    name: newLead.name,
    company: newLead.company,
    email: newLead.email,
    stage: 'AI Analyzed',
    intent: isHighIntent ? 'Pricing / Evaluation' : 'Product Inquiry',
    interestLevel: isHighIntent ? 'High' : 'Medium',
    priority,
    followUpRequired,
    followUpStatus: 'Due Today',
    followUpDueDate: 'Today, 3:00 PM',
    lastContact: nowStr,
    createdAt: nowStr,
    originalConversation: newLead.originalConversation,
    aiAnalysis: {
      intent: isHighIntent ? 'Commercial Terms & Pricing' : 'General Product Evaluation',
      interestLevel: isHighIntent ? 'High' : 'Medium',
      followUpRequired: true,
      priority,
      reason: `Analyzed prospect notes. Key topic: ${isHighIntent ? 'Commercials and pricing requested' : 'Product evaluation underway'}. Follow-up recommended to accelerate sales cycle.`,
      suggestedFollowUpDate: 'Today',
    },
    recommendedAction: {
      action: isHighIntent ? 'Send pricing follow-up and schedule review' : 'Send product capabilities overview',
      reason: 'Prospect is actively evaluating options. Immediate follow-up secures momentum.',
      suggestedDate: 'Today',
    },
    draftMessage: {
      to: `${newLead.name} <${newLead.email}>`,
      subject: `Follow-up regarding ${newLead.company} & FollowUpAI`,
      message: `Hi ${newLead.name.split(' ')[0]},

Thank you for sharing your requirements. Based on our conversation, I've reviewed your team's key priorities at ${newLead.company}.

I would be glad to share detailed materials and coordinate a brief call to answer any questions. Would you be available for 15 minutes this afternoon?

Best regards,
Alex Carter`,
      isApproved: false,
    },
    timeline: [
      { id: `t-${Date.now()}-1`, date: nowStr, title: 'Lead created', type: 'lead_created' },
      { id: `t-${Date.now()}-2`, date: nowStr, title: 'AI analysis completed', type: 'analyzed' },
      { id: `t-${Date.now()}-3`, date: nowStr, title: `${priority} priority detected`, type: 'priority_detected' },
      { id: `t-${Date.now()}-4`, date: nowStr, title: 'Follow-up recommended', type: 'followup_recommended' },
      { id: `t-${Date.now()}-5`, date: nowStr, title: 'Message awaiting approval', type: 'message_generated' },
    ],
  };

  leadsStore = [created, ...leadsStore];

  // Log corresponding AI actions
  actionsStore = [
    {
      id: `act-${Date.now()}-1`,
      timestamp: 'Just now',
      title: 'Lead analysis completed',
      leadId: created.id,
      leadName: created.name,
      company: created.company,
      status: 'Completed',
      details: `Analyzed sales notes for ${created.name}; intent: ${created.intent}.`,
    },
    {
      id: `act-${Date.now()}-2`,
      timestamp: 'Just now',
      title: `${priority} priority identified`,
      leadId: created.id,
      leadName: created.name,
      company: created.company,
      status: 'Completed',
      details: `Priority designated as ${priority}.`,
    },
    {
      id: `act-${Date.now()}-3`,
      timestamp: 'Just now',
      title: 'Follow-up recommendation generated',
      leadId: created.id,
      leadName: created.name,
      company: created.company,
      status: 'Awaiting Approval',
      details: `Recommendation: ${created.recommendedAction?.action}.`,
    },
    ...actionsStore,
  ];

  return created;
}

export function updateMockLeadMessage(leadId: string, message: string, isApproved: boolean): Lead | undefined {
  const index = leadsStore.findIndex((l) => l.id === leadId);
  if (index === -1) return undefined;

  const lead = leadsStore[index];
  const updated: Lead = {
    ...lead,
    draftMessage: lead.draftMessage ? {
      ...lead.draftMessage,
      message,
      isApproved,
      approvedAt: isApproved ? 'Today, Just now' : undefined,
    } : undefined,
    timeline: isApproved
      ? [
          ...lead.timeline,
          { id: `t-${Date.now()}`, date: 'Today', title: 'Follow-up approved & saved', type: 'saved' },
        ]
      : lead.timeline,
  };

  if (isApproved) {
    actionsStore = [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        title: 'Follow-up approved by salesperson',
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company,
        status: 'Completed',
        details: 'Follow-up approved by the salesperson and saved successfully. Ready for review and sending.',
      },
      ...actionsStore,
    ];
  }

  leadsStore[index] = updated;
  return updated;
}

export function getMockAIActions(): AIActionLog[] {
  return [...actionsStore];
}
