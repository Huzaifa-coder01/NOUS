const admin = require("firebase-admin");
const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '../secretAssets');
const filePath = path.join(folderPath, 'serviceAccountKey.json');

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '{}');
}

const serviceAccount = require("../secretAssets/serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://coachcritic-50810.firebaseio.com",
  });

  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}
module.exports = admin;
