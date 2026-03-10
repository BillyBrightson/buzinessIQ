"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    type User
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { storage } from "@/lib/storage"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)

            // Route protection logic
            if (!currentUser) {
                if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/") {
                    router.push("/login")
                }
            } else {
                // Check if user has completed onboarding
                const company = storage.company.get(currentUser.uid)

                if (!company) {
                    if (pathname !== "/onboarding") {
                        router.push("/onboarding")
                    }
                } else {
                    if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
                        router.push("/dashboard")
                    }
                }
            }
        })


        return () => unsubscribe()
    }, [pathname, router])

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
        router.push("/dashboard")
    }

    const signUp = async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password)
        router.push("/dashboard")
    }

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        router.push("/dashboard")
    }

    const signOut = async () => {
        await firebaseSignOut(auth)
        router.push("/login")
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
