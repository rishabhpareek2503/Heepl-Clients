// Utility script to manage test users in Firebase
const { initializeApp } = require("firebase/app");
const { getAuth, listUsers, deleteUser } = require("firebase/auth");
const { getFirestore, collection, getDocs, doc, deleteDoc } = require("firebase/firestore");
const { getDatabase, ref, get, set } = require("firebase/database");

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAYIEWR-ewTCj-i0U0BquqcCSLJYDDVdY",
  authDomain: "live-monitoring-system.firebaseapp.com",
  databaseURL: "https://live-monitoring-system-default-rtdb.firebaseio.com",
  projectId: "live-monitoring-system",
  storageBucket: "live-monitoring-system.firebasestorage.app",
  messagingSenderId: "396044271748",
  appId: "1:396044271748:web:732d8bbfc8e06b7c8582d1",
  measurementId: "G-3R13EZNEJZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

async function manageTestUsers() {
  try {
    console.log("🔧 Firebase User Management Utility");
    console.log("===================================");
    
    console.log("\n📋 Available Actions:");
    console.log("1. List all users");
    console.log("2. Delete specific user");
    console.log("3. Clean up test users");
    console.log("4. Check user data consistency");
    
    // Note: This script requires Firebase Admin SDK for full functionality
    // For now, we'll provide guidance on manual management
    
    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("- To delete users, you need Firebase Admin SDK access");
    console.log("- You can manage users through Firebase Console:");
    console.log("  https://console.firebase.google.com/project/live-monitoring-system/authentication/users");
    
    console.log("\n🔧 Manual User Management Steps:");
    console.log("1. Go to Firebase Console → Authentication → Users");
    console.log("2. Find the user with the conflicting email");
    console.log("3. Click the three dots (⋮) next to the user");
    console.log("4. Select 'Delete user'");
    console.log("5. Confirm deletion");
    
    console.log("\n🧹 Clean Up Firestore Data:");
    console.log("- Go to Firebase Console → Firestore Database");
    console.log("- Navigate to 'users' collection");
    console.log("- Delete the user document with the same UID");
    
    console.log("\n🗄️  Clean Up Realtime Database:");
    console.log("- Go to Firebase Console → Realtime Database");
    console.log("- Navigate to 'Clients' → [USER_UID]");
    console.log("- Delete the client structure if it exists");
    
    console.log("\n💡 Alternative Solutions:");
    console.log("1. Use a different email address for testing");
    console.log("2. Add timestamp to email: test-1234567890@example.com");
    console.log("3. Use the login page instead: http://localhost:3000/login");
    
    console.log("\n🚀 Quick Test Email Generator:");
    const timestamp = Date.now();
    console.log(`Test email: test-${timestamp}@example.com`);
    console.log(`Test email: user-${timestamp}@test.com`);
    console.log(`Test email: demo-${timestamp}@example.com`);
    
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the script
manageTestUsers(); 