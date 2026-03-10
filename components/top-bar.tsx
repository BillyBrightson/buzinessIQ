"use client"

import { useAuth } from "@/components/auth-provider"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, User, Settings, LogOut, Sun, Moon, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface TopBarProps {
    title?: string
}

export function TopBar({ title }: TopBarProps) {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const { setTheme, theme } = useTheme()

    return (
        <div className="w-full bg-card/50 backdrop-blur-sm rounded-full border border-blue-100 dark:border-blue-900/30 p-2 px-6 mb-8 flex items-center justify-between gap-4 shadow-sm">
            {/* Page Title Section */}
            <div className="flex flex-col justify-center">
                {title && <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>}
            </div>

            <div className="flex items-center gap-4">

                {/* Notification */}
                <button className="relative p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md active:scale-95 group">
                    <Bell size={20} fill="currentColor" className="text-white/90" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-600"></span>
                </button>

                {/* Theme Toggle Switch */}
                <button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="relative h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-between px-2 shadow-inner transition-colors focus:outline-none"
                    title="Toggle Theme"
                >
                    <Moon size={16} className={`z-10 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`} />
                    <Sun size={16} className={`z-10 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-slate-500'}`} />

                    {/* Sliding Knob */}
                    <div
                        className={`absolute top-1 left-1 h-8 w-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-spring ${theme === 'dark' ? 'translate-x-[2.5rem]' : 'translate-x-0'}`}
                    ></div>
                </button>

                {/* User Profile Pill */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 bg-background hover:bg-accent/50 border border-border/50 rounded-full py-1.5 pl-1.5 pr-4 transition-all shadow-sm outline-none active:scale-95">
                        <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User size={18} />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground hidden md:block max-w-[150px] truncate">
                                {user?.displayName || "Admin User"}
                            </span>
                            <ChevronDown size={14} className="text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
