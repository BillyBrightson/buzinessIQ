"use client"

import React from "react"
import { AISearchIsland } from "@/components/ai-search-island"

export function SearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AISearchIsland />
    </>
  )
}
