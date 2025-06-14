"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { createClientStructure } from "@/lib/client-structure-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export function ClientStructureManager() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

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
        
        // Refresh the page after a short delay to show the updated dashboard
        setTimeout(() => {
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
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Client Structure Manager
        </CardTitle>
        <CardDescription>
          Manage your client structure in the Realtime Database. This ensures you can access live sensor data.
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
        </div>

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
              Create/Update Client Structure
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Creates a client structure in the Realtime Database</li>
            <li>Sets up device paths for live sensor data</li>
            <li>Initializes default sensor values</li>
            <li>Enables access to realtime monitoring features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 