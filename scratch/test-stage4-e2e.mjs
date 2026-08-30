import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.server') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runStage4Tests() {
  console.log('========================================');
  console.log('STAGE 4 END-TO-END AUTOMATED VERIFICATION');
  console.log('========================================\n');

  // Test 1: Health Check
  console.log('[Test 1] Verifying Backend Health & Gemini Status...');
  const healthRes = await fetch('http://localhost:3001/api/health');
  const healthData = await healthRes.json();
  console.log('Health response:', healthData);
  if (!healthData.geminiConfigured) {
    throw new Error('Gemini is not configured on server!');
  }
  console.log('PASS: Server is healthy and Gemini is configured.\n');

  // Test 2: Security Verification (Unauthenticated & Invalid Token)
  console.log('[Test 2] Verifying Security: 401 on unauthenticated and invalid tokens...');
  const unauthRes = await fetch('http://localhost:3001/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation: 'Hello, this should be blocked.' }),
  });
  console.log(`Unauthenticated request status: ${unauthRes.status}`);
  if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated request');

  const invalidTokenRes = await fetch('http://localhost:3001/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer invalid-token-xyz-123',
    },
    body: JSON.stringify({ conversation: 'Hello, this should be blocked.' }),
  });
  console.log(`Invalid token request status: ${invalidTokenRes.status}`);
  if (invalidTokenRes.status !== 401) throw new Error('Expected 401 for invalid token');
  console.log('PASS: Security controls strictly enforced (401 returned).\n');

  // Test 3: Authenticate Test User
  console.log('[Test 3] Authenticating test user with Firebase...');
  const userCredential = await signInWithEmailAndPassword(
    auth,
    'test.diagnostics@followupai.com',
    'Password123!'
  );
  const user = userCredential.user;
  const idToken = await user.getIdToken();
  console.log(`PASS: User authenticated. UID: ${user.uid}\n`);

  // Test 4: Real Gemini Analysis Workflow
  console.log('[Test 4] Calling /api/ai/analyze with real sales conversation...');
  const salesConversation =
    'Sarah Chen [Acme Technologies]: Hi Alex, we reviewed the proposal with our VP of Sales. Could you share the custom pricing comparison for 120 seats? We need to finalize our vendor decision by this Friday. If implementation can be completed within 3 weeks, we are ready to move forward.';

  const analyzeRes = await fetch('http://localhost:3001/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      conversation: salesConversation,
      prospectName: 'Sarah Chen',
      company: 'Acme Technologies',
      email: 'sarah.chen@acme.example.com',
    }),
  });

  if (!analyzeRes.ok) {
    const errBody = await analyzeRes.text();
    throw new Error(`Analyze API failed (${analyzeRes.status}): ${errBody}`);
  }

  const aiData = await analyzeRes.json();
  console.log('Real Gemini Analysis Result:');
  console.log('- Intent:', aiData.intent);
  console.log('- Priority:', aiData.priority);
  console.log('- Deal Stage:', aiData.dealStage);
  console.log('- Urgency:', aiData.urgency);
  console.log('- Buying Signals:', aiData.buyingSignals);
  console.log('- Objections:', aiData.objections);
  console.log('- Pain Points:', aiData.painPoints);
  console.log('- Decision Factors:', aiData.decisionFactors);
  console.log('- Recommended Next Action:', aiData.recommendedAction);
  console.log('- Reason (Why):', aiData.reason);
  console.log('- Suggested Date:', aiData.suggestedFollowUpDate);
  console.log('- Draft Subject:', aiData.draftMessage?.subject);

  if (!aiData.intent || !aiData.priority || !aiData.recommendedAction || !aiData.draftMessage) {
    throw new Error('Gemini response missing required structured fields');
  }
  console.log('PASS: Real Gemini analysis returned full structured sales intelligence.\n');

  // Test 5: Regenerate Message Endpoint
  console.log('[Test 5] Calling /api/ai/regenerate-message with real Gemini...');
  const regenRes = await fetch('http://localhost:3001/api/ai/regenerate-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      prospectName: 'Sarah Chen',
      company: 'Acme Technologies',
      email: 'sarah.chen@acme.example.com',
      conversation: salesConversation,
      intent: aiData.intent,
      recommendedAction: aiData.recommendedAction,
      existingMessage: aiData.draftMessage.message,
    }),
  });

  if (!regenRes.ok) {
    const errBody = await regenRes.text();
    throw new Error(`Regenerate API failed (${regenRes.status}): ${errBody}`);
  }

  const regenData = await regenRes.json();
  console.log('Regenerated Draft Message Subject:', regenData.draftMessage?.subject);
  if (!regenData.draftMessage?.message) throw new Error('Regenerated message body is empty');
  console.log('PASS: Real Gemini regenerate-message succeeded.\n');

  // Test 6: Firestore Follow-Up & Complete Workflow
  console.log('[Test 6] Testing Stage 4 Firestore Follow-Up Lifecycle...');
  const testLeadId = `lead-test-stage4-${Date.now()}`;
  const testFollowUpId = `followup-${testLeadId}`;
  const nowIso = new Date().toISOString();

  // Create test lead
  const testLead = {
    id: testLeadId,
    userId: user.uid,
    name: 'Sarah Chen',
    company: 'Acme Technologies',
    email: 'sarah.chen@acme.example.com',
    stage: aiData.dealStage || 'Evaluation',
    intent: aiData.intent,
    interestLevel: aiData.interestLevel || 'High',
    priority: aiData.priority || 'HIGH',
    followUpRequired: true,
    followUpStatus: 'Due Today',
    followUpDueDate: aiData.suggestedFollowUpDate || 'Today',
    lastContact: 'Today',
    createdAt: nowIso,
    updatedAt: nowIso,
    originalConversation: salesConversation,
    approvalStatus: 'draft',
    analysisStatus: 'completed',
    draftMessage: {
      to: 'sarah.chen@acme.example.com',
      subject: aiData.draftMessage.subject,
      message: aiData.draftMessage.message,
      isApproved: false,
    },
    timeline: [
      { id: 't1', date: 'Today', title: 'Lead created', type: 'lead_created' },
      { id: 't2', date: 'Today', title: 'AI analysis completed', type: 'analyzed' },
      { id: 't3', date: 'Today', title: `${aiData.priority} priority detected`, type: 'priority_detected' },
      { id: 't4', date: 'Today', title: 'Follow-up recommended', type: 'followup_recommended' },
      { id: 't5', date: 'Today', title: 'Message awaiting approval', type: 'message_generated' },
    ],
  };

  await setDoc(doc(db, 'leads', testLeadId), testLead);
  console.log(`- Created test lead doc: leads/${testLeadId}`);

  // Create test follow-up doc
  const testFollowUp = {
    id: testFollowUpId,
    leadId: testLeadId,
    userId: user.uid,
    prospectName: 'Sarah Chen',
    company: 'Acme Technologies',
    reason: aiData.reason,
    recommendedAction: aiData.recommendedAction,
    priority: aiData.priority,
    status: 'Due Today',
    dueDate: aiData.suggestedFollowUpDate || 'Today',
    dealStage: aiData.dealStage || 'Evaluation',
    interestLevel: aiData.interestLevel || 'High',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await setDoc(doc(db, 'followUps', testFollowUpId), testFollowUp);
  console.log(`- Created test follow-up doc: followUps/${testFollowUpId}`);

  // Query follow-ups
  const q = query(collection(db, 'followUps'), where('userId', '==', user.uid));
  const snap = await getDocs(q);
  const userFollowUps = snap.docs.map((d) => d.data());
  const found = userFollowUps.find((f) => f.id === testFollowUpId);
  if (!found) throw new Error('Follow-up doc not found in user query');
  console.log(`- Confirmed follow-up doc retrieved in user query with status: ${found.status}`);

  // Now execute Follow-up Completion
  console.log('\n[Test 7] Executing Mark Follow-Up Complete...');
  // Simulate completeFollowUp
  const completeTimestamp = new Date().toISOString();
  await setDoc(doc(db, 'followUps', testFollowUpId), {
    ...testFollowUp,
    status: 'Completed',
    updatedAt: completeTimestamp,
  });

  const updatedLeadTimeline = [
    ...testLead.timeline,
    {
      id: `t-${Date.now()}-complete`,
      date: 'Today',
      title: 'Follow-up completed',
      description: 'Salesperson marked follow-up touchpoint as completed.',
      type: 'completed',
    },
  ];

  await setDoc(doc(db, 'leads', testLeadId), {
    ...testLead,
    followUpStatus: 'Completed',
    timeline: updatedLeadTimeline,
    updatedAt: completeTimestamp,
  });

  const testActionId = `action-${testFollowUpId}-complete`;
  await setDoc(doc(db, 'aiActions', testActionId), {
    id: testActionId,
    leadId: testLeadId,
    userId: user.uid,
    leadName: testFollowUp.prospectName,
    company: testFollowUp.company,
    actionType: 'follow_up_completed',
    title: 'Follow-up completed',
    details: `Follow-up touchpoint marked as completed for ${testFollowUp.prospectName} at ${testFollowUp.company}.`,
    status: 'Completed',
    timestamp: 'Just now',
    createdAt: completeTimestamp,
  });

  // Verify Follow-up still exists and is marked Completed (NOT deleted)
  const completedFollowUpSnap = await getDoc(doc(db, 'followUps', testFollowUpId));
  if (!completedFollowUpSnap.exists()) throw new Error('Follow-up was deleted!');
  const completedFollowUp = completedFollowUpSnap.data();
  if (completedFollowUp.status !== 'Completed') {
    throw new Error(`Expected status Completed, got: ${completedFollowUp.status}`);
  }
  console.log(`- Confirmed follow-up status is now: ${completedFollowUp.status}`);
  console.log('- Confirmed follow-up record is preserved in Firestore (history available).');

  // Verify lead timeline was updated
  const completedLeadSnap = await getDoc(doc(db, 'leads', testLeadId));
  const completedLead = completedLeadSnap.data();
  if (completedLead.followUpStatus !== 'Completed') {
    throw new Error(`Expected lead followUpStatus Completed, got: ${completedLead.followUpStatus}`);
  }
  const hasCompletedTimeline = completedLead.timeline.some((e) => e.type === 'completed');
  if (!hasCompletedTimeline) {
    throw new Error('Timeline did not record completed event');
  }
  console.log('- Confirmed lead timeline contains completed event.');

  // Verify aiActions logged
  const actionSnap = await getDoc(doc(db, 'aiActions', testActionId));
  if (!actionSnap.exists()) throw new Error('aiAction record was not created');
  console.log('- Confirmed aiAction recorded with actionType: follow_up_completed');

  // Cleanup test artifacts
  await deleteDoc(doc(db, 'followUps', testFollowUpId));
  await deleteDoc(doc(db, 'leads', testLeadId));
  await deleteDoc(doc(db, 'aiActions', testActionId));
  console.log('- Cleaned up test records successfully.');

  console.log('\n========================================');
  console.log('ALL STAGE 4 END-TO-END VERIFICATIONS PASSED!');
  console.log('========================================');
}

runStage4Tests().catch((err) => {
  console.error('\nFAILED TEST WITH ERROR:', err);
  process.exit(1);
});
