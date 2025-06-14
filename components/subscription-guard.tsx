"use client"

import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Lock, 
  Brain, 
  AlertTriangle, 
  Crown, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

interface SubscriptionGuardProps {
  children: React.ReactNode
  featureName: string
  featureDescription: string
  featureIcon: React.ReactNode
}

export function SubscriptionGuard({ 
  children, 
  featureName, 
  featureDescription, 
  featureIcon 
}: SubscriptionGuardProps) {
  const { isSubscribed } = useAuth()

  if (isSubscribed) {
    return <>{children}</>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          {featureIcon}
          <h1 className="text-3xl font-bold tracking-tight">{featureName}</h1>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            Premium
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {featureDescription}
        </p>
      </div>

      {/* Locked Feature Card */}
      <Card className="max-w-2xl mx-auto border-2 border-dashed border-gray-300 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Premium Feature Locked</CardTitle>
          <CardDescription>
            This advanced AI feature requires a premium subscription to access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              {featureIcon}
              <h3 className="text-lg font-semibold">{featureName}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {featureDescription}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Advanced AI algorithms</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Real-time processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Professional insights</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium text-center">What you'll get with Premium:</h4>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span><strong>AI Predictions:</strong> Forecast parameter trends and optimize operations</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span><strong>Fault Diagnosis:</strong> Automated issue detection and root cause analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span><strong>Priority Support:</strong> Get help when you need it most</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard/subscription">
                <Crown className="mr-2 h-4 w-4" />
                Unlock Premium Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Start your 30-day premium trial • Cancel anytime
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Actions */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Explore Other Features</CardTitle>
            <CardDescription className="text-center">
              While you're here, check out these free features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-start">
                <Link href="/dashboard">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
                    </div>
                    <span className="font-medium">Live Dashboard</span>
                  </div>
                  <span className="text-sm text-muted-foreground text-left">
                    Monitor real-time sensor data and basic analytics
                  </span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-start">
                <Link href="/dashboard/history">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">📈</span>
                    </div>
                    <span className="font-medium">Historical Data</span>
                  </div>
                  <span className="text-sm text-muted-foreground text-left">
                    View past sensor readings and trends
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 