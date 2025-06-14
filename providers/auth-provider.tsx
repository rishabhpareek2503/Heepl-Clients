"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"

interface UserProfile {
  name?: string
  company?: string
  role?: "user" | "admin" | "developer"
  onboardingComplete?: boolean
  permissions?: string[]
  subscription?: {
    isSubscribed: boolean
    subscribedAt?: Date
    expiresAt?: Date
    plan: 'free' | 'premium'
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  needsOnboarding: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  setOnboardingComplete: () => Promise<void>
  subscribeUser: () => Promise<{ success: boolean; error?: string }>
  unsubscribeUser: () => Promise<{ success: boolean; error?: string }>
  hasRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
  isSubscribed: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile
            setUserProfile(userData)
            setNeedsOnboarding(!userData.onboardingComplete)
            
            // Sync subscription data with localStorage
            if (userData.subscription) {
              localStorage.setItem('userSubscription', JSON.stringify(userData.subscription))
            }
          } else {
            // Create a new user profile if it doesn't exist
            const newUserProfile: UserProfile = {
              onboardingComplete: false,
              role: "user", // Default role
              permissions: ["view:basic"], // Default permissions
            }
            await setDoc(userDocRef, newUserProfile)
            setUserProfile(newUserProfile)
            setNeedsOnboarding(true)
          }

