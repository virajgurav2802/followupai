import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

async function runStage3Tests() {
  console.log('=== STAGE 3 INTEGRATION TEST ===');

  // 1. Sign in as test user
  console.log('[1] Signing in with test account...');
  const userCredential = await signInWithEmailAndPassword(
    auth,
    'test.diagnostics@followupai.com',
    'Password123!'
  );
  const user = userCredential.user;
  console.log(`[1] Signed in successfully! UID: ${user.uid}`);

  const idToken = await user.getIdToken();
  console.log(`[1] Obtained Firebase ID token (len: ${idToken.length})`);

  // 2. Test validation: Short conversation (< 10 chars)
  console.log('\n[2] Testing server validation with conversation < 10 chars...');
  const resShort = await fetch('http://localhost:3001/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      conversation: 'too short',
      prospectName: 'Rahul Mehta',
      company: 'Acme Corporation',
    }),
  });
  const dataShort = await resShort.json();
  console.log(`[2] Short conversation response: Status ${resShort.status}`, dataShort);
  if (resShort.status !== 400) throw new Error('Expected 400 for short conversation');

  // 3. Test validation: Missing prospect name
  console.log('\n[3] Testing server validation with missing prospect name...');
  const resMissing = await fetch('http://localhost:3001/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      conversation: 'Valid sales conversation with more than 10 characters',
      prospectName: '',
      company: 'Acme Corporation',
    }),
  });
  const dataMissing = await resMissing.json();
  console.log(`[3] Missing name response: Status ${resMissing.status}`, dataMissing);
  if (resMissing.status !== 400) throw new Error('Expected 400 for missing prospectName');

  // 4. Test analyze endpoint with full conversation
  console.log('\n[4] Testing analyze endpoint with realistic sales conversation...');
  const conversation =
    'Thanks for the pricing proposal. The enterprise plan looks promising, but I need to understand the implementation timeline and whether SSO and security documentation are included. If the technical review goes well, we should be able to move forward with procurement.';

  const resAnalyze = await fetch('http://localhost:3001/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      conversation,
      prospectName: 'Rahul Mehta',
      company: 'Acme Corporation',
      email: 'rahul.mehta@acme.corp',
    }),
  });
  const dataAnalyze = await resAnalyze.json();
  console.log(`[4] Analyze endpoint response: Status ${resAnalyze.status}`);
  console.log(JSON.stringify(dataAnalyze, null, 2));

  // 5. Test regenerate endpoint
  console.log('\n[5] Testing regenerate-message endpoint...');
  const resRegen = await fetch('http://localhost:3001/api/ai/regenerate-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      conversation,
      prospectName: 'Rahul Mehta',
      company: 'Acme Corporation',
      email: 'rahul.mehta@acme.corp',
      intent: dataAnalyze.intent || 'Pricing Inquiry & Technical Review',
      recommendedAction: dataAnalyze.recommendedAction || 'Send SSO & security documentation',
    }),
  });
  const dataRegen = await resRegen.json();
  console.log(`[5] Regenerate endpoint response: Status ${resRegen.status}`);
  console.log(JSON.stringify(dataRegen, null, 2));

  console.log('\n=== ALL STAGE 3 API VERIFICATION CHECKS COMPLETED ===');
}

runStage3Tests().catch(console.error);
