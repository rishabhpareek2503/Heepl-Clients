"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock,
  ArrowLeft,
  Crown,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function SubscriptionPage() {
  const { user, userProfile, isSubscribed, subscribeUser, unsubscribeUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      console.log("User attempting to subscribe:", user?.email)
      const result = await subscribeUser()
      
      console.log("Subscription result:", result)
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Successfully subscribed! You now have access to all AI features including predictions and fault diagnosis.' 
        })
      } else {
        console.error("Subscription failed:", result.error)
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to subscribe. Please try again.' 
        })
      }
    } catch (error: any) {
      console.error("Unexpected error during subscription:", error)
      setMessage({ 
        type: 'error', 
        text: `An unexpected error occurred: ${error.message || 'Unknown error'}. Please try again.` 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      console.log("User attempting to unsubscribe:", user?.email)
      const result = await unsubscribeUser()
      
      console.log("Unsubscription result:", result)
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Successfully unsubscribed. You will lose access to AI features but can resubscribe anytime.' 
        })
      } else {
        console.error("Unsubscription failed:", result.error)
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to unsubscribe. Please try again.' 
        })
      }
    } catch (error: any) {
      console.error("Unexpected error during unsubscription:", error)
      setMessage({ 
        type: 'error', 
        text: `An unexpected error occurred: ${error.message || 'Unknown error'}. Please try again.` 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Features Subscription</h1>
          <p className="text-muted-foreground">
            Unlock advanced AI-powered features for your wastewater monitoring system
          </p>
        </div>
      </div>

      {/* Current Status */}
      {isSubscribed && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            <div className="flex items-center justify-between">
              <div>
                <strong>You are currently subscribed to Premium AI Features!</strong>
                <p className="text-sm mt-1">
                  You have access to all AI-powered features including predictions and fault diagnosis.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUnsubscribe}
                disabled={loading}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                {loading ? "Processing..." : "Unsubscribe"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Message Display */}
      {message && (
        <Alert className={message.type === 'success' ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Free Plan */}
        <Card className="border-2 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Free Plan
            </CardTitle>
            <CardDescription>
              Basic monitoring features for getting started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Real-time sensor monitoring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Basic data visualization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Historical data access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Basic alerts and notifications</span>
              </li>
            </ul>

            <div className="pt-4">
              <Badge variant="outline" className="w-full justify-center">
                Current Plan
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-primary/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-primary/20 to-transparent w-32 h-32 rounded-full -translate-y-16 translate-x-16"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Premium AI Features
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Powered
              </Badge>
            </CardTitle>
            <CardDescription>
              Advanced AI-powered features for intelligent monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Everything in Free Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span><strong>AI Predictions:</strong> Forecast parameter trends</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span><strong>Fault Diagnosis:</strong> Automated issue detection</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span>Advanced analytics and insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span>Predictive maintenance alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-600" />
                <span>Priority support and updates</span>
              </li>
            </ul>

            <div className="pt-4">
              {isSubscribed ? (
                <Badge variant="default" className="w-full justify-center bg-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Subscribed
                </Badge>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Detailed comparison of Free vs Premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 font-medium text-sm">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Premium</div>
            </div>
            
            <div className="space-y-2">
              {[
                { feature: "Real-time Monitoring", free: "✓", premium: "✓" },
                { feature: "Historical Data", free: "✓", premium: "✓" },
                { feature: "Basic Alerts", free: "✓", premium: "✓" },
                { feature: "AI Predictions", free: "✗", premium: "✓" },
                { feature: "Fault Diagnosis", free: "✗", premium: "✓" },
                { feature: "Predictive Maintenance", free: "✗", premium: "✓" },
                { feature: "Advanced Analytics", free: "✗", premium: "✓" },
                { feature: "Priority Support", free: "✗", premium: "✓" },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="text-sm">{item.feature}</div>
                  <div className="text-center text-sm">{item.free}</div>
                  <div className="text-center text-sm">{item.premium}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">What are AI Predictions?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              AI Predictions use machine learning to forecast future parameter values, helping you anticipate changes in water quality and treatment efficiency.
            </p>
          </div>
          <div>
            <h4 className="font-medium">How does Fault Diagnosis work?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Our AI system continuously monitors sensor data to detect anomalies and automatically diagnose potential equipment or process issues.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Yes, you can unsubscribe at any time. You'll continue to have access to premium features until the end of your billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 