import { useEffect, useState } from "react"

type Shortcut = [string, () => void]

export function useGlobalShortcut(shortcuts: Shortcut[]) {
  useEffect(() => {
    let timeoutId: number | null = null

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        shortcuts.forEach(([keyCombination, action]) => {
          const [mod, key] = keyCombination.split("+")
          const isModPressed =
            mod === "mod" ? evt.ctrlKey || evt.metaKey : evt[`${mod}Key`]
          if (isModPressed && evt.key.toLowerCase() === key.toLowerCase()) {
            action()
            evt.preventDefault()
          }
        })
      }, 10)
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [shortcuts])
}

/**
 * Custom hook to manage project ID storage.
 *
 * This hook saves the project ID to both sessionStorage and localStorage.
 * This approach ensures that:
 * 1. Tabs are not synchronized (due to sessionStorage usage)
 * 2. The last selected project is remembered across browser sessions (due to localStorage usage)
 *
 * @returns {[string | null, (id: string | null) => void]} A tuple containing the current project ID and a setter function
 */
export function useProjectIdStorage() {
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    const sessionProjectId = sessionStorage.getItem("projectId")
    if (sessionProjectId) {
      setProjectId(sessionProjectId)
    } else {
      const localProjectId = localStorage.getItem("projectId")
      if (localProjectId) {
        setProjectId(localProjectId)
        sessionStorage.setItem("projectId", localProjectId)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (projectId) {
        sessionStorage.setItem("projectId", projectId)
        localStorage.setItem("projectId", projectId)
      }
    }
  }, [projectId])

  return [projectId, setProjectId] as const
}
