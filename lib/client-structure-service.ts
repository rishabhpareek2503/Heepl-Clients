import { ref, set, get } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"

export interface ClientStructure {
  clientId: string
  userId: string
  companyName: string
  devices: DeviceStructure[]
  createdAt: string
  updatedAt: string
}

export interface DeviceStructure {
  deviceId: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  lastSeen?: string
}

/**
 * Creates a basic client structure in Realtime Database for a new user
 * This simplified version doesn't require Firestore permissions
 */
export async function createClientStructure(userId: string, companyName?: string): Promise<{ success: boolean; error?: string; clientId?: string }> {
  try {
    console.log(`Creating client structure for user: ${userId}`)

    // Generate a unique client ID (using user's UID for consistency)
    const clientId = userId
    const clientName = companyName || "My Company"

    // Create a basic client structure in Realtime Database
    const clientRef = ref(realtimeDb, `Clients/${clientId}`)
    
    const clientStructure = {
      info: {
        name: clientName,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      devices: {
        "DEFAULT001": {
          info: {
            name: "Default Device",
            location: "Default Location",
            status: "offline",
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
        }
      }
    }

    // Set the client structure in Realtime Database
    await set(clientRef, clientStructure)
    
    console.log(`Client structure created successfully for user ${userId} at path: Clients/${clientId}`)
    
    return { 
      success: true, 
      clientId: clientId 
    }

  } catch (error: any) {
    console.error("Error creating client structure:", error)
    
    // Provide specific error messages based on error type
    let errorMessage = "Failed to create client structure"
    
    if (error.code === "PERMISSION_DENIED") {
      errorMessage = "Permission denied. Please check your Firebase Realtime Database rules."
    } else if (error.code === "UNAVAILABLE") {
      errorMessage = "Database unavailable. Please check your internet connection."
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

/**
 * Gets the client ID for a user
 * This replaces the hardcoded client ID with the user's actual client ID
 */
export async function getClientIdForUser(userId: string): Promise<string | null> {
  try {
    // Check if client structure exists in Realtime Database
    const clientRef = ref(realtimeDb, `Clients/${userId}`)
    const snapshot = await get(clientRef)
    
    if (snapshot.exists()) {
      return userId
    }
    
    // If not exists, try to create it
    const result = await createClientStructure(userId)
    return result.success ? result.clientId || null : null
    
  } catch (error) {
    console.error("Error getting client ID for user:", error)
    return null
  }
}

/**
 * Updates the client structure when devices are added/modified
 */
export async function updateClientStructure(userId: string, companyName?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await createClientStructure(userId, companyName)
    return result
  } catch (error: any) {
    console.error("Error updating client structure:", error)
    return { 
      success: false, 
      error: error.message || "Failed to update client structure" 
    }
  }
}

/**
 * Deletes the client structure when user is deleted
 */
export async function deleteClientStructure(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const clientRef = ref(realtimeDb, `Clients/${userId}`)
    await set(clientRef, null)
    
    console.log(`Client structure deleted for user: ${userId}`)
    return { success: true }
    
  } catch (error: any) {
    console.error("Error deleting client structure:", error)
    return { 
      success: false, 
      error: error.message || "Failed to delete client structure" 
    }
  }
} 