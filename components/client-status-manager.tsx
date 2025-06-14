"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useClientId } from "@/hooks/use-client-id"
import { createClientStructure } from "@/lib/client-structure-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, AlertCircle, Info, ArrowRight, Copy, Database } from "lucide-react"
import { ref, get, set } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"

export function ClientStatusManager() {
  const { user, userProfile } = useAuth()
  const { clientId, loading: clientIdLoading, error: clientIdError, isLegacyClient } = useClientId()
  const [clientData, setClientData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [legacyData, setLegacyData] = useState<any>(null)

  const fetchClientData = async () => {
    if (!clientId) return

    try {
      const clientRef = ref(realtimeDb, `Clients/${clientId}`)
      const snapshot = await get(clientRef)
      
      if (snapshot.exists()) {
        setClientData(snapshot.val())
      } else {
        setClientData(null)
      }
    } catch (error) {
      console.error("Error fetching client data:", error)
      setClientData(null)
    }
  }

  const fetchLegacyData = async () => {
    try {
      const legacyClientRef = ref(realtimeDb, `Clients/TyWRS0Zyusc3tbtcU0PcBPdXSjb2`)
      const snapshot = await get(legacyClientRef)
      
      if (snapshot.exists()) {
        setLegacyData(snapshot.val())
      } else {
        setLegacyData(null)
      }
    } catch (error) {
      console.error("Error fetching legacy data:", error)
      setLegacyData(null)
    }
  }

  useEffect(() => {
    fetchClientData()
    fetchLegacyData()
  }, [clientId])

  const handleCreateClientStructure = async () => {
    if (!user) {
      setResult({ success: false, message: "No authenticated user found" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log("Creating client structure for user:", user.uid)
      const clientResult = await createClientStructure(user.uid, userProfile?.name || "My Company")
      
      if (clientResult.success) {
        setResult({ 
          success: true, 
          message: `Client structure created successfully! Client ID: ${clientResult.clientId}` 
        })
        
        // Refresh data
        setTimeout(() => {
          fetchClientData()
          window.location.reload()
        }, 2000)
      } else {
        setResult({ 
          success: false, 
          message: `Failed to create client structure: ${clientResult.error}` 
        })
      }
    } catch (error: any) {
      console.error("Error creating client structure:", error)
      setResult({ 
        success: false, 
        message: `Error: ${error.message || "Unknown error occurred"}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMigrateFromLegacy = async () => {
    if (!user || !legacyData) {
      setResult({ success: false, message: "No legacy data found to migrate" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log("Migrating legacy data for user:", user.uid)
      
      const newClientRef = ref(realtimeDb, `Clients/${user.uid}`)
      
      const newClientStructure = {
        info: {
          name: legacyData.info?.name || userProfile?.name || "Migrated Company",
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          migratedFrom: "TyWRS0Zyusc3tbtcU0PcBPdXSjb2",
          migrationDate: new Date().toISOString()
        },
        devices: legacyData.devices || {}
      }
      
      await set(newClientRef, newClientStructure)
      
      setResult({ 
        success: true, 
        message: "Legacy data migrated successfully! You now have access to all your devices." 
      })
      
      // Refresh data
      setTimeout(() => {
        fetchClientData()
        window.location.reload()
      }, 2000)
      
    } catch (error: any) {
      console.error("Error migrating legacy data:", error)
      setResult({ 
        success: false, 
        message: `Error: ${error.message || "Unknown error occurred"}` 
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="border-2 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please log in to manage your client structure.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Client Status
          </CardTitle>
          <CardDescription>
            Current status of your client structure and data access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>User ID:</strong> {user.uid}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Client ID:</strong> {clientId || "Not set"}
            </p>
            {clientId && (
              <div className="flex items-center gap-2">
                <strong>Status:</strong>
                {isLegacyClient ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Copy className="mr-1 h-3 w-3" />
                    Legacy Client
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Personal Client
                  </Badge>
                )}
              </div>
            )}
          </div>

          {clientData && (
            <div className="space-y-2">
              <h4 className="font-medium">Current Client Data:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Company:</strong> {clientData.info?.name || "Unknown"}</p>
                <p><strong>Devices:</strong> {Object.keys(clientData.devices || {}).length}</p>
                {clientData.info?.migratedFrom && (
                  <p><strong>Migrated From:</strong> {clientData.info.migratedFrom}</p>
                )}
              </div>
            </div>
          )}

          {legacyData && !isLegacyClient && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <div className="space-y-2">
                  <p><strong>Legacy data available!</strong></p>
                  <p>We found existing data with {Object.keys(legacyData.devices || {}).length} devices that you can migrate to your personal client structure.</p>
                  <Button 
                    onClick={handleMigrateFromLegacy}
                    disabled={loading}
                    size="sm"
                    className="mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        Migrating...
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3 w-3" />
                        Migrate Legacy Data
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Manage your client structure and data access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleCreateClientStructure} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Client Structure...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Create New Client Structure
                </>
              )}
            </Button>

            <Button 
              onClick={() => {
                fetchClientData()
                fetchLegacyData()
              }}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>What these actions do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Create New:</strong> Creates a fresh client structure with default device</li>
              <li><strong>Migrate Legacy:</strong> Copies existing data from the legacy client to your personal client</li>
              <li><strong>Refresh:</strong> Updates the status display with current data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 