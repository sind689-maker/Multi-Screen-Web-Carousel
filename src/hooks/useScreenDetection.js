import { useState, useCallback } from 'react'

/**
 * Hook for detecting connected monitors via the Window Management API.
 */
export function useScreenDetection() {
  const [screens, setScreens] = useState([])
  const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isSupported = typeof window !== 'undefined' &&
    'getScreenDetails' in window

  const detectScreens = useCallback(async () => {
    if (!isSupported) {
      setError('Window Management API is not supported in this browser. Using current screen only.')
      // Fallback: use window.screen
      setScreens([{
        id: 'screen-0',
        label: 'Primary Display (fallback)',
        width: window.screen.width,
        height: window.screen.height,
        availLeft: window.screen.availLeft ?? 0,
        availTop: window.screen.availTop ?? 0,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        isPrimary: true,
        devicePixelRatio: window.devicePixelRatio ?? 1,
      }])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const screenDetails = await window.getScreenDetails()
      setPermissionState('granted')

      const buildScreenList = (details) =>
        details.screens.map((s, idx) => ({
          id: `screen-${idx}`,
          label: s.label || (s.isPrimary ? 'Primary Display' : `Display ${idx + 1}`),
          width: s.width,
          height: s.height,
          availLeft: s.availLeft,
          availTop: s.availTop,
          availWidth: s.availWidth,
          availHeight: s.availHeight,
          isPrimary: s.isPrimary,
          devicePixelRatio: s.devicePixelRatio ?? 1,
        }))

      setScreens(buildScreenList(screenDetails))

      // Listen for screen change events
      screenDetails.addEventListener('screenschange', () => {
        setScreens(buildScreenList(screenDetails))
      })
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setPermissionState('denied')
        setError('Window Management permission denied. Using current screen only.')
      } else {
        setError(`Screen detection failed: ${err.message}`)
      }
      // Fallback
      setScreens([{
        id: 'screen-0',
        label: 'Primary Display',
        width: window.screen.width,
        height: window.screen.height,
        availLeft: window.screen.availLeft ?? 0,
        availTop: window.screen.availTop ?? 0,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        isPrimary: true,
        devicePixelRatio: window.devicePixelRatio ?? 1,
      }])
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  return { screens, permissionState, loading, error, isSupported, detectScreens }
}