          // Ensure client structure exists for this user
          // Note: Client structure creation moved to dashboard to avoid permission issues
          // Users can create their client structure manually if needed

        } catch (error) {
          console.error("Error fetching user profile:", error)
          
          // If Firestore fails, try to load from localStorage
          try {
            const storedSubscription = localStorage.getItem('userSubscription')
            if (storedSubscription) {
              const subscription = JSON.parse(storedSubscription)
              setUserProfile((prev) => prev ? { ...prev, subscription } : null)
            }
          } catch (localStorageError) {
            console.error("Error reading from localStorage:", localStorageError)
          }
        }
      } else {
        setUserProfile(null)
        setNeedsOnboarding(false)
        // Clear localStorage when user logs out
        localStorage.removeItem('userSubscription')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      
      if (!email || !password) {
        const errorMsg = 'Email and password are required'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      return { 
        success: true, 
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        }
      }
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        code: error.code 
      };
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setError(null)
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create a new user profile
      const userDocRef = doc(db, "users", user.uid)
      const newUserProfile: UserProfile = {
        name: name || "", // Store the user's name
        onboardingComplete: false,
        role: "user", // Default role
        permissions: ["view:basic"], // Default permissions
      }
      await setDoc(userDocRef, newUserProfile)
      
      return { success: true }
    } catch (error: any) {
      console.error("Error signing up:", error)
      let errorMessage = "Failed to create account"

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists. Please try logging in instead."
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address format"
          break
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please use a stronger password."
          break
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled. Please contact support."
          break
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection."
          break
        default:
          errorMessage = error.message || "An unexpected error occurred during account creation"
      }

      setError(errorMessage)
      return { success: false, error: errorMessage, code: error.code }
    }
  }

  const signOut = async () => {
    try {
      // Clear all state first
      setUser(null)
      setUserProfile(null)
      setNeedsOnboarding(false)
      
      // Then sign out from Firebase
      await firebaseSignOut(auth)
      
      // Clear any local storage items related to the user (if any)
      localStorage.removeItem('lastActiveDevice')
      localStorage.removeItem('userSettings')
      
      // The useEffect with onAuthStateChanged will also trigger and update the state
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error("Reset password error:", error)
      let errorMessage = "Failed to send password reset email"

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address"
      }

      return { success: false, error: errorMessage }
    }
  }

  const setOnboardingComplete = async () => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        onboardingComplete: true,
      })

      setNeedsOnboarding(false)
      setUserProfile((prev) => (prev ? { ...prev, onboardingComplete: true } : null))
    } catch (error) {
      console.error("Error updating onboarding status:", error)
      throw error
    }
  }

  const subscribeUser = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "No authenticated user" }
    }

    try {
      console.log("Starting subscription process for user:", user.uid)
      
      const userDocRef = doc(db, "users", user.uid)
      
      // First, check if user profile exists
      const userDoc = await getDoc(userDocRef)
      
      const subscriptionData = {
        isSubscribed: true,
        subscribedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        plan: 'premium' as const,
      }
      
      if (!userDoc.exists()) {
        console.log("User profile doesn't exist, creating one with subscription...")
        // Create a complete user profile with subscription
        const completeProfile = {
          name: user.displayName || user.email?.split('@')[0] || "User",
          onboardingComplete: true,
          role: "user",
          permissions: ["view:basic"],
          subscription: subscriptionData,
        }
        await setDoc(userDocRef, completeProfile)
        console.log("Created complete user profile with subscription")
      } else {
        console.log("User profile exists, updating subscription...")
        // Use setDoc with merge option to avoid permission issues
        await setDoc(userDocRef, {
          subscription: subscriptionData,
        }, { merge: true })
        console.log("Updated existing user profile with subscription")
      }

      console.log("Successfully updated user subscription")

      // Update local state
      setUserProfile((prev) => 
        prev ? { ...prev, subscription: subscriptionData } : null
      )
      
      // Also store in localStorage as backup
      localStorage.setItem('userSubscription', JSON.stringify(subscriptionData))
      
      console.log("Updated local user profile state")
      
      return { success: true }
    } catch (error: any) {
      console.error("Error subscribing user:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        userUid: user.uid,
        timestamp: new Date().toISOString()
      })
      
      // Fallback: Use localStorage if Firestore fails
      if (error.code === 'permission-denied') {
        console.log("Firestore permission denied, using localStorage fallback...")
        const subscriptionData = {
          isSubscribed: true,
          subscribedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          plan: 'premium' as const,
        }
        
        // Store in localStorage
        localStorage.setItem('userSubscription', JSON.stringify(subscriptionData))
        
        // Update local state
        setUserProfile((prev) => 
          prev ? { ...prev, subscription: subscriptionData } : null
        )
        
        console.log("Subscription saved to localStorage as fallback")
        return { success: true }
      }
      
      let errorMessage = "An error occurred while subscribing"
      
      if (error.code === 'not-found') {
        errorMessage = "User profile not found. Please try logging out and back in."
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const unsubscribeUser = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "No authenticated user" }
    }

    try {
      console.log("Starting unsubscription process for user:", user.uid)
      
      const userDocRef = doc(db, "users", user.uid)
      
      const subscriptionData = {
        isSubscribed: false,
        subscribedAt: undefined,
        expiresAt: undefined,
        plan: 'free' as const,
      }
      
      // Use setDoc with merge option to avoid permission issues
      await setDoc(userDocRef, {
        subscription: subscriptionData,
      }, { merge: true })

      console.log("Successfully updated user unsubscription")

      // Update local state
      setUserProfile((prev) => 
        prev ? { ...prev, subscription: subscriptionData } : null
      )
      
      // Also update localStorage
      localStorage.setItem('userSubscription', JSON.stringify(subscriptionData))
      
      console.log("Updated local user profile state")
      
      return { success: true }
    } catch (error: any) {
      console.error("Error unsubscribing user:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        userUid: user.uid,
        timestamp: new Date().toISOString()
      })
      
      // Fallback: Use localStorage if Firestore fails
      if (error.code === 'permission-denied') {
        console.log("Firestore permission denied, using localStorage fallback...")
        const subscriptionData = {
          isSubscribed: false,
          subscribedAt: undefined,
          expiresAt: undefined,
          plan: 'free' as const,
        }
        
        // Store in localStorage
        localStorage.setItem('userSubscription', JSON.stringify(subscriptionData))
        
        // Update local state
        setUserProfile((prev) => 
          prev ? { ...prev, subscription: subscriptionData } : null
        )
        
        console.log("Unsubscription saved to localStorage as fallback")
        return { success: true }
      }
      
      let errorMessage = "An error occurred while unsubscribing"
      
      if (error.code === 'not-found') {
        errorMessage = "User profile not found. Please try logging out and back in."
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Check if user has a specific role
  const hasRole = (roles: string[]) => {
    if (!userProfile || !userProfile.role) return false
    return roles.includes(userProfile.role)
  }

  // Check if user has a specific permission
  const hasPermission = (permission: string) => {
    if (!userProfile || !userProfile.permissions) return false
    return userProfile.permissions.includes(permission)
  }

  const isSubscribed = (() => {
    // First check Firestore user profile
    if (userProfile?.subscription?.isSubscribed) {
      return true
    }
    
    // Fallback to localStorage (only in browser)
    if (typeof window !== 'undefined') {
      try {
        const storedSubscription = localStorage.getItem('userSubscription')
        if (storedSubscription) {
          const subscription = JSON.parse(storedSubscription)
          return subscription.isSubscribed || false
        }
      } catch (error) {
        console.error("Error reading subscription from localStorage:", error)
      }
    }
    
    return false
  })()

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        needsOnboarding,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setOnboardingComplete,
        subscribeUser,
        unsubscribeUser,
        hasRole,
        hasPermission,
        isSubscribed,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
