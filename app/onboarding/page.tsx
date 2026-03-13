"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [companyName, setCompanyName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsSubmitting(true)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
            const companyId = crypto.randomUUID()
            storage.company.set(
                {
                    id: companyId,
                    userId: user.uid,
                    name: companyName,
                    createdAt: new Date().toISOString(),
                },
                user.uid,
            )

            // Create the default Main Branch
            storage.branches.add({
                id: crypto.randomUUID(),
                name: "Main Branch",
                isDefault: true,
                isActive: true,
                createdAt: new Date().toISOString(),
            }, user.uid)

            // Create initial Admin employee for the user
            storage.employees.add({
                id: crypto.randomUUID(),
                fullName: user.displayName || "Admin User",
                email: user.email || "",
                phone: "",
                role: "admin",
                isActive: true,
                ghanaCardId: "",
                hourlyRate: 0,
                joinDate: new Date().toISOString().split("T")[0],
                employmentType: "full-time",
            }, user.uid)

            router.push("/dashboard")
        } catch (error) {
            console.error("Failed to save company details", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to BuzinessIQ</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Let's get your company set up.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1">
                                Company Name
                            </label>
                            <input
                                id="companyName"
                                name="companyName"
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Acme Construction Ltd."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !companyName.trim()}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Get Started"}
                    </button>
                </form>
            </div>
        </div>
    )
}
