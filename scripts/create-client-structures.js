// Utility script to create client structures for existing users
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, getDocs, doc, getDoc } = require("firebase/firestore");
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

async function createClientStructuresForExistingUsers() {
  try {
    console.log("🔧 Creating Client Structures for Existing Users");
    console.log("================================================");
    
    // Step 1: Get all users from Firestore
    console.log("\n1️⃣ Fetching all users from Firestore...");
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${users.length} users in Firestore`);
    
    // Step 2: Check which users don't have client structures
    console.log("\n2️⃣ Checking existing client structures...");
    const usersWithoutClientStructures = [];
    
    for (const user of users) {
      const clientRef = ref(realtimeDb, `Clients/${user.id}`);
      const clientSnapshot = await get(clientRef);
      
      if (!clientSnapshot.exists()) {
        usersWithoutClientStructures.push(user);
        console.log(`❌ User ${user.email} (${user.id}) missing client structure`);
      } else {
        console.log(`✅ User ${user.email} (${user.id}) has client structure`);
      }
    }
    
    console.log(`\nFound ${usersWithoutClientStructures.length} users without client structures`);
    
    if (usersWithoutClientStructures.length === 0) {
      console.log("🎉 All users already have client structures!");
      return;
    }
    
    // Step 3: Create client structures for users who need them
    console.log("\n3️⃣ Creating client structures...");
    
    for (const user of usersWithoutClientStructures) {
      console.log(`\nCreating client structure for user: ${user.email} (${user.id})`);
      
      try {
        // Get user's devices
        const devicesSnapshot = await getDocs(collection(db, "devices"));
        const userDevices = [];
        
        devicesSnapshot.forEach((deviceDoc) => {
          const deviceData = deviceDoc.data();
          if (deviceData.userId === user.id) {
            userDevices.push({
              id: deviceDoc.id,
              ...deviceData
            });
          }
        });
        
        console.log(`Found ${userDevices.length} devices for user ${user.email}`);
        
        // Create client structure
        const clientRef = ref(realtimeDb, `Clients/${user.id}`);
        const companyName = user.name || user.company || "Unknown Company";
        
        const clientStructure = {
          info: {
            name: companyName,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          devices: {}
        };
        
        // Add devices to client structure
        userDevices.forEach((device) => {
          clientStructure.devices[device.id] = {
            info: {
              name: device.name || "Unknown Device",
              location: device.location || "Unknown Location",
              status: device.status || "offline",
              lastSeen: new Date().toISOString(),
            },
            Live: {
              // Initialize with default values
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
          };
        });
        
        // If no devices, create a default device
        if (userDevices.length === 0) {
          console.log(`No devices found for user ${user.email}, creating default device`);
          clientStructure.devices["DEFAULT001"] = {
            info: {
              name: "Default Device",
              location: "Default Location",
              status: "offline",
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
          };
        }
        
        await set(clientRef, clientStructure);
        console.log(`✅ Client structure created for user ${user.email}`);
        
      } catch (error) {
        console.error(`❌ Failed to create client structure for user ${user.email}:`, error.message);
      }
    }
    
    console.log("\n🎉 Client structure creation completed!");
    console.log(`Created client structures for ${usersWithoutClientStructures.length} users`);
    
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the script
createClientStructuresForExistingUsers(); 