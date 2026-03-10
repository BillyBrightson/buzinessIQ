"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import { Loader2, Save, Building, User as UserIcon } from "lucide-react"

export default function SettingsPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    // Form States
    const [companyName, setCompanyName] = useState("")
    const [userName, setUserName] = useState("")
    const [userEmail, setUserEmail] = useState("")

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || "")
            setUserEmail(user.email || "")
            const company = storage.company.get(user.uid)
            if (company) {
                setCompanyName(company.name)
            }
        }
    }, [user])

    const handleSaveCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))

        const currentCompany = storage.company.get(user.uid)
        if (currentCompany) {
            storage.company.set({ ...currentCompany, name: companyName }, user.uid)
            setSuccessMessage("Company details saved successfully")
        }

        setIsLoading(false)
        setTimeout(() => setSuccessMessage(""), 3000)
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setIsLoading(true)

        // Simulate API call/Auth update (In a real app, update firebase profile)
        await new Promise(resolve => setTimeout(resolve, 800))

        setSuccessMessage("Profile details saved successfully (Simulation)")

        setIsLoading(false)
        setTimeout(() => setSuccessMessage(""), 3000)
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/settings" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto bg-muted/10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <TopBar />

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your company and profile preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Company Settings */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">Company Details</h2>
                                    <p className="text-sm text-muted-foreground">Update your organization information</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveCompany} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>Save Company</span>
                                </button>
                            </form>
                        </div>

                        {/* User Settings */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">User Profile</h2>
                                    <p className="text-sm text-muted-foreground">Manage your personal account</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        disabled
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>Save Profile</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-4">
                            {successMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
