// Initialize the Admin SDK
const admin = require('firebase-admin');

// Service account key from Firebase Console
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-budget-tracker-7ecc5.firebaseio.com"
});

const db = admin.firestore();

// Test connection
async function testConnection() {
  try {
    const doc = await db.collection('test').doc('connection').get();
    console.log('Firestore connection successful');
  } catch (error) {
    console.error('Firestore connection failed:', error);
  }
}

testConnection();