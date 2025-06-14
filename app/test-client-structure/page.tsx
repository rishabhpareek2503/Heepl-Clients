"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useClientId } from "@/hooks/use-client-id"
import { ClientStructureManager } from "@/components/client-structure-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info, RefreshCw } from "lucide-react"
import { ref, get } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"

export default function TestClientStructurePage() {
  const { user } = useAuth()
  const { clientId, loading: clientIdLoading, error: clientIdError } = useClientId()
  const [clientStructure, setClientStructure] = useState<any>(null)
  const [loadingStructure, setLoadingStructure] = useState(false)

  const fetchClientStructure = async () => {
    if (!clientId) return

    setLoadingStructure(true)
    try {
      const clientRef = ref(realtimeDb, `Clients/${clientId}`)
      const snapshot = await get(clientRef)
      
      if (snapshot.exists()) {
        setClientStructure(snapshot.val())
      } else {
        setClientStructure(null)
      }
    } catch (error) {
      console.error("Error fetching client structure:", error)
      setClientStructure(null)
    } finally {
      setLoadingStructure(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchClientStructure()
    }
  }, [clientId])

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <Card className="border-2 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please log in to test your client structure.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Structure Test</h1>
          <p className="text-muted-foreground">
            Test and verify your client structure in the Realtime Database
          </p>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>User ID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Client ID:</strong> {clientId || "Not set"}</p>
          </CardContent>
        </Card>

        {/* Client Structure Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {clientIdLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : clientId ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Client Structure Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientIdLoading ? (
              <p>Loading client structure status...</p>
            ) : clientIdError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{clientIdError}</AlertDescription>
              </Alert>
            ) : clientId ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  Client structure exists! Client ID: {clientId}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No client structure found. Please create one below.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Client Structure Manager */}
        <ClientStructureManager />

        {/* Client Structure Details */}
        {clientId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Structure Details</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchClientStructure}
                  disabled={loadingStructure}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingStructure ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStructure ? (
                <p>Loading client structure details...</p>
              ) : clientStructure ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Client Info</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(clientStructure.info, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Devices ({Object.keys(clientStructure.devices || {}).length})</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-96">
                      {JSON.stringify(clientStructure.devices, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p>No client structure data found.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>If you don't have a client structure, click "Create/Update Client Structure" above</li>
              <li>Check the Firebase Console → Realtime Database → Clients → {user.uid}</li>
              <li>Verify that your client structure exists with devices and Live data</li>
              <li>Go to the dashboard to test live data access</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 