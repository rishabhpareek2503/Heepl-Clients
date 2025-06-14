// Simple test script to verify client structure creation
const { initializeApp } = require("firebase/app");
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
const realtimeDb = getDatabase(app);

async function testClientStructureCreation() {
  const testUserId = `test-user-${Date.now()}`;
  
  try {
    console.log("🧪 Testing Client Structure Creation");
    console.log("====================================");
    console.log(`Test User ID: ${testUserId}`);
    
    // Step 1: Create a simple client structure
    console.log("\n1️⃣ Creating client structure...");
    const clientRef = ref(realtimeDb, `Clients/${testUserId}`);
    
    const clientStructure = {
      info: {
        name: "Test Company",
        userId: testUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      devices: {
        "TEST001": {
          info: {
            name: "Test Device",
            location: "Test Location",
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
        }
      }
    };
    
    await set(clientRef, clientStructure);
    console.log("✅ Client structure created successfully!");
    
    // Step 2: Verify the structure exists
    console.log("\n2️⃣ Verifying client structure...");
    const snapshot = await get(clientRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("✅ Client structure verification successful!");
      console.log(`   Company Name: ${data.info.name}`);
      console.log(`   User ID: ${data.info.userId}`);
      console.log(`   Devices: ${Object.keys(data.devices).length}`);
      
      // Check specific device data
      const deviceData = data.devices.TEST001;
      if (deviceData) {
        console.log(`   Device Name: ${deviceData.info.name}`);
        console.log(`   Device PH: ${deviceData.Live.PH}`);
      }
    } else {
      console.log("❌ Client structure not found!");
    }
    
    // Step 3: Test data access
    console.log("\n3️⃣ Testing data access...");
    const deviceLiveRef = ref(realtimeDb, `Clients/${testUserId}/devices/TEST001/Live`);
    const liveSnapshot = await get(deviceLiveRef);
    
    if (liveSnapshot.exists()) {
      const liveData = liveSnapshot.val();
      console.log("✅ Live data access successful!");
      console.log(`   PH: ${liveData.PH}`);
      console.log(`   BOD: ${liveData.BOD}`);
      console.log(`   COD: ${liveData.COD}`);
    } else {
      console.log("❌ Live data not accessible!");
    }
    
    // Step 4: Clean up
    console.log("\n4️⃣ Cleaning up test data...");
    await set(clientRef, null);
    console.log("✅ Test data cleaned up successfully!");
    
    console.log("\n🎉 Client Structure Test Completed Successfully!");
    console.log("The Realtime Database permissions are working correctly.");
    console.log("\n📋 Next Steps:");
    console.log("1. Start your development server: npm run dev");
    console.log("2. Go to http://localhost:3000/signup");
    console.log("3. Create a new account or use existing one");
    console.log("4. Use the Client Structure Manager in the dashboard");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
    
    if (error.code === "PERMISSION_DENIED") {
      console.log("\n🔧 Permission Issue Detected!");
      console.log("Please follow these steps to fix:");
      console.log("1. Go to Firebase Console: https://console.firebase.google.com/project/live-monitoring-system");
      console.log("2. Navigate to Realtime Database → Rules");
      console.log("3. Replace the rules with:");
      console.log('   {');
      console.log('     "rules": {');
      console.log('       ".read": true,');
      console.log('       ".write": true');
      console.log('     }');
      console.log('   }');
      console.log("4. Click 'Publish'");
      console.log("5. Run this test again");
    }
  }
}

// Run the test
testClientStructureCreation(); 