const { initializeApp } = require("firebase/app")
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth")
const { getDatabase, ref, get, set } = require("firebase/database")

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAYIEWR-ewTCj-i0U0BquqcCSLJYDDVdY",
  authDomain: "live-monitoring-system.firebaseapp.com",
  databaseURL: "https://live-monitoring-system-default-rtdb.firebaseio.com",
  projectId: "live-monitoring-system",
  storageBucket: "live-monitoring-system.firebasestorage.app",
  messagingSenderId: "396044271748",
  appId: "1:396044271748:web:732d8bbfc8e06b7c8582d1",
  measurementId: "G-3R13EZNEJZ",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

async function findAndMigrateUser() {
  try {
    console.log("🔍 Finding and migrating user data...")
    console.log("=====================================")
    
    const userEmail = "manamimaity2002@gmail.com"
    
    // First, let's check what's in the Realtime Database
    console.log("\n1️⃣ Checking current Realtime Database structure...")
    
    // Check the legacy client
    const legacyClientRef = ref(database, `Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2`)
    const legacySnapshot = await get(legacyClientRef)
    
    if (legacySnapshot.exists()) {
      const legacyData = legacySnapshot.val()
      console.log("✅ Legacy client found:")
      console.log(`   - Company: ${legacyData.info?.name || "Unknown"}`)
      console.log(`   - Devices: ${Object.keys(legacyData.devices || {}).length}`)
      
      // List all device IDs
      const deviceIds = Object.keys(legacyData.devices || {})
      console.log(`   - Device IDs: ${deviceIds.join(", ")}`)
    } else {
      console.log("❌ Legacy client not found")
    }
    
    // Check if there are any other client structures
    console.log("\n2️⃣ Checking for other client structures...")
    const clientsRef = ref(database, `Clients`)
    const clientsSnapshot = await get(clientsRef)
    
    if (clientsSnapshot.exists()) {
      const clientsData = clientsSnapshot.val()
      const clientIds = Object.keys(clientsData)
      console.log(`Found ${clientIds.length} client structures:`)
      
      clientIds.forEach(clientId => {
        const clientData = clientsData[clientId]
        console.log(`   - ${clientId}: ${clientData.info?.name || "Unknown"} (${Object.keys(clientData.devices || {}).length} devices)`)
        if (clientData.info?.userEmail === userEmail) {
          console.log(`     ⭐ This appears to be your client structure!`)
        }
      })
    }
    
    // Now let's try to sign in to get the actual UID
    console.log("\n3️⃣ Attempting to sign in to get user UID...")
    console.log("Note: You'll need to provide your password for this step")
    console.log("For now, let's check if we can find your UID in the database...")
    
    // Look for any client structure that has your email
    if (clientsSnapshot.exists()) {
      const clientsData = clientsSnapshot.val()
      let foundUserClient = null
      let foundUserUid = null
      
      for (const [clientId, clientData] of Object.entries(clientsData)) {
        if (clientData.info?.userEmail === userEmail) {
          foundUserClient = clientData
          foundUserUid = clientId
          break
        }
      }
      
      if (foundUserClient) {
        console.log(`✅ Found your client structure!`)
        console.log(`   - Client ID: ${foundUserUid}`)
        console.log(`   - Company: ${foundUserClient.info?.name}`)
        console.log(`   - Devices: ${Object.keys(foundUserClient.devices || {}).length}`)
        
        // Check if this client has devices
        const deviceCount = Object.keys(foundUserClient.devices || {}).length
        if (deviceCount > 0) {
          console.log("✅ Your client structure already has devices!")
          console.log("The issue might be in the application logic.")
          console.log("\n🔧 Next steps:")
          console.log("1. Start the development server: npm run dev")
          console.log("2. Navigate to: http://localhost:3000/dashboard/client-management")
          console.log("3. Check the client status")
          return
        }
      }
    }
    
    // If we didn't find a user-specific client, let's create one
    console.log("\n4️⃣ Creating user-specific client structure...")
    
    // We need to get the actual UID. For now, let's create a placeholder
    // You'll need to provide your actual UID from Firebase Console
    console.log("To complete the migration, you need to:")
    console.log("1. Go to Firebase Console > Authentication")
    console.log("2. Find user: manamimaity2002@gmail.com")
    console.log("3. Copy the UID")
    console.log("4. Update this script with your UID")
    
    // For demonstration, let's create a structure with a placeholder UID
    const placeholderUid = "manamimaity2002-user"
    console.log(`\nCreating structure with placeholder UID: ${placeholderUid}`)
    
    if (legacySnapshot.exists()) {
      const legacyData = legacySnapshot.val()
      
      const newClientStructure = {
        info: {
          name: legacyData.info?.name || "Migrated Company",
          userId: placeholderUid,
          userEmail: userEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          migratedFrom: "TyWRS0Zyusc3tbtcU0PcBPdXSjb2",
          migrationDate: new Date().toISOString()
        },
        devices: legacyData.devices || {}
      }
      
      const newClientRef = ref(database, `Clients/${placeholderUid}`)
      await set(newClientRef, newClientStructure)
      
      console.log("✅ Created placeholder client structure!")
      console.log("⚠️  IMPORTANT: This is a placeholder. You need to:")
      console.log("1. Get your real UID from Firebase Console")
      console.log("2. Replace 'manamimaity2002-user' with your actual UID")
      console.log("3. Or use the web interface to migrate properly")
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message)
    console.error("Stack trace:", error.stack)
  }
}

