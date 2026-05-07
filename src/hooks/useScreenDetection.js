import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Hook for detecting connected monitors via the Window Management API.
 */
export function useScreenDetection() {
    const { t } = useTranslation()
    const [screens, setScreens] = useState([])
    const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const screenDetailsRef = useRef(null)
    const screensHandlerRef = useRef(null)

    const isSupported = typeof window !== 'undefined' && 'getScreenDetails' in window

    // Clean up screenschange listener when component unmounts
    useEffect(() => {
        return () => {
            if (screenDetailsRef.current && screensHandlerRef.current) {
                screenDetailsRef.current.removeEventListener('screenschange', screensHandlerRef.current)
            }
        }
    }, [])

    const detectScreens = useCallback(async () => {
        if (!isSupported) {
            // Warning is already shown via the isSupported prop in ScreenDetector
            const dpr = window.devicePixelRatio ?? 1
            // Fallback: use window.screen
            setScreens([
                {
                    id: 'screen-0',
                    label: t('primaryDisplayFallback'),
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
                        label: s.label || (s.isPrimary ? t('primaryDisplay') : t('displayLabel', { number: idx + 1 })),
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

            // Replace old screenschange listener before adding a new one
            if (screenDetailsRef.current && screensHandlerRef.current) {
                screenDetailsRef.current.removeEventListener('screenschange', screensHandlerRef.current)
            }
            const handler = () => {
                setScreens(buildScreenList(screenDetails))
            }
            screenDetails.addEventListener('screenschange', handler)
            screenDetailsRef.current = screenDetails
            screensHandlerRef.current = handler
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setPermissionState('denied')
                setError(t('wmPermissionDenied'))
            } else {
                setError(t('screenDetectionFailed', { message: err.message }))
            }
            // Fallback
            const dpr = window.devicePixelRatio ?? 1
            setScreens([
                {
                    id: 'screen-0',
                    label: t('primaryDisplay'),
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
    }, [isSupported, t])

    return { screens, permissionState, loading, error, isSupported, detectScreens }
}
