"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { getClientIdForUser } from "@/lib/client-structure-service"
import { ref, get } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"

export function useClientId() {
  const { user } = useAuth()
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLegacyClient, setIsLegacyClient] = useState(false)

  useEffect(() => {
    if (!user) {
      setClientId(null)
      setLoading(false)
      return
    }

    const fetchClientId = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First, check if user has a client structure under their UID
        const userClientRef = ref(realtimeDb, `Clients/${user.uid}`)
        const userClientSnapshot = await get(userClientRef)
        
        if (userClientSnapshot.exists()) {
          console.log("Found client structure for user UID:", user.uid)
          setClientId(user.uid)
          setIsLegacyClient(false)
          setLoading(false)
          return
        }
        
        // For new users, check if they should use legacy client ID (only for specific users)
        // This should be a whitelist approach, not a fallback for all users
        const legacyUsers = ["manamimaity2002@gmail.com"] // Add specific users who need legacy access
        if (legacyUsers.includes(user.email || "")) {
          const legacyClientId = "TyWRS0Zyusc3tbtcU0PcBPdXSjb2"
          const legacyClientRef = ref(realtimeDb, `Clients/${legacyClientId}`)
          const legacyClientSnapshot = await get(legacyClientRef)
          
          if (legacyClientSnapshot.exists()) {
            console.log("Found legacy client structure for whitelisted user:", user.email)
            setClientId(legacyClientId)
            setIsLegacyClient(true)
            setLoading(false)
            return
          }
        }
        
        // For new users, don't automatically create or assign client structure
        // Let them set it up manually through the dashboard
        console.log("No client structure found for new user:", user.email)
        setClientId(null)
        setIsLegacyClient(false)
        setError("No client structure found. Please set up your client structure.")
        
      } catch (err) {
        console.error("Error fetching client ID:", err)
        setError("Failed to fetch client ID")
        setClientId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchClientId()
  }, [user])

  return {
    clientId,
    loading,
    error,
    isLegacyClient,
    // Helper function to get the full path for a device
    getDevicePath: (deviceId: string, dataType: 'Live' | 'History' = 'Live') => {
      if (!clientId) return null
      return `Clients/${clientId}/devices/${deviceId}/${dataType}`
    }
  }
} 