// Manual migration instructions
function showManualInstructions() {
  console.log("\n📋 MANUAL MIGRATION INSTRUCTIONS:")
  console.log("==================================")
  console.log("\n1. Go to Firebase Console > Authentication")
  console.log("2. Find user: manamimaity2002@gmail.com")
  console.log("3. Copy the UID (it looks like: abc123def456...)")
  console.log("4. Go to Firebase Console > Realtime Database")
  console.log("5. Navigate to: Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2")
  console.log("6. Copy the entire structure")
  console.log("7. Create a new path: Clients/[YOUR_ACTUAL_UID]")
  console.log("8. Paste the copied structure")
  console.log("9. Update the 'info' section:")
  console.log("   - userId: [YOUR_ACTUAL_UID]")
  console.log("   - userEmail: manamimaity2002@gmail.com")
  console.log("   - migratedFrom: TyWRS0Zyusc3tbtcU0PcBPdXSjb2")
  console.log("   - migrationDate: [current timestamp]")
  console.log("\n10. Save the changes")
  console.log("11. Start the app: npm run dev")
  console.log("12. Navigate to: http://localhost:3000/dashboard/client-management")
  console.log("13. You should now see your devices!")
}

// Run the script
if (require.main === module) {
  console.log("🚀 Find and Migrate User Data")
  console.log("=============================")
  
  if (process.argv.includes("--help")) {
    console.log("\nUsage:")
    console.log("  node scripts/find-and-migrate-user.js")
    console.log("  node scripts/find-and-migrate-user.js --manual")
    console.log("\nOptions:")
    console.log("  --manual     Show manual migration instructions")
    console.log("  --help       Show this help message")
    return
  }
  
  if (process.argv.includes("--manual")) {
    showManualInstructions()
    return
  }
  
  findAndMigrateUser()
    .then(() => {
      console.log("\n🎉 Process completed!")
      console.log("\nNext steps:")
      console.log("1. Get your actual UID from Firebase Console")
      console.log("2. Use the web interface: http://localhost:3000/dashboard/client-management")
      console.log("3. Or follow the manual migration instructions")
    })
    .catch((error) => {
      console.error("💥 Process failed:", error)
      console.log("\n💡 Try the manual migration:")
      showManualInstructions()
    })
} 