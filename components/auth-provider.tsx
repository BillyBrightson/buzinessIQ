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
import { storage, syncFromCloud, getRoleAssignment } from "@/lib/storage"
import { canAccess, FEATURE_PERMISSIONS } from "@/lib/rbac"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { AppRole, Branch } from "@/lib/types"

interface AuthContextType {
    user: User | null
    loading: boolean
    userRole: AppRole
    /** For sub-accounts: the admin's UID whose data they operate on. Same as user.uid for admin. */
    effectiveUid: string
    /** Currently selected branch */
    currentBranch: Branch | null
    currentBranchId: string
    setCurrentBranchId: (id: string) => void
    /** Customised permission overrides set by admin */
    permissionOverrides: Record<string, string[]>
    setPermissionOverrides: (overrides: Record<string, string[]>) => void
    /** Returns true if the current user's role has access to the given route path */
    can: (path: string) => boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState<AppRole>("admin")
    const [effectiveUid, setEffectiveUid] = useState<string>("")
    const [permissionOverrides, setPermissionOverridesState] = useState<Record<string, string[]>>({})
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
    const [currentBranchId, setCurrentBranchIdState] = useState<string>("")
    const router = useRouter()
    const pathname = usePathname()

    const can = (path: string): boolean => {
        if (userRole === "admin") return true
        const feature = FEATURE_PERMISSIONS.find(
            f => path === f.path || path.startsWith(f.path + "/")
        )
        if (!feature) return false
        const roles = permissionOverrides[feature.id] ?? feature.roles
        return roles.includes(userRole)
    }

    const setPermissionOverrides = (overrides: Record<string, string[]>) => {
        setPermissionOverridesState(overrides)
    }

    const setCurrentBranchId = (id: string) => {
        setCurrentBranchIdState(id)
        const uid = effectiveUid || user?.uid || ""
        if (uid) {
            storage.activeBranch.set(id, uid)
            const branches = storage.branches.getAll(uid)
            setCurrentBranch(branches.find(b => b.id === id) ?? null)
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const assignment = await getRoleAssignment(currentUser.uid)

                let resolvedAdminUid: string
                let resolvedRole: AppRole = "admin"

                if (assignment && assignment.isActive) {
                    resolvedRole = assignment.role as AppRole
                    resolvedAdminUid = assignment.adminUid
                    setEffectiveUid(assignment.adminUid)
                    await syncFromCloud(assignment.adminUid)
                } else {
                    resolvedAdminUid = currentUser.uid
                    setEffectiveUid(currentUser.uid)
                    await syncFromCloud(currentUser.uid)
                }

                setUserRole(resolvedRole)

                // Load permission overrides
                const overrides = storage.permissionOverrides.get(resolvedAdminUid)
                setPermissionOverridesState(overrides)

                // Resolve active branch
                const branches = storage.branches.getAll(resolvedAdminUid)

                // If store_keeper is locked to a branch, use that
                let activeBranchId = assignment?.branchId ?? ""

                if (!activeBranchId) {
                    // Try device-saved selection, else fall back to default
                    const saved = storage.activeBranch.get(resolvedAdminUid)
                    const savedBranch = branches.find(b => b.id === saved && b.isActive)
                    activeBranchId = savedBranch?.id ?? branches.find(b => b.isDefault && b.isActive)?.id ?? branches[0]?.id ?? ""
                }

                setCurrentBranchIdState(activeBranchId)
                setCurrentBranch(branches.find(b => b.id === activeBranchId) ?? null)
                if (activeBranchId) storage.activeBranch.set(activeBranchId, resolvedAdminUid)

                // Route protection
                const company = storage.company.get(resolvedAdminUid)
                if (!company) {
                    if (pathname !== "/onboarding") router.push("/onboarding")
                } else {
                    if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
                        router.push("/dashboard")
                    }
                }
            } else {
                setUserRole("admin")
                setEffectiveUid("")
                setPermissionOverridesState({})
                setCurrentBranch(null)
                setCurrentBranchIdState("")

                if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/") {
                    router.push("/login")
                }
            }

            setUser(currentUser)
            setLoading(false)
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
        <AuthContext.Provider value={{
            user, loading, userRole, effectiveUid,
            currentBranch, currentBranchId, setCurrentBranchId,
            permissionOverrides, setPermissionOverrides,
            can, signIn, signUp, signInWithGoogle, signOut
        }}>
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
