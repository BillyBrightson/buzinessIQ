"use client"

import React from "react"
import { AISearchIsland } from "@/components/ai-search-island"
import { useAuth } from "@/components/auth-provider"

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { can } = useAuth()

  return (
    <>
      {children}
      {can("/ai-search") && <AISearchIsland />}
    </>
  )
}
