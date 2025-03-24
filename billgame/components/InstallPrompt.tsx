"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  useEffect(() => {
    // Check if it's an iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOSDevice(isIOS)

    // Check if already installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
    if (isInstalled) return

    // For non-iOS devices, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // For iOS devices, show a custom prompt after a delay
    if (isIOS) {
      const timer = setTimeout(() => {
        // Check if the user has already dismissed the prompt
        const hasPromptBeenShown = localStorage.getItem("installPromptShown")
        if (!hasPromptBeenShown) {
          setShowPrompt(true)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null)
    }

    // Hide the prompt regardless of outcome
    setShowPrompt(false)
    // Remember that we've shown the prompt
    localStorage.setItem("installPromptShown", "true")
  }

  const handleClose = () => {
    setShowPrompt(false)
    // Remember that we've shown the prompt
    localStorage.setItem("installPromptShown", "true")
  }

  if (!showPrompt) return null

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install Bill Harmony App</DialogTitle>
          <DialogDescription>
            {isIOSDevice ? (
              <>
                To install this app on your iOS device:
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Tap the Share button in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </>
            ) : (
              <>Install Bill Harmony on your device for a better experience and offline access.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Not Now
          </Button>
          {!isIOSDevice && (
            <Button onClick={handleInstallClick} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Install
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

