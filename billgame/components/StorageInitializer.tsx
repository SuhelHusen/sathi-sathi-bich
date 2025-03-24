"use client"

import { useEffect } from "react"
import { initializeStorage } from "@/utils/indexedDB"

export function StorageInitializer() {
  useEffect(() => {
    // Initialize IndexedDB and sync with localStorage
    initializeStorage().catch(console.error)

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        initializeStorage().catch(console.error)
      }
    }, 60000) // Sync every minute when online

    // Sync when coming back online
    const handleOnline = () => {
      initializeStorage().catch(console.error)
    }

    window.addEventListener("online", handleOnline)

    return () => {
      clearInterval(syncInterval)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return null
}

