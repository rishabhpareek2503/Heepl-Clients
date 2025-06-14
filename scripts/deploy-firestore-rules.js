const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🚀 Deploying Firestore Security Rules");
console.log("=====================================");

try {
  // Check if firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error("❌ Firebase CLI not found. Please install it first:");
    console.error("   npm install -g firebase-tools");
    console.error("   firebase login");
    process.exit(1);
  }

  // Check if firebase.json exists
  const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
  if (!fs.existsSync(firebaseJsonPath)) {
    console.log("📝 Creating firebase.json configuration...");
    const firebaseConfig = {
      "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
      }
    };
    fs.writeFileSync(firebaseJsonPath, JSON.stringify(firebaseConfig, null, 2));
  }

  // Deploy Firestore rules
  console.log("📤 Deploying Firestore rules...");
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log("✅ Firestore rules deployed successfully!");
  console.log("🔄 The subscription functionality should now work properly.");

} catch (error) {
  console.error("❌ Failed to deploy Firestore rules:", error.message);
  console.log("\n💡 Manual deployment steps:");
  console.log("1. Install Firebase CLI: npm install -g firebase-tools");
  console.log("2. Login to Firebase: firebase login");
  console.log("3. Initialize project: firebase init firestore");
  console.log("4. Deploy rules: firebase deploy --only firestore:rules");
  process.exit(1);
} 