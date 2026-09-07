export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

type InstallPromptListener = (event: InstallPromptEvent | null) => void

let deferredInstallPrompt: InstallPromptEvent | null = null
let initialized = false
const listeners = new Set<InstallPromptListener>()

const notify = () => {
  listeners.forEach((listener) => listener(deferredInstallPrompt))
}

export const getDeferredInstallPrompt = () => deferredInstallPrompt

export const subscribeToInstallPrompt = (listener: InstallPromptListener) => {
  listeners.add(listener)
  listener(deferredInstallPrompt)
  return () => listeners.delete(listener)
}

export const clearDeferredInstallPrompt = (event?: InstallPromptEvent) => {
  if (!event || deferredInstallPrompt === event) {
    deferredInstallPrompt = null
    notify()
  }
}

export const initializePWA = () => {
  if (initialized) return
  initialized = true

  window.addEventListener('beforeinstallprompt', (event) => {
    // The native prompt is deferred only because this real event is retained and
    // later invoked by the visible Install NEXUS button.
    event.preventDefault()
    deferredInstallPrompt = event as InstallPromptEvent
    notify()
  })

  window.addEventListener('appinstalled', () => {
    clearDeferredInstallPrompt()
  })

  if ('serviceWorker' in navigator && window.isSecureContext) {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
      console.warn('NEXUS AI service worker registration failed.', error)
    })
  }
}
