"use client"

import React, { useState } from "react"
import { AISearchModal } from "@/components/ai-search-modal"
import { useSearchHotkey } from "@/hooks/use-search-hotkey"

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const [searchOpen, setSearchOpen] = useState(false)

    // Global hotkey handler
    useSearchHotkey(() => setSearchOpen(true))

    // Clone children and inject onSearchOpen prop
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                onSearchOpen: () => setSearchOpen(true)
            })
        }
        return child
    })

    return (
        <>
            {childrenWithProps}
            <AISearchModal open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    )
}
