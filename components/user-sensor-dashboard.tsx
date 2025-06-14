"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useRealtimeDevices } from "@/providers/realtime-device-provider"
import { LiveDataDisplay } from "@/components/live-data-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, RefreshCw, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UserSensorDashboard() {
  const { devices, company, selectedDevice, selectDevice, loading, error } = useRealtimeDevices()
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Check authentication state
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [user, router])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sensor Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleLogout} size="sm" variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Devices</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // No devices state
  if (devices.length === 0) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sensor Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleLogout} size="sm" variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No Devices Found</CardTitle>
            <CardDescription>
              Your account ({user?.email}) doesn't have access to any sensor devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact your administrator to get access to sensor devices, or check if your email address is
              correctly associated with your devices.
            </p>
            <div className="mt-4">
              <Button onClick={() => router.push("/dashboard/client-management")}>
                Manage Client Structure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sensor Dashboard</h1>
          {company && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Company: {company.name}
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleLogout} size="sm" variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Sensor Devices</CardTitle>
          <CardDescription>
            Showing sensor data for {user?.email} • {devices.length} device{devices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length > 1 ? (
            <Tabs defaultValue={selectedDevice?.id || devices[0]?.id} className="space-y-4">
              <TabsList className="w-full">
                {devices.map((device) => (
                  <TabsTrigger
                    key={device.id}
                    value={device.id}
                    onClick={() => selectDevice(device.id)}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        device.status === 'online' ? 'bg-green-500' :
                        device.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {device.name}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {devices.map((device) => (
                <TabsContent key={device.id} value={device.id} className="space-y-4">
                  <LiveDataDisplay deviceId={device.id} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <LiveDataDisplay deviceId={devices[0]?.id || ''} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
