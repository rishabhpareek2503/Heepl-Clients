"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, get, onValue, off } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import { useAuth } from "./auth-provider"
import { useClientId } from "@/hooks/use-client-id"

interface Device {
  id: string
  name: string
  status: "online" | "offline" | "maintenance"
  lastUpdated?: Date
  liveData?: any
  historyData?: any
}

interface Company {
  id: string
  name: string
  userId: string
  userEmail: string
  createdAt: string
  updatedAt: string
}

interface RealtimeDeviceContextType {
  devices: Device[]
  company: Company | null
  selectedDevice: Device | null
  loading: boolean
  error: string | null
  selectDevice: (deviceId: string) => void
  refreshDevices: () => void
}

const RealtimeDeviceContext = createContext<RealtimeDeviceContextType | null>(null)

export function RealtimeDeviceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { clientId, loading: clientIdLoading, error: clientIdError } = useClientId()
  const [devices, setDevices] = useState<Device[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch devices from Realtime Database
  useEffect(() => {
    if (!user || !clientId) {
      setDevices([])
      setCompany(null)
      setSelectedDevice(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const fetchDevices = async () => {
      try {
        console.log(`Fetching devices for client: ${clientId}`)
        
        // Get client structure
        const clientRef = ref(realtimeDb, `Clients/${clientId}`)
        const clientSnapshot = await get(clientRef)
        
        if (!clientSnapshot.exists()) {
          console.log("Client structure not found")
          setError("Client structure not found. Please create a client structure first.")
          setLoading(false)
          return
        }

        const clientData = clientSnapshot.val()
        console.log("Client data:", clientData)

        // Set company info
        if (clientData.info) {
          setCompany({
            id: clientId,
            name: clientData.info.name || "My Company",
            userId: clientData.info.userId || user.uid,
            userEmail: clientData.info.userEmail || user.email || "",
            createdAt: clientData.info.createdAt || new Date().toISOString(),
            updatedAt: clientData.info.updatedAt || new Date().toISOString(),
          })
        }

        // Get devices
        const devicesData = clientData.devices || {}
        const deviceIds = Object.keys(devicesData)
        
        console.log(`Found ${deviceIds.length} devices:`, deviceIds)

        if (deviceIds.length === 0) {
          setError("No devices found in your client structure.")
          setLoading(false)
          return
        }

        const devicesList: Device[] = deviceIds.map(deviceId => {
          const deviceData = devicesData[deviceId]
          const liveData = deviceData.Live || {}
          const historyData = deviceData.History || {}
          
          // Determine device status based on live data
          let status: "online" | "offline" | "maintenance" = "offline"
          let lastUpdated: Date | undefined
          
          if (liveData && Object.keys(liveData).length > 0) {
            // Check if we have recent data (within last 10 minutes)
            const timestamp = liveData.Timestamp
            if (timestamp) {
              const dataTime = new Date(timestamp)
              const now = new Date()
              const diffMinutes = (now.getTime() - dataTime.getTime()) / (1000 * 60)
              
              if (diffMinutes < 10) {
                status = "online"
                lastUpdated = dataTime
              } else if (diffMinutes < 60) {
                status = "maintenance"
                lastUpdated = dataTime
              } else {
                status = "offline"
                lastUpdated = dataTime
              }
            }
          }

          return {
            id: deviceId,
            name: deviceId, // Use device ID as name for now
            status,
            lastUpdated,
            liveData,
            historyData,
          }
        })

        console.log("Processed devices:", devicesList)
        setDevices(devicesList)

        // Set first device as selected if none is selected
        if (devicesList.length > 0 && !selectedDevice) {
          setSelectedDevice(devicesList[0])
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching devices:", err)
        setError("Failed to load devices from database")
        setLoading(false)
      }
    }

    fetchDevices()

    // Set up real-time listener for device updates
    const clientRef = ref(realtimeDb, `Clients/${clientId}`)
    const unsubscribe = onValue(clientRef, (snapshot) => {
      if (snapshot.exists()) {
        const clientData = snapshot.val()
        const devicesData = clientData.devices || {}
        const deviceIds = Object.keys(devicesData)
        
        const devicesList: Device[] = deviceIds.map(deviceId => {
          const deviceData = devicesData[deviceId]
          const liveData = deviceData.Live || {}
          
          let status: "online" | "offline" | "maintenance" = "offline"
          let lastUpdated: Date | undefined
          
          if (liveData && Object.keys(liveData).length > 0) {
            const timestamp = liveData.Timestamp
            if (timestamp) {
              const dataTime = new Date(timestamp)
              const now = new Date()
              const diffMinutes = (now.getTime() - dataTime.getTime()) / (1000 * 60)
              
              if (diffMinutes < 10) {
                status = "online"
                lastUpdated = dataTime
              } else if (diffMinutes < 60) {
                status = "maintenance"
                lastUpdated = dataTime
              } else {
                status = "offline"
                lastUpdated = dataTime
              }
            }
          }

          return {
            id: deviceId,
            name: deviceId,
            status,
            lastUpdated,
            liveData,
            historyData: deviceData.History || {},
          }
        })

        setDevices(devicesList)
        
        // Update selected device if it still exists
        if (selectedDevice && !devicesList.find(d => d.id === selectedDevice.id)) {
          setSelectedDevice(devicesList[0] || null)
        }
      }
    }, (err) => {
      console.error("Error in real-time listener:", err)
      setError("Failed to connect to real-time updates")
    })

    return () => {
      off(clientRef, 'value', unsubscribe)
    }
  }, [user, clientId, selectedDevice])

  // Select a device
  const selectDevice = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (device) {
      setSelectedDevice(device)
    }
  }

  // Refresh devices
  const refreshDevices = () => {
    setLoading(true)
    setError(null)
    // The useEffect will handle the refresh
  }

  return (
    <RealtimeDeviceContext.Provider
      value={{
        devices,
        company,
        selectedDevice,
        loading: loading || clientIdLoading,
        error: error || clientIdError,
        selectDevice,
        refreshDevices,
      }}
    >
      {children}
    </RealtimeDeviceContext.Provider>
  )
}

export function useRealtimeDevices() {
  const context = useContext(RealtimeDeviceContext)
  if (!context) {
    throw new Error("useRealtimeDevices must be used within a RealtimeDeviceProvider")
  }
  return context
} 