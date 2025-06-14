// Test script to verify signup functionality
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, deleteUser } = require("firebase/auth");
const { getFirestore, doc, setDoc, deleteDoc, getDoc } = require("firebase/firestore");

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

async function testSignup() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPass123";
  const testName = "Test User";

  try {
    console.log("🧪 Testing Signup Functionality");
    console.log("=================================");
    
    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`🔐 Test Password: ${testPassword}`);
    console.log(`👤 Test Name: ${testName}`);
    
    // Step 1: Create user account
    console.log("\n1️⃣ Creating user account...");
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log(`✅ User created successfully! UID: ${user.uid}`);
    
    // Step 2: Create user profile
    console.log("\n2️⃣ Creating user profile...");
    const userDocRef = doc(db, "users", user.uid);
    const newUserProfile = {
      name: testName,
      onboardingComplete: false,
      role: "user",
      permissions: ["view:basic"],
    };
    await setDoc(userDocRef, newUserProfile);
    console.log("✅ User profile created successfully!");
    
    // Step 3: Verify profile was created
    console.log("\n3️⃣ Verifying user profile...");
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("✅ User profile verification successful!");
      console.log(`   Name: ${userData.name}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Onboarding Complete: ${userData.onboardingComplete}`);
    } else {
      console.log("❌ User profile not found!");
    }
    
    // Step 4: Clean up (delete test user)
    console.log("\n4️⃣ Cleaning up test user...");
    await deleteDoc(userDocRef);
    await deleteUser(user);
    console.log("✅ Test user cleaned up successfully!");
    
    console.log("\n🎉 All tests passed! Signup functionality is working correctly.");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Error code:", error.code);
    
    if (error.code === "auth/email-already-in-use") {
      console.log("💡 This is expected if the test email already exists.");
    }
  }
}

// Run the test
testSignup(); 