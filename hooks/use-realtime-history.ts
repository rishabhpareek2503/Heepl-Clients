"use client"

import { useState, useEffect } from "react"
import { ref, onValue, get } from "firebase/database"
import { realtimeDb as db } from "@/lib/firebase"
import { useClientId } from "./use-client-id"

export interface HistoricalReading {
  id: string
  BOD: number
  COD: number
  Flow: number
  PH: number
  TSS: number
  Timestamp: string
  timestamp: Date
}

// Helper function to parse date strings
function parseDate(dateStr: string): Date {
  try {
    // Try to parse as ISO string first
    const isoDate = new Date(dateStr)
    if (!isNaN(isoDate.getTime())) {
      return isoDate
    }

    // Try to parse as custom format (e.g., "2024-01-15 14:30:00")
    const parts = dateStr.split(/[- :]/)
    if (parts.length >= 6) {
      const [year, month, day, hour, minute, second] = parts
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      )
    }

    // Fallback to current date
    return new Date()
  } catch (error) {
    console.error("Error parsing date:", dateStr, error)
    return new Date()
  }
}

interface UseRealtimeHistoryOptions {
  deviceId?: string
  startDate?: Date
  endDate?: Date
}

export function useRealtimeHistory({ 
  deviceId = "RPi001",
  startDate,
  endDate 
}: UseRealtimeHistoryOptions = {}) {
  const [historicalData, setHistoricalData] = useState<HistoricalReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get dynamic client ID
  const { clientId, loading: clientIdLoading, error: clientIdError } = useClientId()

  useEffect(() => {
    if (!clientId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)

    if (!db) {
      const errorMsg = "Database not initialized"
      console.error(errorMsg)
      setError(errorMsg)
      setLoading(false)
      return
    }
    
    // Use dynamic client ID instead of hardcoded one
    const path = `Clients/${clientId}/devices/${deviceId}/History`
    console.log(`Fetching historical data from path: ${path}`)
    const historyRef = ref(db, path)

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("No historical data found at the specified path")
          setHistoricalData([])
          setLoading(false)
          return
        }

        console.log("Processing historical data...")
        const data = snapshot.val()
        const readings: HistoricalReading[] = []

        // Convert the object of timestamps to an array of readings
        Object.keys(data).forEach((timestampKey) => {
          const reading = data[timestampKey]
          if (reading) {
            const timestampStr = reading.Timestamp || timestampKey.replace(/_/g, " ").replace(/-/g, ":")
            const timestamp = parseDate(timestampStr)
            
            // Skip if outside date range
            if (startDate && timestamp < startDate) return
            if (endDate && timestamp > endDate) return

            readings.push({
              id: timestampKey,
              BOD: typeof reading.BOD === "number" ? reading.BOD : 0,
              COD: typeof reading.COD === "number" ? reading.COD : 0,
              Flow: typeof reading.Flow === "number" ? reading.Flow : 0,
              PH: typeof reading.PH === "number" ? reading.PH : 0,
              TSS: typeof reading.TSS === "number" ? reading.TSS : 0,
              Timestamp: timestampStr,
              timestamp,
            })
          }
        })

        // Sort by timestamp (newest first)
        const sortedReadings = [...readings].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        console.log(`Processed ${sortedReadings.length} historical readings`)
        setHistoricalData(sortedReadings)
        setLoading(false)
      },
      (error) => {
        const errorMsg = `Error fetching historical data: ${error.message}`
        console.error(errorMsg, error)
        setError(errorMsg)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [deviceId, startDate, endDate, clientId])

  // Function to get a specific reading by timestamp
  const getReadingByTimestamp = async (timestamp: string) => {
    try {
      if (!db || !clientId) {
        console.error("Database not initialized or client ID not available")
        return null
      }
      const readingRef = ref(db, `Clients/${clientId}/devices/${deviceId}/History/${timestamp}`)
      const snapshot = await get(readingRef)

      if (snapshot.exists()) {
        const reading = snapshot.val()
        const timestampStr = reading.Timestamp || timestamp.replace(/_/g, " ").replace(/-/g, ":")
        const timestampDate = parseDate(timestampStr)
        
        // Skip if outside date range
        if (startDate && timestampDate < startDate) return null
        if (endDate && timestampDate > endDate) return null

        return {
          id: timestamp,
          BOD: typeof reading.BOD === "number" ? reading.BOD : 0,
          COD: typeof reading.COD === "number" ? reading.COD : 0,
          Flow: typeof reading.Flow === "number" ? reading.Flow : 0,
          PH: typeof reading.PH === "number" ? reading.PH : 0,
          TSS: typeof reading.TSS === "number" ? reading.TSS : 0,
          Timestamp: timestampStr,
          timestamp: timestampDate,
        }
      }
      return null
    } catch (err) {
      console.error("Error fetching specific reading:", err)
      return null
    }
  }

  return {
    historicalData,
    loading: loading || clientIdLoading,
    error: error || clientIdError,
    getReadingByTimestamp,
  }
}
