// lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getDatabase, connectDatabaseEmulator, type Database } from "firebase/database"

// Debug log environment variables (safely)
console.log('Firebase Environment Variables:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : 'MISSING',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
  isClient: typeof window !== 'undefined'
});

// Hardcoded Firebase configuration for development
const firebaseConfig = {
  apiKey: "AIzaSyAAYIEWR-ewTCj-i0U0BquqcCSLJYDDVdY",
  authDomain: "live-monitoring-system.firebaseapp.com",
  databaseURL: "https://live-monitoring-system-default-rtdb.firebaseio.com",
  projectId: "live-monitoring-system",
  storageBucket: "live-monitoring-system.firebasestorage.app",
  messagingSenderId: "396044271748",
  appId: "1:396044271748:web:732d8bbfc8e06b7c8582d1",
  measurementId: "G-3R13EZNEJZ"
};

// Validate required configuration
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key is missing. Please check your configuration.');
}

// Log the Firebase initialization
console.log('Initializing Firebase with project:', firebaseConfig.projectId);

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let realtimeDb: Database

// Track emulator connection status
let emulatorsConnected = false

function initializeFirebase() {
  try {
    // Initialize Firebase app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase app initialized successfully")
    } else {
      app = getApp()
      console.log("Firebase app already initialized")
    }

    // Initialize services
    auth = getAuth(app)
    db = getFirestore(app)
    realtimeDb = getDatabase(app)
    
    console.log("All Firebase services initialized successfully")

    // Use emulators in development (only on client side)
    if (typeof window !== 'undefined' && 
        process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
        !emulatorsConnected) {
      
      try {
        connectAuthEmulator(auth, "http://localhost:9099")
        connectFirestoreEmulator(db, "localhost", 8080)
        connectDatabaseEmulator(realtimeDb, "localhost", 9000)
        emulatorsConnected = true
        console.log("Firebase emulators connected")
      } catch (emulatorError: unknown) {
        const errorMessage = emulatorError instanceof Error ? emulatorError.message : 'Unknown emulator error'
        console.log("Emulators already connected or not available:", errorMessage)
      }
    }

    return true
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firebase initialization error'
    console.error("Firebase initialization error:", errorMessage)
    throw error
  }
}

// Initialize Firebase immediately
const isInitialized = initializeFirebase()

// Safe getter functions with proper error handling
export const getFirebaseAuth = () => {
  if (!isInitialized || !auth) {
    throw new Error("Firebase Auth not initialized")
  }
  return auth
}

export const getFirebaseDb = () => {
  if (!isInitialized || !db) {
    throw new Error("Firebase Firestore not initialized")
  }
  return db
}

export const getFirebaseRealtimeDb = () => {
  if (!isInitialized || !realtimeDb) {
    throw new Error("Firebase Realtime Database not initialized")
  }
  return realtimeDb
}

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!(app && auth && db && realtimeDb)
}

// Debug function to check configuration
export const debugFirebaseConfig = () => {
  console.log('Firebase Configuration Status:', {
    apiKey: firebaseConfig.apiKey ? 'SET ✅' : 'MISSING ❌',
    authDomain: firebaseConfig.authDomain ? 'SET ✅' : 'MISSING ❌',
    databaseURL: firebaseConfig.databaseURL ? 'SET ✅' : 'MISSING ❌',
    projectId: firebaseConfig.projectId ? 'SET ✅' : 'MISSING ❌',
    storageBucket: firebaseConfig.storageBucket ? 'SET ✅' : 'MISSING ❌',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'SET ✅' : 'MISSING ❌',
    appId: firebaseConfig.appId ? 'SET ✅' : 'MISSING ❌',
    measurementId: firebaseConfig.measurementId ? 'SET ✅' : 'MISSING ❌'
  })
}

// Export Firebase instances
export { app, auth, db, realtimeDb }
export type { FirebaseApp, Auth, Firestore, Database }