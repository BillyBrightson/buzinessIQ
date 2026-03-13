"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import { FEATURE_PERMISSIONS, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, getPermissionsByCategory } from "@/lib/rbac"
import type { AppRole, RoleAssignment, Branch } from "@/lib/types"
import {
    Loader2, Save, Building, User as UserIcon, Shield, Plus,
    CheckCircle2, XCircle, Eye, EyeOff, RotateCcw, MapPin, Pencil, AlertCircle
} from "lucide-react"
import { initializeApp, getApps } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

// Secondary Firebase app to create sub-accounts without signing out admin
function getSecondaryAuth() {
    const config = {
        apiKey: "AIzaSyAPCbxwhw_C4kSkCA8pABUOnYuvRgHYBoY",
        authDomain: "buildtrack-a7fca.firebaseapp.com",
        projectId: "buildtrack-a7fca",
        storageBucket: "buildtrack-a7fca.firebasestorage.app",
        messagingSenderId: "544257319732",
        appId: "1:544257319732:web:6ccd6715a6ee75d1ec7b61",
    }
    const secondaryApp = getApps().find(a => a.name === "secondary") ?? initializeApp(config, "secondary")
    return getAuth(secondaryApp)
}

const ALL_ROLES: Exclude<AppRole, "admin">[] = ["store_keeper", "accountant"]

