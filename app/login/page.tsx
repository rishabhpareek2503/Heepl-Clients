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

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const { signIn, user, error, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect URL from query parameters
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess && user && !authLoading) {
      router.push(redirectTo)
    }
  }, [loginSuccess, user, authLoading, router, redirectTo])

  // Handle redirect if already logged in
  useEffect(() => {
    if (user && !authLoading && !loginSuccess) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo, loginSuccess])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        setLoginSuccess(true)
        // The redirect will be handled by the useEffect above
      }
    } catch (err) {
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 w-[300px]">
          <div className="flex items-center justify-center">
            <div className="relative h-16 w-16">
              <Image src="/images/heepl-logo.png" alt="HEEPL Logo" fill className="object-contain" />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Initializing authentication...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-4 w-32 h-32 relative">
            <Image src="/images/heepl-logo.png" alt="HEEPL Logo" fill className="object-contain" priority />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your wastewater monitoring dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-[#1a4e7e] hover:bg-[#153d62]" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                Create account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  )
}
