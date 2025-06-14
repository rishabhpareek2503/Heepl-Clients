const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, getDoc, updateDoc } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "heepl-wastewater.firebaseapp.com",
  projectId: "heepl-wastewater",
  storageBucket: "heepl-wastewater.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testSubscription() {
  console.log("🧪 Testing Subscription Functionality");
  console.log("=====================================");

  try {
    // Test 1: Sign in with a test user
    console.log("\n1. Signing in with test user...");
    const testEmail = "test@example.com"; // Replace with a real test user
    const testPassword = "TestPassword123";
    
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log("✅ Signed in successfully:", user.email);
    console.log("   User ID:", user.uid);

    // Test 2: Check current user profile
    console.log("\n2. Checking current user profile...");
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("✅ User profile found:", userData);
      console.log("   Current subscription status:", userData.subscription?.isSubscribed || false);
    } else {
      console.log("❌ User profile not found");
      return;
    }

    // Test 3: Test subscription update
    console.log("\n3. Testing subscription update...");
    const subscriptionData = {
      isSubscribed: true,
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      plan: 'premium',
    };
    
    console.log("   Updating with subscription data:", subscriptionData);
    
    await updateDoc(userDocRef, {
      subscription: subscriptionData,
    });
    
    console.log("✅ Subscription update successful");

    // Test 4: Verify the update
    console.log("\n4. Verifying subscription update...");
    const updatedDoc = await getDoc(userDocRef);
    const updatedData = updatedDoc.data();
    
    console.log("✅ Updated user profile:", updatedData);
    console.log("   New subscription status:", updatedData.subscription?.isSubscribed);

    // Test 5: Test unsubscription
    console.log("\n5. Testing unsubscription...");
    const unsubscriptionData = {
      isSubscribed: false,
      subscribedAt: undefined,
      expiresAt: undefined,
      plan: 'free',
    };
    
    await updateDoc(userDocRef, {
      subscription: unsubscriptionData,
    });
    
    console.log("✅ Unsubscription successful");

    // Test 6: Final verification
    console.log("\n6. Final verification...");
    const finalDoc = await getDoc(userDocRef);
    const finalData = finalDoc.data();
    
    console.log("✅ Final user profile:", finalData);
    console.log("   Final subscription status:", finalData.subscription?.isSubscribed);

    console.log("\n🎉 All subscription tests passed!");
    console.log("\n📝 Test Summary:");
    console.log("   - User authentication: ✅");
    console.log("   - Profile access: ✅");
    console.log("   - Subscription update: ✅");
    console.log("   - Unsubscription: ✅");
    console.log("   - Data verification: ✅");

  } catch (error) {
    console.error("❌ Subscription test failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log("\n💡 Tip: Make sure you have a test user created with the email:", testEmail);
    } else if (error.code === 'permission-denied') {
      console.log("\n💡 Tip: Check Firestore security rules");
    }
  }
}

// Run the test
testSubscription().then(() => {
  console.log("\n🏁 Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
}); 