import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show a prompt to the user to refresh/reload the app
      if (confirm('New content available. Click OK to refresh.')) {
        updateSW()
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })
} 