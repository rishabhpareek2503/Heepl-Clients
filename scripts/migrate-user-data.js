const { initializeApp } = require("firebase/app")
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth")
const { getDatabase, ref, get, set } = require("firebase/database")

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "heepl-wastewater-monitoring.firebaseapp.com",
  databaseURL: "https://heepl-wastewater-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "heepl-wastewater-monitoring",
  storageBucket: "heepl-wastewater-monitoring.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-ABCDEFGHIJ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

async function migrateUserData() {
  try {
    console.log("🔍 Starting user data migration...")
    
    // Sign in with the user's credentials
    const userEmail = "manamimaity2002@gmail.com"
    const userPassword = "your-password-here" // You'll need to provide this
    
    console.log(`📧 Attempting to sign in as: ${userEmail}`)
    
    // Note: In a real scenario, you would get the user's UID from Firebase Auth
    // For now, we'll use a placeholder - you'll need to replace this with the actual UID
    const userUid = "REPLACE_WITH_ACTUAL_UID" // Get this from Firebase Console > Authentication
    
    console.log(`👤 User UID: ${userUid}`)
    
    // Check if legacy data exists
    console.log("🔍 Checking for legacy data...")
    const legacyClientRef = ref(database, `Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2`)
    const legacySnapshot = await get(legacyClientRef)
    
    if (!legacySnapshot.exists()) {
      console.log("❌ No legacy data found")
      return
    }
    
    const legacyData = legacySnapshot.val()
    console.log("✅ Legacy data found:")
    console.log(`   - Company: ${legacyData.info?.name || "Unknown"}`)
    console.log(`   - Devices: ${Object.keys(legacyData.devices || {}).length}`)
    
    // Check if user already has a client structure
    console.log("🔍 Checking if user already has a client structure...")
    const userClientRef = ref(database, `Clients/${userUid}`)
    const userSnapshot = await get(userClientRef)
    
    if (userSnapshot.exists()) {
      console.log("⚠️  User already has a client structure")
      const userData = userSnapshot.val()
      console.log(`   - Current company: ${userData.info?.name || "Unknown"}`)
      console.log(`   - Current devices: ${Object.keys(userData.devices || {}).length}`)
      
      const shouldOverwrite = process.argv.includes("--overwrite")
      if (!shouldOverwrite) {
        console.log("💡 Use --overwrite flag to overwrite existing data")
        return
      }
    }
    
    // Create new client structure for the user
    console.log("🔄 Creating new client structure for user...")
    
    const newClientStructure = {
      info: {
        name: legacyData.info?.name || "Migrated Company",
        userId: userUid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFrom: "TyWRS0Zyusc3tbtcU0PcBPdXSjb2",
        migrationDate: new Date().toISOString(),
        userEmail: userEmail
      },
      devices: legacyData.devices || {}
    }
    
    await set(userClientRef, newClientStructure)
    
    console.log("✅ Migration completed successfully!")
    console.log(`   - New client ID: ${userUid}`)
    console.log(`   - Migrated devices: ${Object.keys(newClientStructure.devices).length}`)
    
    // Verify the migration
    console.log("🔍 Verifying migration...")
    const verifySnapshot = await get(userClientRef)
    if (verifySnapshot.exists()) {
      const verifyData = verifySnapshot.val()
      console.log("✅ Verification successful:")
      console.log(`   - Company: ${verifyData.info?.name}`)
      console.log(`   - Devices: ${Object.keys(verifyData.devices || {}).length}`)
      console.log(`   - Migrated from: ${verifyData.info?.migratedFrom}`)
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message)
    console.error("Stack trace:", error.stack)
  }
}

// Instructions for manual migration
function showManualInstructions() {
  console.log("\n📋 MANUAL MIGRATION INSTRUCTIONS:")
  console.log("If the automated script doesn't work, follow these steps:")
  console.log("\n1. Go to Firebase Console > Authentication")
  console.log("2. Find user: manamimaity2002@gmail.com")
  console.log("3. Copy the UID (it looks like: abc123def456...)")
  console.log("4. Go to Firebase Console > Realtime Database")
  console.log("5. Navigate to: Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2")
  console.log("6. Copy the entire structure")
  console.log("7. Create a new path: Clients/[USER_UID]")
  console.log("8. Paste the copied structure")
  console.log("9. Update the 'info' section with:")
  console.log("   - userId: [USER_UID]")
  console.log("   - migratedFrom: TyWRS0Zyusc3tbtcU0PcBPdXSjb2")
  console.log("   - migrationDate: [current timestamp]")
  console.log("   - userEmail: manamimaity2002@gmail.com")
  console.log("\n10. Save the changes")
  console.log("11. Test the application - you should now see your devices!")
}

// Run the migration
if (require.main === module) {
  console.log("🚀 User Data Migration Tool")
  console.log("==========================")
  
  if (process.argv.includes("--help")) {
    console.log("\nUsage:")
    console.log("  node scripts/migrate-user-data.js")
    console.log("  node scripts/migrate-user-data.js --overwrite")
    console.log("  node scripts/migrate-user-data.js --manual")
    console.log("\nOptions:")
    console.log("  --overwrite  Overwrite existing user data")
    console.log("  --manual     Show manual migration instructions")
    console.log("  --help       Show this help message")
    return
  }
  
  if (process.argv.includes("--manual")) {
    showManualInstructions()
    return
  }
  
  migrateUserData()
    .then(() => {
      console.log("\n🎉 Migration process completed!")
      console.log("Next steps:")
      console.log("1. Start the development server: npm run dev")
      console.log("2. Navigate to: http://localhost:3000/dashboard/client-management")
      console.log("3. You should now see your migrated data")
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error)
      console.log("\n💡 Try the manual migration:")
      showManualInstructions()
    })
} 