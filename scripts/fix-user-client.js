const { initializeApp } = require("firebase/app")
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
const database = getDatabase(app)

async function fixUserClient() {
  try {
    console.log("🔧 Fixing user client structure...")
    console.log("=================================")
    
    const userUid = "VXFj9EKCcJTgUjErJDzy530FbW23" // Your actual UID
    const userEmail = "manamimaity2002@gmail.com"
    
    console.log(`👤 Fixing client for user: ${userEmail}`)
    console.log(`🆔 User UID: ${userUid}`)
    
    // Check current client structure
    console.log("\n1️⃣ Checking current client structure...")
    const userClientRef = ref(database, `Clients/${userUid}`)
    const userSnapshot = await get(userClientRef)
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val()
      console.log("✅ Current client structure found:")
      console.log(`   - Company: ${userData.info?.name || "Unknown"}`)
      console.log(`   - Devices: ${Object.keys(userData.devices || {}).length}`)
      console.log(`   - Device IDs: ${Object.keys(userData.devices || {}).join(", ")}`)
      
      // Check if devices have the correct structure
      const devices = userData.devices || {}
      const deviceIds = Object.keys(devices)
      
      console.log("\n2️⃣ Checking device structure...")
      deviceIds.forEach(deviceId => {
        const device = devices[deviceId]
        console.log(`   Device: ${deviceId}`)
        console.log(`     - Has Live data: ${!!device.Live}`)
        console.log(`     - Has History data: ${!!device.History}`)
        console.log(`     - Live data keys: ${device.Live ? Object.keys(device.Live).join(", ") : "None"}`)
      })
      
      // Check if we need to copy data from legacy
      console.log("\n3️⃣ Checking legacy data for comparison...")
      const legacyClientRef = ref(database, `Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2`)
      const legacySnapshot = await get(legacyClientRef)
      
      if (legacySnapshot.exists()) {
        const legacyData = legacySnapshot.val()
        const legacyDevices = legacyData.devices || {}
        const legacyDeviceIds = Object.keys(legacyDevices)
        
        console.log("✅ Legacy data found:")
        console.log(`   - Devices: ${legacyDeviceIds.length}`)
        console.log(`   - Device IDs: ${legacyDeviceIds.join(", ")}`)
        
        // Check if we need to copy missing data
        let needsUpdate = false
        const updatedDevices = { ...devices }
        
        legacyDeviceIds.forEach(deviceId => {
          if (!devices[deviceId]) {
            console.log(`   ⚠️  Device ${deviceId} missing from user client, copying...`)
            updatedDevices[deviceId] = legacyDevices[deviceId]
            needsUpdate = true
          } else {
            // Check if Live data is missing
            if (!devices[deviceId].Live && legacyDevices[deviceId].Live) {
              console.log(`   ⚠️  Live data missing for ${deviceId}, copying...`)
              updatedDevices[deviceId] = {
                ...updatedDevices[deviceId],
                Live: legacyDevices[deviceId].Live
              }
              needsUpdate = true
            }
            
            // Check if History data is missing
            if (!devices[deviceId].History && legacyDevices[deviceId].History) {
              console.log(`   ⚠️  History data missing for ${deviceId}, copying...`)
              updatedDevices[deviceId] = {
                ...updatedDevices[deviceId],
                History: legacyDevices[deviceId].History
              }
              needsUpdate = true
            }
          }
        })
        
        if (needsUpdate) {
          console.log("\n4️⃣ Updating client structure...")
          
          const updatedClientStructure = {
            info: {
              name: userData.info?.name || "My Company",
              userId: userUid,
              userEmail: userEmail,
              createdAt: userData.info?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastFixed: new Date().toISOString()
            },
            devices: updatedDevices
          }
          
          await set(userClientRef, updatedClientStructure)
          
          console.log("✅ Client structure updated successfully!")
          console.log(`   - Total devices: ${Object.keys(updatedDevices).length}`)
          console.log(`   - Device IDs: ${Object.keys(updatedDevices).join(", ")}`)
          
          // Verify the update
          console.log("\n5️⃣ Verifying update...")
          const verifySnapshot = await get(userClientRef)
          if (verifySnapshot.exists()) {
            const verifyData = verifySnapshot.val()
            console.log("✅ Verification successful:")
            console.log(`   - Company: ${verifyData.info?.name}`)
            console.log(`   - Devices: ${Object.keys(verifyData.devices || {}).length}`)
            console.log(`   - Last fixed: ${verifyData.info?.lastFixed}`)
          }
        } else {
          console.log("✅ Client structure is already correct!")
        }
      }
    } else {
      console.log("❌ User client structure not found!")
      console.log("Creating new client structure...")
      
      // Copy from legacy
      const legacyClientRef = ref(database, `Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2`)
      const legacySnapshot = await get(legacyClientRef)
      
      if (legacySnapshot.exists()) {
        const legacyData = legacySnapshot.val()
        
        const newClientStructure = {
          info: {
            name: legacyData.info?.name || "My Company",
            userId: userUid,
            userEmail: userEmail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            migratedFrom: "TyWRS0Zyusc3tbtcU0PcBPdXSjb2",
            migrationDate: new Date().toISOString()
          },
          devices: legacyData.devices || {}
        }
        
        await set(userClientRef, newClientStructure)
        console.log("✅ New client structure created!")
      }
    }
    
  } catch (error) {
    console.error("❌ Error fixing client:", error.message)
    console.error("Stack trace:", error.stack)
  }
}

// Run the fix
if (require.main === module) {
  console.log("🚀 Fix User Client Structure")
  console.log("============================")
  
  fixUserClient()
    .then(() => {
      console.log("\n🎉 Fix completed!")
      console.log("\nNext steps:")
      console.log("1. Start the development server: npm run dev")
      console.log("2. Navigate to: http://localhost:3000/dashboard")
      console.log("3. You should now see your devices and live data!")
    })
    .catch((error) => {
      console.error("💥 Fix failed:", error)
    })
} 