export default function SettingsPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user, effectiveUid, permissionOverrides, setPermissionOverrides } = useAuth()
    const [activeTab, setActiveTab] = useState<"company" | "profile" | "roles" | "branches">("company")
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    // Company form
    const [companyName, setCompanyName] = useState("")

    // Profile form
    const [userName, setUserName] = useState("")
    const [userEmail, setUserEmail] = useState("")

    // Roles & Access
    const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newRole, setNewRole] = useState<Exclude<AppRole, "admin">>("store_keeper")
    const [showPassword, setShowPassword] = useState(false)
    const [createError, setCreateError] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    // Local copy of overrides for editing
    const [localOverrides, setLocalOverrides] = useState<Record<string, string[]>>({})

    // Branches state
    const MAX_BRANCHES = 3
    const [branches, setBranches] = useState<Branch[]>([])
    const [newBranchName, setNewBranchName] = useState("")
    const [newBranchAddress, setNewBranchAddress] = useState("")
    const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
    const [editBranchName, setEditBranchName] = useState("")
    const [editBranchAddress, setEditBranchAddress] = useState("")
    const [showAddBranch, setShowAddBranch] = useState(false)

    const byCategory = getPermissionsByCategory()

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || "")
            setUserEmail(user.email || "")
            const uid = effectiveUid || user.uid
            const company = storage.company.get(uid)
            if (company) setCompanyName(company.name)
            setRoleAssignments(storage.roleAssignments.getByAdmin(user.uid))
            setBranches(storage.branches.getAll(user.uid))
        }
    }, [user, effectiveUid])

    // Sync auth context overrides into local edit state
    useEffect(() => {
        setLocalOverrides(permissionOverrides)
    }, [permissionOverrides])

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg)
        setTimeout(() => setSuccessMessage(""), 3000)
    }

    const handleSaveCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setIsLoading(true)
        await new Promise(r => setTimeout(r, 600))
        const uid = effectiveUid || user.uid
        const current = storage.company.get(uid)
        if (current) {
            storage.company.set({ ...current, name: companyName }, uid)
            showSuccess("Company details saved")
        }
        setIsLoading(false)
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setIsLoading(true)
        await new Promise(r => setTimeout(r, 600))
        showSuccess("Profile saved")
        setIsLoading(false)
    }

    /** Toggle a role's access to a feature in the permissions matrix */
    const handleTogglePermission = (featureId: string, role: Exclude<AppRole, "admin">) => {
        if (!user) return
        const adminUid = user.uid

        // Get current effective roles for this feature (override or default)
        const feature = FEATURE_PERMISSIONS.find(f => f.id === featureId)!
        const currentRoles: string[] = localOverrides[featureId] ?? [...feature.roles]

        const updated = currentRoles.includes(role)
            ? currentRoles.filter(r => r !== role)
            : [...currentRoles, role]

        const newOverrides = { ...localOverrides, [featureId]: updated }
        setLocalOverrides(newOverrides)

        // Persist immediately
        storage.permissionOverrides.set(newOverrides, adminUid)
        setPermissionOverrides(newOverrides)
    }

    /** Reset a feature back to its default permissions */
    const handleResetFeature = (featureId: string) => {
        if (!user) return
        const newOverrides = { ...localOverrides }
        delete newOverrides[featureId]
        setLocalOverrides(newOverrides)
        storage.permissionOverrides.set(newOverrides, user.uid)
        setPermissionOverrides(newOverrides)
    }

    /** Check if a role has access to a feature (using local overrides) */
    const featureHasRole = (featureId: string, role: string): boolean => {
        const feature = FEATURE_PERMISSIONS.find(f => f.id === featureId)!
        const roles = localOverrides[featureId] ?? feature.roles
        return roles.includes(role)
    }

    /** Check if a feature has been customised from its default */
    const isOverridden = (featureId: string): boolean => {
        return featureId in localOverrides
    }

    const handleAddBranch = () => {
        if (!user || !newBranchName.trim()) return
        const activeBranches = branches.filter(b => b.isActive)
        if (activeBranches.length >= MAX_BRANCHES) return
        const branch: Branch = {
            id: crypto.randomUUID(),
            name: newBranchName.trim(),
            address: newBranchAddress.trim() || undefined,
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
        }
        storage.branches.add(branch, user.uid)
        setBranches(prev => [...prev, branch])
        setNewBranchName("")
        setNewBranchAddress("")
        setShowAddBranch(false)
        showSuccess(`Branch "${branch.name}" created`)
    }

    const handleSaveBranchEdit = (id: string) => {
        if (!user || !editBranchName.trim()) return
        storage.branches.update(id, { name: editBranchName.trim(), address: editBranchAddress.trim() || undefined }, user.uid)
        setBranches(prev => prev.map(b => b.id === id ? { ...b, name: editBranchName.trim(), address: editBranchAddress.trim() || undefined } : b))
        setEditingBranchId(null)
        showSuccess("Branch updated")
    }

    const handleToggleBranch = (id: string) => {
        if (!user) return
        const branch = branches.find(b => b.id === id)
        if (!branch || branch.isDefault) return
        storage.branches.update(id, { isActive: !branch.isActive }, user.uid)
        setBranches(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b))
    }

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setCreateError("")
        setIsCreating(true)
        try {
            const secondaryAuth = getSecondaryAuth()
            const cred = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword)
            const newUid = cred.user.uid
            await secondaryAuth.signOut()

            const assignment: RoleAssignment = {
                uid: newUid,
                email: newEmail,
                name: newName,
                role: newRole,
                adminUid: user.uid,
                createdAt: new Date().toISOString(),
                isActive: true,
            }

            storage.roleAssignments.add(assignment, user.uid)
            setRoleAssignments(prev => [...prev, assignment])
            setShowAddModal(false)
            setNewName("")
            setNewEmail("")
            setNewPassword("")
            setNewRole("store_keeper")
            showSuccess(`${ROLE_LABELS[newRole]} account created for ${newEmail}`)
        } catch (err: any) {
            setCreateError(err?.message ?? "Failed to create account")
        } finally {
            setIsCreating(false)
        }
    }

    const handleToggleActive = (uid: string) => {
        if (!user) return
        const assignment = roleAssignments.find(r => r.uid === uid)
        if (!assignment) return
        const updated = { isActive: !assignment.isActive }
        storage.roleAssignments.update(uid, updated, user.uid)
        setRoleAssignments(prev => prev.map(r => r.uid === uid ? { ...r, ...updated } : r))
    }

    const tabs = [
        { id: "company" as const, label: "Company Details", icon: Building },
        { id: "profile" as const, label: "User Profile", icon: UserIcon },
        { id: "roles" as const, label: "Roles & Access", icon: Shield },
        { id: "branches" as const, label: "Branches", icon: MapPin },
    ]

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/settings" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto bg-muted/10">
                <div className="p-4 md:p-8 max-w-5xl mx-auto">
                    <TopBar />

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your company, profile, and access control</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border mb-8 gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tab.id
                                        ? "border-primary text-primary bg-primary/5"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* ── Company Details ── */}
                    {activeTab === "company" && (
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Building size={22} /></div>
                                <div>
                                    <h2 className="text-lg font-semibold">Company Details</h2>
                                    <p className="text-sm text-muted-foreground">Update your organization information</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveCompany} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Company
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── User Profile ── */}
                    {activeTab === "profile" && (
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><UserIcon size={22} /></div>
                                <div>
                                    <h2 className="text-lg font-semibold">User Profile</h2>
                                    <p className="text-sm text-muted-foreground">Manage your personal account</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email Address</label>
                                    <input type="email" value={userEmail} disabled
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed" />
                                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Profile
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── Roles & Access ── */}
                    {activeTab === "roles" && (
                        <div className="space-y-8">

                            {/* Role overview cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(["admin", "store_keeper", "accountant"] as AppRole[]).map(role => (
                                    <div key={role} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[role]}`}>
                                                {ROLE_LABELS[role]}
                                            </span>
                                            {role === "admin" && (
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">You</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                                        {role !== "admin" && (
                                            <p className="text-xs text-muted-foreground mt-2 font-medium">
                                                {roleAssignments.filter(r => r.role === role && r.isActive).length} active member(s)
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Team members list */}
                            <div className="bg-card rounded-xl border border-border shadow-sm">
                                <div className="flex items-center justify-between p-5 border-b border-border">
                                    <div>
                                        <h2 className="text-base font-semibold">Team Members</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">Manage staff accounts and their roles</p>
                                    </div>
                                    <button onClick={() => setShowAddModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                                        <Plus size={16} />Add Member
                                    </button>
                                </div>

                                {roleAssignments.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Shield size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No team members yet. Add a Store Keeper or Accountant to get started.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {roleAssignments.map(member => (
                                            <div key={member.uid} className="flex items-center justify-between px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{member.name}</p>
                                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[member.role as AppRole]}`}>
                                                        {ROLE_LABELS[member.role as AppRole]}
                                                    </span>
                                                    <button onClick={() => handleToggleActive(member.uid)}
                                                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors ${member.isActive
                                                            ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:bg-green-900/20"
                                                            : "border-border text-muted-foreground hover:bg-muted"
                                                            }`}>
                                                        {member.isActive
                                                            ? <><CheckCircle2 size={13} /> Active</>
                                                            : <><XCircle size={13} /> Inactive</>}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Permissions matrix — editable */}
                            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-border flex items-start justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold">Permissions Matrix</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            Toggle access for each role. Admin always has full access.
                                            {Object.keys(localOverrides).length > 0 && (
                                                <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                                                    ({Object.keys(localOverrides).length} customised)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="text-left px-5 py-3 font-medium text-muted-foreground w-1/2">Feature</th>
                                                <th className="px-4 py-3 text-center font-medium">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS["admin"]}`}>Admin</span>
                                                </th>
                                                {ALL_ROLES.map(role => (
                                                    <th key={role} className="px-4 py-3 text-center font-medium">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                                                            {ROLE_LABELS[role]}
                                                        </span>
                                                    </th>
                                                ))}
                                                <th className="px-3 py-3 w-10" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(byCategory).map(([category, features]) => (
                                                <React.Fragment key={category}>
                                                    <tr className="bg-muted/20">
                                                        <td colSpan={5} className="px-5 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                            {category}
                                                        </td>
                                                    </tr>
                                                    {features.map(feature => (
                                                        <tr key={feature.id} className={`border-t border-border/50 hover:bg-muted/10 ${isOverridden(feature.id) ? "bg-amber-50/30 dark:bg-amber-900/5" : ""}`}>
                                                            <td className="px-5 py-3">
                                                                <p className="font-medium text-foreground">{feature.label}</p>
                                                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                                                            </td>
                                                            {/* Admin — always locked on */}
                                                            <td className="px-4 py-3 text-center">
                                                                <CheckCircle2 size={18} className="mx-auto text-green-500 opacity-50" />
                                                            </td>
                                                            {/* Toggleable roles */}
                                                            {ALL_ROLES.map(role => {
                                                                const hasAccess = featureHasRole(feature.id, role)
                                                                return (
                                                                    <td key={role} className="px-4 py-3 text-center">
                                                                        <button
                                                                            onClick={() => handleTogglePermission(feature.id, role)}
                                                                            title={hasAccess ? `Remove ${ROLE_LABELS[role]} access` : `Grant ${ROLE_LABELS[role]} access`}
                                                                            className="mx-auto block rounded-full transition-transform hover:scale-110 focus:outline-none"
                                                                        >
                                                                            {hasAccess
                                                                                ? <CheckCircle2 size={20} className="text-green-500" />
                                                                                : <XCircle size={20} className="text-muted-foreground/30 hover:text-muted-foreground/60" />
                                                                            }
                                                                        </button>
                                                                    </td>
                                                                )
                                                            })}
                                                            {/* Reset button — only shown if overridden */}
                                                            <td className="px-3 py-3 text-center">
                                                                {isOverridden(feature.id) && (
                                                                    <button
                                                                        onClick={() => handleResetFeature(feature.id)}
                                                                        title="Reset to default"
                                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                                    >
                                                                        <RotateCcw size={14} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Branches ── */}
                    {activeTab === "branches" && (
                        <div className="space-y-6 max-w-2xl">
                            <div className="bg-card rounded-xl border border-border shadow-sm">
                                <div className="flex items-center justify-between p-5 border-b border-border">
                                    <div>
                                        <h2 className="text-base font-semibold">Branches</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            Manage your store locations — max {MAX_BRANCHES} branches
                                        </p>
                                    </div>
                                    {branches.filter(b => b.isActive).length < MAX_BRANCHES && (
                                        <button
                                            onClick={() => setShowAddBranch(v => !v)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                                        >
                                            <Plus size={16} />{showAddBranch ? "Cancel" : "Add Branch"}
                                        </button>
                                    )}
                                </div>

                                {/* Add branch form */}
                                {showAddBranch && (
                                    <div className="px-5 py-4 border-b border-border bg-muted/20">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Branch Name *</label>
                                                <input
                                                    type="text" value={newBranchName}
                                                    onChange={e => setNewBranchName(e.target.value)}
                                                    placeholder="e.g. Kumasi Branch"
                                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Address (optional)</label>
                                                <input
                                                    type="text" value={newBranchAddress}
                                                    onChange={e => setNewBranchAddress(e.target.value)}
                                                    placeholder="e.g. Adum, Kumasi"
                                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddBranch}
                                                disabled={!newBranchName.trim()}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 w-fit"
                                            >
                                                <Plus size={16} />Create Branch
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Branch list */}
                                <div className="divide-y divide-border">
                                    {branches.map(branch => (
                                        <div key={branch.id} className="px-5 py-4">
                                            {editingBranchId === branch.id ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    <input
                                                        type="text" value={editBranchName}
                                                        onChange={e => setEditBranchName(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                    />
                                                    <input
                                                        type="text" value={editBranchAddress}
                                                        onChange={e => setEditBranchAddress(e.target.value)}
                                                        placeholder="Address (optional)"
                                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleSaveBranchEdit(branch.id)}
                                                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 transition-colors">
                                                            Save
                                                        </button>
                                                        <button onClick={() => setEditingBranchId(null)}
                                                            className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${branch.isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium">{branch.name}</p>
                                                                {branch.isDefault && (
                                                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Main</span>
                                                                )}
                                                                {!branch.isActive && (
                                                                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Inactive</span>
                                                                )}
                                                            </div>
                                                            {branch.address && <p className="text-xs text-muted-foreground">{branch.address}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingBranchId(branch.id)
                                                                setEditBranchName(branch.name)
                                                                setEditBranchAddress(branch.address ?? "")
                                                            }}
                                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        {!branch.isDefault && (
                                                            <button
                                                                onClick={() => handleToggleBranch(branch.id)}
                                                                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${branch.isActive
                                                                    ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:bg-green-900/20"
                                                                    : "border-border text-muted-foreground hover:bg-muted"
                                                                    }`}
                                                            >
                                                                {branch.isActive ? <><CheckCircle2 size={12} /> Active</> : <><XCircle size={12} /> Inactive</>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {branches.filter(b => b.isActive).length >= MAX_BRANCHES && (
                                    <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-border flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <AlertCircle size={15} />
                                        <p className="text-xs">Maximum of {MAX_BRANCHES} branches reached. Deactivate one to add another.</p>
                                    </div>
                                )}
                            </div>

                            {/* Staff-to-branch assignment */}
                            {roleAssignments.length > 0 && (
                                <div className="bg-card rounded-xl border border-border shadow-sm">
                                    <div className="p-5 border-b border-border">
                                        <h2 className="text-base font-semibold">Staff Branch Assignment</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">Assign staff to a specific branch — they will only see that branch's data</p>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {roleAssignments.filter(m => m.isActive).map(member => (
                                            <div key={member.uid} className="flex items-center justify-between px-5 py-3.5">
                                                <div>
                                                    <p className="text-sm font-medium">{member.name}</p>
                                                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[member.role as AppRole]}</p>
                                                </div>
                                                <select
                                                    value={member.branchId ?? ""}
                                                    onChange={e => {
                                                        const branchId = e.target.value
                                                        const branch = branches.find(b => b.id === branchId)
                                                        storage.roleAssignments.update(member.uid, {
                                                            branchId: branchId || undefined,
                                                            branchName: branch?.name
                                                        }, user!.uid)
                                                        setRoleAssignments(prev => prev.map(r =>
                                                            r.uid === member.uid ? { ...r, branchId: branchId || undefined, branchName: branch?.name } : r
                                                        ))
                                                    }}
                                                    className="text-sm px-3 py-1.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                                >
                                                    <option value="">All Branches</option>
                                                    {branches.filter(b => b.isActive).map(b => (
                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Success toast */}
                    {successMessage && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                            {successMessage}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-1">Add Team Member</h3>
                        <p className="text-sm text-muted-foreground mb-5">Create a new account with a specific role</p>

                        <form onSubmit={handleCreateMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required
                                    placeholder="e.g. Kofi Mensah"
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required
                                    placeholder="email@example.com"
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)} required minLength={6}
                                        placeholder="Min 6 characters"
                                        className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value as Exclude<AppRole, "admin">)}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none">
                                    {ALL_ROLES.map(role => (
                                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[newRole]}</p>
                            </div>

                            {createError && (
                                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{createError}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowAddModal(false); setCreateError("") }}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isCreating}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
                                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
