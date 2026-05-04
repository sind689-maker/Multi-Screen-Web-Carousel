import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import SlideshowCarousel from '../components/SlideshowCarousel'
import { getSlideshowData } from '../utils/storageUtils'
import styles from './Slideshow.module.css'

export default function Slideshow() {
  const [searchParams] = useSearchParams()
  const screenId = searchParams.get('screen')
  const [data, setData] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

  // Try to get data from opener (parent window) or own window
  useEffect(() => {
    if (!screenId) return

    // Retry a few times since the parent may take a moment to set data
    let attempts = 0
    const maxAttempts = 20

    const tryLoad = () => {
      const slideshowData = getSlideshowData(screenId)
      if (slideshowData) {
        setData(slideshowData)
        return
      }
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(tryLoad, 200)
      }
    }

    tryLoad()
  }, [screenId])

  // Auto-hide overlay after 3s
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => setShowOverlay(false), 3000)
    return () => clearTimeout(timer)
  }, [data])

  // Request fullscreen
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
      setIsFullscreen(true)
    }
  }, [])

  useEffect(() => {
    if (data) {
      // Small delay to let the page render first
      const t = setTimeout(requestFullscreen, 300)
      return () => clearTimeout(t)
    }
  }, [data, requestFullscreen])

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Close window on Escape (when not fullscreen)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        window.close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!screenId) {
    return (
      <div className={styles.error}>
        <h2>Invalid Slideshow URL</h2>
        <p>No screen ID provided. Open this slideshow from the dashboard.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading slideshow…</p>
        <p className={styles.loadingHint}>Waiting for image data from dashboard</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <SlideshowCarousel
        images={data.images}
        duration={data.duration}
        transition={data.transition}
        showControls={false}
      />

      {/* HUD overlay */}
      {showOverlay && (
        <div className={`${styles.overlay} ${!showOverlay ? styles.overlayHidden : ''}`}>
          <div className={styles.overlayContent}>
            <div className={styles.overlayTitle}>🎠 {data.folderName}</div>
            <div className={styles.overlayMeta}>
              {data.images.length} images · {data.duration}s · {data.transition}
            </div>
            {!isFullscreen && (
              <button className={styles.fsBtn} onClick={requestFullscreen}>
                ⛶ Enter Fullscreen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Subtle controls bar on hover */}
      <div className={styles.controlBar}>
        {!isFullscreen && (
          <button className={styles.controlBtn} onClick={requestFullscreen} title="Enter fullscreen">
            ⛶ Fullscreen
          </button>
        )}
        <button className={styles.controlBtn} onClick={() => window.close()} title="Close window">
          ✕ Close
        </button>
      </div>
    </div>
  )
}
