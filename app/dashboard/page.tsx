"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Factory,
  PlusCircle,
  RefreshCw,
  Settings,
  Zap,
  Gauge,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

import { useAuth } from "@/providers/auth-provider"
import { useRealtimeDevices } from "@/providers/realtime-device-provider"
import { LiveDataDisplay } from "@/components/live-data-display"
import { ParameterAnalysis } from "@/components/parameter-analysis"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { initDataVerification } from "@/lib/init-data-verification"
import { UserSensorDashboard } from "@/components/user-sensor-dashboard"
import { ClientStructureManager } from "@/components/client-structure-manager"
import { useClientId } from "@/hooks/use-client-id"

interface PlantStats {
  total: number
  active: number
  inactive: number
  delayed: number
}

function DashboardContent() {
  const { clientId, loading: clientIdLoading, error: clientIdError } = useClientId()

  if (clientIdLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (clientIdError || !clientId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to HEEPL Dashboard</h1>
          <p className="text-muted-foreground">
            Set up your wastewater monitoring system to get started
          </p>
        </div>
        
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm">🚀</span>
              </div>
              Get Started with Your Monitoring System
            </CardTitle>
            <CardDescription>
              To access live sensor data and monitoring features, you need to set up your client structure first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>• Real-time sensor data monitoring</li>
                <li>• Historical data analysis</li>
                <li>• Device management capabilities</li>
                <li>• Basic alerts and notifications</li>
              </ul>
            </div>
            
            <ClientStructureManager />
            
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <p><strong>Need help?</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check the <a href="/dashboard/help" className="text-blue-600 hover:underline">Help section</a> for detailed guides</li>
                <li>Contact support if you encounter any issues</li>
                <li>Your data will be isolated and secure</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <FullDashboard />
}

function FullDashboard() {
  const { user, userProfile } = useAuth()
  const { devices, company, selectedDevice, selectDevice, loading, error } = useRealtimeDevices()

  const [plantStats, setPlantStats] = useState<PlantStats>({ total: 0, active: 0, inactive: 0, delayed: 0 })
  const [refreshing, setRefreshing] = useState(false)
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize data verification once on client
  useEffect(() => {
    if (!initialized && typeof window !== "undefined") {
      initDataVerification()
      setInitialized(true)
    }
  }, [initialized])

  // Fetch plant statistics
  useEffect(() => {
    if (!user) return

    const fetchPlantStats = async () => {
      try {
        setPlantStats({
          total: devices.length,
          active: devices.filter((d) => d.status === "online").length,
          inactive: devices.filter((d) => d.status === "offline").length,
          delayed: devices.filter((d) => d.status === "maintenance").length,
        })
      } catch (err) {
        console.error("Error fetching plant statistics:", err)
      }
    }

    fetchPlantStats()
  }, [user, devices])

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Loading state
  if (loading && !plantStats.total) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight">Wastewater Monitoring Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wastewater Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analysis of wastewater treatment parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {devices.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeviceSelector(!showDeviceSelector)}
            >
              <Gauge className="mr-2 h-4 w-4" />
              Select Device
            </Button>
          )}
        </div>
      </div>

      {/* Device Selector */}
      {showDeviceSelector && devices.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Device</CardTitle>
            <CardDescription>Choose a device to monitor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <Card
                  key={device.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDevice?.id === device.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => selectDevice(device.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <Badge
                        variant={
                          device.status === "online"
                            ? "default"
                            : device.status === "maintenance"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {device.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Activity className="mr-2 h-4 w-4" />
                        Last updated: {device.lastUpdated ? new Date(device.lastUpdated).toLocaleString() : "Never"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plantStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Connected monitoring devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{plantStats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently online and transmitting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Devices</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{plantStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Offline or not responding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Mode</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{plantStats.delayed}</div>
            <p className="text-xs text-muted-foreground">
              Under maintenance or delayed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Live Data Display */}
        <div className="lg:col-span-2">
          {selectedDevice ? (
            <LiveDataDisplay deviceId={selectedDevice.id} />
          ) : devices.length > 0 ? (
            <LiveDataDisplay deviceId={devices[0].id} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Devices Available</CardTitle>
                <CardDescription>
                  No sensor devices are currently available for monitoring.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please check your device connections or contact support.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Parameter Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Parameter Analysis
              </CardTitle>
              <CardDescription>
                Real-time parameter trends and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDevice ? (
                <ParameterAnalysis deviceId={selectedDevice.id} />
              ) : devices.length > 0 ? (
                <ParameterAnalysis deviceId={devices[0].id} />
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No data available for analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Historical Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Device Settings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Alerts & Notifications
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Maintenance Schedule
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Updates</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Processing</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Normal
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alert System</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Enabled
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-8 w-64" />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
