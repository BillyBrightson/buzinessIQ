import { useEffect } from "react"

/**
 * Hook to handle global search hotkey (Ctrl+K or Cmd+K)
 */
export function useSearchHotkey(onTrigger: () => void) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
            if ((event.ctrlKey || event.metaKey) && event.key === "k") {
                event.preventDefault()
                onTrigger()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onTrigger])
}
