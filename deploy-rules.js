import firebaseAdmin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Service account key from Firebase Console
const serviceAccount = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const firestore = firebaseAdmin.firestore();

// Read the rules file
function readRulesFile() {
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  try {
    const data = fs.readFileSync(rulesPath, 'utf8');
    return data;
  } catch (error) {
    console.error('Error reading rules file:', error);
    process.exit(1);
  }
}

// Deploy rules
async function deployRules() {
  const rules = readRulesFile();
  
  try {
    // Get current settings first
    const settings = await firestore.settings();
    console.log('Current settings:', settings);
    
    // Update settings with new rules
    await firestore.settings({
      firestore: {
        rules
      }
    });
    
    console.log('Firestore security rules deployed successfully!');
  } catch (error) {
    console.error('Error deploying rules:', error);
  }
}

// Execute deployment
console.log('🚀 Deploying Firestore security rules...');
deployRules();