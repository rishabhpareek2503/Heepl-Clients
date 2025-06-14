// Script to manage Firebase users
const { initializeApp } = require("firebase/app");
const { getAuth, deleteUser, updatePassword, createUserWithEmailAndPassword } = require("firebase/auth");

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

async function manageUsers() {
  try {
    console.log("Firebase User Management Script");
    console.log("================================");
    
    // Option 1: Delete existing user
    console.log("\n1. To delete user 'manamimaity2002@gmail.com':");
    console.log("   - Go to Firebase Console → Authentication → Users");
    console.log("   - Find the user and click delete");
    
    // Option 2: Create new user
    console.log("\n2. To create a new user:");
    console.log("   - Use the signup page at http://localhost:3000/signup");
    console.log("   - Or use Firebase Console → Authentication → Add User");
    
    // Option 3: Reset password
    console.log("\n3. To reset password:");
    console.log("   - Go to Firebase Console → Authentication → Users");
    console.log("   - Find the user and click 'Reset password'");
    
    console.log("\n4. To use Firebase CLI:");
    console.log("   firebase auth:list");
    console.log("   firebase auth:delete manamimaity2002@gmail.com");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

manageUsers(); 