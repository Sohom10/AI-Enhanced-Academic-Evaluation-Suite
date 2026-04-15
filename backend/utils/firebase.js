const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    console.warn("⚠️ Warning: serviceAccountKey.json not found in the backend directory. Firebase will not connect.");
    // Initialize with nothing just so it doesn't immediately crash if starting for the first time
    admin.initializeApp();
}

const db = admin.firestore();

module.exports = { admin, db };
