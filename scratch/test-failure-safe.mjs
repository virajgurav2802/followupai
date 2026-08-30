import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

async function testFailureSafe() {
  console.log('=== TESTING FAILURE-SAFE FLOW IN FIRESTORE ===');
  const cred = await signInWithEmailAndPassword(auth, 'test.diagnostics@followupai.com', 'Password123!');
  const user = cred.user;
  console.log('Signed in as:', user.uid);

  // Simulate creating lead
  const testLeadId = `lead-failure-test-${Date.now()}`;
  const testLeadDoc = {
    id: testLeadId,
    userId: user.uid,
    name: 'Rahul Mehta',
    company: 'Acme Corporation',
    email: 'rahul.mehta@acme.corp',
    stage: 'Prospect',
    intent: 'Analysis Pending',
    interestLevel: 'Medium',
    priority: 'MEDIUM',
    followUpRequired: false,
    followUpStatus: 'Pending',
    followUpDueDate: 'Pending AI Analysis',
    lastContact: 'Today',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originalConversation: 'Thanks for the pricing proposal. The enterprise plan looks promising...',
    approvalStatus: 'draft',
    analysisStatus: 'failed',
    timeline: [
      { id: `t-${Date.now()}-1`, date: 'Today', title: 'Lead created', type: 'lead_created' },
      { id: `t-${Date.now()}-2`, date: 'Today', title: 'AI analysis pending retry', type: 'analyzed' }
    ]
  };

  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'leads', testLeadId), testLeadDoc);
  console.log('Lead saved safely to Firestore:', testLeadId);

  // Read back from Firestore
  const snap = await getDoc(doc(db, 'leads', testLeadId));
  if (snap.exists()) {
    console.log('SUCCESS: Lead verified in Firestore with analysisStatus:', snap.data().analysisStatus);
    console.log('Original conversation preserved:', snap.data().originalConversation);
  } else {
    throw new Error('Failed to retrieve saved lead');
  }
}

testFailureSafe().catch(console.error);
