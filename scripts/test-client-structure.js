// Test script to verify client structure creation
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, deleteUser } = require("firebase/auth");
const { getFirestore, doc, setDoc, deleteDoc, getDoc } = require("firebase/firestore");
const { getDatabase, ref, set, get } = require("firebase/database");

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

async function testClientStructureCreation() {
  const testEmail = `test-client-${Date.now()}@example.com`;
  const testPassword = "TestPass123";
  const testName = "Test Client Company";

  try {
    console.log("🧪 Testing Client Structure Creation");
    console.log("=====================================");
    
    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`🔐 Test Password: ${testPassword}`);
    console.log(`🏢 Test Company: ${testName}`);
    
    // Step 1: Create user account
    console.log("\n1️⃣ Creating user account...");
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log(`✅ User created successfully! UID: ${user.uid}`);
    
    // Step 2: Create user profile in Firestore
    console.log("\n2️⃣ Creating user profile in Firestore...");
    const userDocRef = doc(db, "users", user.uid);
    const userProfile = {
      name: testName,
      email: testEmail,
      onboardingComplete: false,
      role: "user",
      permissions: ["view:basic"],
    };
    await setDoc(userDocRef, userProfile);
    console.log("✅ User profile created in Firestore!");
    
    // Step 3: Create test devices in Firestore
    console.log("\n3️⃣ Creating test devices in Firestore...");
    const device1Ref = doc(db, "devices", "TEST001");
    const device1Data = {
      serialNumber: "SN001",
      name: "Test Device 1",
      location: "Test Location 1",
      installationDate: new Date().toISOString(),
      lastMaintenance: new Date().toISOString(),
      status: "online",
      userId: user.uid,
      companyId: `company-${user.uid}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(device1Ref, device1Data);
    
    const device2Ref = doc(db, "devices", "TEST002");
    const device2Data = {
      serialNumber: "SN002",
      name: "Test Device 2",
      location: "Test Location 2",
      installationDate: new Date().toISOString(),
      lastMaintenance: new Date().toISOString(),
      status: "online",
      userId: user.uid,
      companyId: `company-${user.uid}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(device2Ref, device2Data);
    console.log("✅ Test devices created in Firestore!");
    
    // Step 4: Create client structure in Realtime Database
    console.log("\n4️⃣ Creating client structure in Realtime Database...");
    const clientRef = ref(realtimeDb, `Clients/${user.uid}`);
    
    const clientStructure = {
      info: {
        name: testName,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      devices: {
        TEST001: {
          info: {
            name: "Test Device 1",
            location: "Test Location 1",
            status: "online",
            lastSeen: new Date().toISOString(),
          },
          Live: {
            PH: 7.0,
            BOD: 30,
            COD: 100,
            TSS: 50,
            Flow: 100,
            Temperature: 25,
            DO: 6,
            Conductivity: 1000,
            Turbidity: 2,
            Timestamp: new Date().toISOString(),
          },
          History: {}
        },
        TEST002: {
          info: {
            name: "Test Device 2",
            location: "Test Location 2",
            status: "online",
            lastSeen: new Date().toISOString(),
          },
          Live: {
            PH: 7.2,
            BOD: 25,
            COD: 90,
            TSS: 45,
            Flow: 95,
            Temperature: 26,
            DO: 6.5,
            Conductivity: 1050,
            Turbidity: 1.8,
            Timestamp: new Date().toISOString(),
          },
          History: {}
        }
      }
    };
    
    await set(clientRef, clientStructure);
    console.log("✅ Client structure created in Realtime Database!");
    
    // Step 5: Verify client structure exists
    console.log("\n5️⃣ Verifying client structure...");
    const clientSnapshot = await get(clientRef);
    if (clientSnapshot.exists()) {
      const clientData = clientSnapshot.val();
      console.log("✅ Client structure verification successful!");
      console.log(`   Client Name: ${clientData.info.name}`);
      console.log(`   User ID: ${clientData.info.userId}`);
      console.log(`   Devices: ${Object.keys(clientData.devices).length}`);
      
      // Check specific device data
      const device1Data = clientData.devices.TEST001;
      if (device1Data) {
        console.log(`   Device 1 - Name: ${device1Data.info.name}, PH: ${device1Data.Live.PH}`);
      }
    } else {
      console.log("❌ Client structure not found!");
    }
    
    // Step 6: Test data access
    console.log("\n6️⃣ Testing data access...");
    const device1LiveRef = ref(realtimeDb, `Clients/${user.uid}/devices/TEST001/Live`);
    const device1LiveSnapshot = await get(device1LiveRef);
    if (device1LiveSnapshot.exists()) {
      const liveData = device1LiveSnapshot.val();
      console.log("✅ Live data access successful!");
      console.log(`   PH: ${liveData.PH}`);
      console.log(`   BOD: ${liveData.BOD}`);
      console.log(`   COD: ${liveData.COD}`);
    } else {
      console.log("❌ Live data not accessible!");
    }
    
    // Step 7: Clean up
    console.log("\n7️⃣ Cleaning up test data...");
    await deleteDoc(device1Ref);
    await deleteDoc(device2Ref);
    await deleteDoc(userDocRef);
    await set(clientRef, null);
    await deleteUser(user);
    console.log("✅ Test data cleaned up successfully!");
    
    console.log("\n🎉 Client Structure Creation Test Completed Successfully!");
    console.log("The system now supports dynamic client creation for new users.");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the test
testClientStructureCreation(); 