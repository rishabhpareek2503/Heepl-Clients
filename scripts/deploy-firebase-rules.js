// Script to deploy Firebase rules and ensure proper permissions
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🚀 Firebase Rules Deployment Script");
console.log("===================================");

function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function deployRules() {
  try {
    console.log("\n1️⃣ Checking Firebase CLI...");
    if (!checkFirebaseCLI()) {
      console.log("❌ Firebase CLI not found. Installing...");
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    } else {
      console.log("✅ Firebase CLI is available");
    }

    console.log("\n2️⃣ Checking Firebase project...");
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log("✅ Firebase project is configured");
    } catch (error) {
      console.log("⚠️  Firebase project not configured. Please run:");
      console.log("   firebase login");
      console.log("   firebase use live-monitoring-system");
      return;
    }

    console.log("\n3️⃣ Deploying Firestore rules...");
    try {
      execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
      console.log("✅ Firestore rules deployed successfully");
    } catch (error) {
      console.log("❌ Failed to deploy Firestore rules");
      console.log("Manual deployment required:");
      console.log("1. Go to Firebase Console → Firestore Database → Rules");
      console.log("2. Copy the content from firestore.rules");
      console.log("3. Paste and publish");
    }

    console.log("\n4️⃣ Deploying Realtime Database rules...");
    try {
      execSync('firebase deploy --only database', { stdio: 'inherit' });
      console.log("✅ Realtime Database rules deployed successfully");
    } catch (error) {
      console.log("❌ Failed to deploy Realtime Database rules");
      console.log("Manual deployment required:");
      console.log("1. Go to Firebase Console → Realtime Database → Rules");
      console.log("2. Copy the content from database.rules.json");
      console.log("3. Paste and publish");
    }

    console.log("\n🎉 Rules deployment completed!");
    console.log("\n📋 Next Steps:");
    console.log("1. Test the signup flow at http://localhost:3000/signup");
    console.log("2. Create a new account or use existing one");
    console.log("3. Check if client structure is created in Realtime Database");
    console.log("4. If issues persist, check browser console for errors");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.log("\n🔧 Manual Setup Required:");
    console.log("1. Go to Firebase Console: https://console.firebase.google.com/project/live-monitoring-system");
    console.log("2. Navigate to Firestore Database → Rules");
    console.log("3. Replace with: allow read, write: if true;");
    console.log("4. Navigate to Realtime Database → Rules");
    console.log("5. Replace with: { \".read\": true, \".write\": true }");
  }
}

// Run the deployment
deployRules(); 