"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { Loader2, ArrowLeft, Building2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { signIn, signInWithGoogle } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            await signIn(email, password)
        } catch (err: any) {
            setError(err.message || "Failed to login. Please check your credentials.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle()
        } catch (err: any) {
            setError(err.message || "Failed to login with Google.")
        }
    }

    return (
        <div className="relative flex min-h-screen overflow-hidden">
            {/* Full-Page Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/bg.webp"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
            </div>

            {/* Content Container with max-width */}
            <div className="relative z-10 flex w-full justify-center px-6">
                <div className="flex w-full max-w-7xl">
                    {/* Left Side - Marketing Copy */}
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between py-12 pr-8 text-white">
                        {/* Logo/Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <Building2 className="h-8 w-8" />
                            <span className="text-xl font-bold">BuzinessIQ</span>
                        </Link>

                        {/* Marketing Copy */}
                        <div className="space-y-6 max-w-xl">
                            <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
                                Manage Smarter.
                                <br />
                                Build Faster.
                                <br />
                                Grow Anywhere.
                            </h1>
                            <p className="text-xl text-white/90 leading-relaxed">
                                From employee management to project tracking, our powerful platform
                                lets you work seamlessly across all your construction projects.
                            </p>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                    <span className="text-sm font-medium">Real-time Analytics</span>
                                </div>
                                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                    <span className="text-sm font-medium">Team Collaboration</span>
                                </div>
                                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                    <span className="text-sm font-medium">Secure & Reliable</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Indicator */}
                        <div className="flex gap-2">
                            <div className="w-12 h-1 bg-white rounded-full" />
                            <div className="w-12 h-1 bg-white/30 rounded-full" />
                            <div className="w-12 h-1 bg-white/30 rounded-full" />
                        </div>
                    </div>

                    {/* Right Side - Login Form Card */}
                    <div className="flex-1 flex items-center justify-center py-12 pl-0 lg:pl-8">
                        {/* Floating Login Card */}
                        <div className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-10 my-8">
                            {/* Mobile Logo */}
                            <div className="lg:hidden text-center mb-8">
                                <Link href="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                    <Building2 className="h-6 w-6" />
                                    <span className="text-lg font-bold">BuzinessIQ</span>
                                </Link>
                            </div>

                            {/* Welcome Header */}
                            <div className="text-center lg:text-left mb-8">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back!</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Log in to manage your construction projects with ease.
                                </p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                            placeholder="Input your email"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                            placeholder="Input your password"
                                        />
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                                        />
                                        <span className="text-muted-foreground">Remember Me</span>
                                    </label>
                                    <Link href="#" className="text-primary hover:text-primary/90 font-medium">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border rounded-lg text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                                    >
                                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm text-muted-foreground">Don't have an account? </span>
                                    <Link href="/signup" className="text-sm font-semibold text-primary hover:text-primary/90">
                                        Sign up here
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
