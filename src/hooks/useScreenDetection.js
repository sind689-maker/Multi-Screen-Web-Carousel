import { useState, useCallback } from 'react'

/**
 * Hook for detecting connected monitors via the Window Management API.
 */
export function useScreenDetection() {
    const [screens, setScreens] = useState([])
    const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const isSupported = typeof window !== 'undefined' && 'getScreenDetails' in window

    const detectScreens = useCallback(async () => {
        if (!isSupported) {
            setError('Window Management API is not supported in this browser. Using current screen only.')
            const dpr = window.devicePixelRatio ?? 1
            // Fallback: use window.screen
            setScreens([
                {
                    id: 'screen-0',
                    label: 'Primary Display (fallback)',
                    width: window.screen.width,
                    height: window.screen.height,
                    physicalWidth: Math.round(window.screen.width * dpr),
                    physicalHeight: Math.round(window.screen.height * dpr),
                    availLeft: window.screen.availLeft ?? 0,
                    availTop: window.screen.availTop ?? 0,
                    availWidth: window.screen.availWidth,
                    availHeight: window.screen.availHeight,
                    isPrimary: true,
                    devicePixelRatio: dpr,
                },
            ])
            return
        }
        setError(null)
        setLoading(true)
        try {
            const screenDetails = await window.getScreenDetails()
            setPermissionState('granted')

            // Fetch physical pixel dimensions from Electron main process (more reliable than DPR calc)
            let electronDisplays = []
            if (window.electronAPI?.screen?.getDisplays) {
                try {
                    electronDisplays = await window.electronAPI.screen.getDisplays()
                } catch {
                    /* ignore */
                }
            }

            const buildScreenList = (details) =>
                details.screens.map((s, idx) => {
                    // Match by index — getAllDisplays() and getScreenDetails().screens share the same order
                    const elec = electronDisplays[idx]
                    return {
                        id: `screen-${idx}`,
                        label: s.label || (s.isPrimary ? 'Primary Display' : `Display ${idx + 1}`),
                        width: s.width,
                        height: s.height,
                        physicalWidth: elec?.physicalWidth ?? Math.round(s.width * (s.devicePixelRatio ?? 1)),
                        physicalHeight: elec?.physicalHeight ?? Math.round(s.height * (s.devicePixelRatio ?? 1)),
                        availLeft: s.availLeft,
                        availTop: s.availTop,
                        availWidth: s.availWidth,
                        availHeight: s.availHeight,
                        isPrimary: s.isPrimary,
                        devicePixelRatio: s.devicePixelRatio ?? 1,
                    }
                })

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
            const dpr = window.devicePixelRatio ?? 1
            setScreens([
                {
                    id: 'screen-0',
                    label: 'Primary Display',
                    width: window.screen.width,
                    height: window.screen.height,
                    physicalWidth: Math.round(window.screen.width * dpr),
                    physicalHeight: Math.round(window.screen.height * dpr),
                    availLeft: window.screen.availLeft ?? 0,
                    availTop: window.screen.availTop ?? 0,
                    availWidth: window.screen.availWidth,
                    availHeight: window.screen.availHeight,
                    isPrimary: true,
                    devicePixelRatio: dpr,
                },
            ])
        } finally {
            setLoading(false)
        }
    }, [isSupported])

    return { screens, permissionState, loading, error, isSupported, detectScreens }
}
