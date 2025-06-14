"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, ArrowRight } from "lucide-react"

function SignupContent() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect URL from query parameters
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (password.length < minLength) {
      return "Password must be at least 6 characters long"
    }
    if (!hasUpperCase || !hasLowerCase) {
      return "Password must contain both uppercase and lowercase letters"
    }
    if (!hasNumbers) {
      return "Password must contain at least one number"
    }
    return null
  }

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return null
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate name
    if (!name.trim()) {
      setFormError("Name is required")
      return
    }

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      setFormError(emailError)
      return
    }

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      setFormError(passwordError)
      return
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const result = await signUp(email, password, name.trim())
      if (result.success) {
        // Success - user will be redirected by useEffect
        console.log("Account created successfully!")
      } else {
        // Handle specific error cases
        if (result.error?.includes("email-already-in-use")) {
          setFormError(
            "An account with this email already exists. Please try logging in instead, or use a different email address."
          )
          setEmailAlreadyExists(true)
        } else {
          setFormError(result.error || "Failed to create account")
        }
      }
    } catch (err) {
      console.error("Signup error:", err)
      setFormError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-4 w-32 h-32 relative">
            <Image src="/images/heepl-logo.png" alt="HEEPL Logo" fill className="object-contain" priority />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join HEEPL's wastewater monitoring platform
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {(formError) && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {emailAlreadyExists && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  <div className="space-y-2">
                    <p><strong>Account already exists!</strong> Here are your options:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Try logging in with your existing account</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Use a different email address</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Add a timestamp to make it unique (e.g., test-1234567890@example.com)</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/login">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Go to Login
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEmailAlreadyExists(false)
                          setFormError(null)
                          setEmail(`test-${Date.now()}@example.com`)
                        }}
                      >
                        Use Test Email
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                disabled={loading}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <div className="text-xs text-muted-foreground">
                Password must be at least 6 characters with uppercase, lowercase, and numbers
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-[#1a4e7e] hover:bg-[#153d62]" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 w-[300px]">
          <div className="flex items-center justify-center">
            <div className="relative h-16 w-16">
              <Image src="/images/heepl-logo.png" alt="HEEPL Logo" fill className="object-contain" />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Loading...
          </div>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
