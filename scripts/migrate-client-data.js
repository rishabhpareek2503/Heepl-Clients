// Script to migrate client data from legacy hardcoded client ID to user-specific structures
const { initializeApp } = require("firebase/app");
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
const realtimeDb = getDatabase(app);

async function migrateClientData() {
  const legacyClientId = "TyWRS0Zyusc3tbtcU0PcBPdXSjb2";
  
  try {
    console.log("🔄 Client Data Migration Script");
    console.log("===============================");
    
    // Step 1: Check if legacy client exists
    console.log("\n1️⃣ Checking legacy client structure...");
    const legacyClientRef = ref(realtimeDb, `Clients/${legacyClientId}`);
    const legacySnapshot = await get(legacyClientRef);
    
    if (!legacySnapshot.exists()) {
      console.log("❌ Legacy client structure not found!");
      console.log("No migration needed.");
      return;
    }
    
    const legacyData = legacySnapshot.val();
    console.log("✅ Legacy client structure found!");
    console.log(`   Company Name: ${legacyData.info?.name || 'Unknown'}`);
    console.log(`   Devices: ${Object.keys(legacyData.devices || {}).length}`);
    
    // Step 2: List all existing users (you'll need to provide these)
    console.log("\n2️⃣ Available migration options:");
    console.log("   a) Migrate to a specific user ID");
    console.log("   b) Create a copy for all users");
    console.log("   c) Just view the legacy data structure");
    
    // For now, let's create a copy for a test user
    const testUserId = "test-migration-user";
    console.log(`\n3️⃣ Creating copy for test user: ${testUserId}`);
    
    const newClientRef = ref(realtimeDb, `Clients/${testUserId}`);
    
    // Create new client structure with legacy data
    const newClientStructure = {
      info: {
        name: legacyData.info?.name || "Migrated Company",
        userId: testUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFrom: legacyClientId,
        migrationDate: new Date().toISOString()
      },
      devices: legacyData.devices || {}
    };
    
    await set(newClientRef, newClientStructure);
    console.log("✅ Data migrated successfully!");
    
    // Step 3: Verify the migration
    console.log("\n4️⃣ Verifying migration...");
    const newSnapshot = await get(newClientRef);
    
    if (newSnapshot.exists()) {
      const newData = newSnapshot.val();
      console.log("✅ Migration verification successful!");
      console.log(`   New Company Name: ${newData.info.name}`);
      console.log(`   Devices: ${Object.keys(newData.devices).length}`);
      console.log(`   Migrated From: ${newData.info.migratedFrom}`);
    } else {
      console.log("❌ Migration verification failed!");
    }
    
    console.log("\n📋 Migration Instructions for Real Users:");
    console.log("1. Get the user's UID from Firebase Authentication");
    console.log("2. Run this script with the specific user ID");
    console.log("3. Update the user's client structure in the app");
    console.log("4. Test that the user can see their data");
    
    console.log("\n🔧 Manual Migration Steps:");
    console.log("1. Go to Firebase Console → Realtime Database");
    console.log("2. Navigate to Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2");
    console.log("3. Copy the entire structure");
    console.log("4. Create a new path: Clients/{USER_UID}");
    console.log("5. Paste the data and update the info.userId field");
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the migration
migrateClientData(); 