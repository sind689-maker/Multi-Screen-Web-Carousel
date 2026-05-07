import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFolderPicker } from '../hooks/useFolderPicker'
import { useScreenDetection } from '../hooks/useScreenDetection'
import FolderSelector from '../components/FolderSelector'
import ScreenDetector from '../components/ScreenDetector'
import ScreenMappingCard from '../components/ScreenMappingCard'
import SlideshowCarousel from '../components/SlideshowCarousel'
import { saveSlideshowData } from '../utils/storageUtils'
import styles from './Dashboard.module.css'

const DEFAULT_DURATION = 5
const DEFAULT_TRANSITION = 'fade'

export default function Dashboard() {
  const { t } = useTranslation()
  const {
    folders, loading: fLoading, error: fError, isSupported: fsSupported,
    pickFolder, removeFolder,
  } = useFolderPicker()

  const {
    screens, loading: sLoading, error: sError, isSupported: wmSupported,
    permissionState, detectScreens,
  } = useScreenDetection()

  // mappings: { [screenId]: { folderId, duration, transition } }
  const [mappings, setMappings] = useState({})
  const [launchErrors, setLaunchErrors] = useState([])
  const [previewScreen, setPreviewScreen] = useState(null)

  const handleMappingChange = useCallback((screenId, newMapping) => {
    setMappings(prev => ({ ...prev, [screenId]: newMapping }))
  }, [])

  // Ensure every screen has a default mapping entry
  const getMappingForScreen = (screenId) => ({
    folderId: null,
    duration: DEFAULT_DURATION,
    transition: DEFAULT_TRANSITION,
    ...mappings[screenId],
  })

  const configuredMappings = screens
    .map(s => ({ ...getMappingForScreen(s.id), screenId: s.id }))
    .filter(m => m.folderId)

  const handleLaunch = useCallback(async () => {
    setLaunchErrors([])
    const errors = []

    const toLaunch = screens
      .map(screen => {
        const m = getMappingForScreen(screen.id)
        if (!m.folderId) return null
        const folder = folders.find(f => f.id === m.folderId)
        if (!folder) return null
        return {
          screenId: screen.id,
          screen,
          folder,
          images: folder.images,
          duration: m.duration,
          transition: m.transition,
          folderName: folder.name,
        }
      })
      .filter(Boolean)

    if (toLaunch.length === 0) {
      setLaunchErrors([t('noMappingError')])
      return
    }

    // Store data so child windows can access it via window.opener
    saveSlideshowData(toLaunch)

    const baseUrl = `${window.location.origin}${window.location.pathname}`

    for (const item of toLaunch) {
      const { screen, screenId } = item
      const url = `${baseUrl}#/slideshow?screen=${encodeURIComponent(screenId)}`

      // Build window features with screen position & size
      const features = [
        `left=${screen.availLeft}`,
        `top=${screen.availTop}`,
        `width=${screen.availWidth}`,
        `height=${screen.availHeight}`,
        'toolbar=no',
        'location=no',
        'menubar=no',
        'status=no',
        'scrollbars=no',
        'resizable=yes',
      ].join(',')

      const win = window.open(url, `slideshow-${screenId}`, features)
      if (!win) {
        errors.push(t('popupBlockedError', { label: screen.label }))
      }
    }

    if (errors.length > 0) {
      setLaunchErrors(errors)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screens, folders, mappings, t])

  const previewMapping = previewScreen ? getMappingForScreen(previewScreen) : null
  const previewFolder = previewMapping?.folderId
    ? folders.find(f => f.id === previewMapping.folderId)
    : null

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎠</span>
          <div>
            <h1 className={styles.logoTitle}>{t('appTitle')}</h1>
            <span className={styles.logoSub}>{t('appSubtitle')}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.apiStatus}>
            <span className={`${styles.dot} ${fsSupported ? styles.dotGreen : styles.dotRed}`} />
            <span>{t('fileSystemApi')}</span>
          </div>
          <div className={styles.apiStatus}>
            <span className={`${styles.dot} ${wmSupported ? styles.dotGreen : styles.dotRed}`} />
            <span>{t('windowManagementApi')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className={styles.body}>
        {/* Left panel */}
        <aside className={styles.sidebar}>
          <section className={styles.section}>
            <FolderSelector
              folders={folders}
              loading={fLoading}
              error={fError}
              isSupported={fsSupported}
              onPickFolder={pickFolder}
              onRemoveFolder={removeFolder}
            />
          </section>
          <section className={styles.section}>
            <ScreenDetector
              screens={screens}
              loading={sLoading}
              error={sError}
              isSupported={wmSupported}
              permissionState={permissionState}
              onDetect={detectScreens}
            />
          </section>
        </aside>

        {/* Main panel */}
        <main className={styles.main}>
          <div className={styles.mainHeader}>
            <h2 className={styles.mainTitle}>
              <span>🗺</span> {t('screenMapping')}
            </h2>
            {screens.length > 0 && (
              <span className={styles.mainSub}>
                {t('screensConfigured', { configured: configuredMappings.length, total: screens.length, plural: screens.length !== 1 ? 's' : '' })}
              </span>
            )}
          </div>

          {screens.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🖥</div>
              <h3>{t('noScreensDetected')}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('noScreensDetectedHint') }} />
            </div>
          ) : (
            <div className={styles.mappingGrid}>
              {screens.map(screen => (
                <ScreenMappingCard
                  key={screen.id}
                  screen={screen}
                  folders={folders}
                  mapping={getMappingForScreen(screen.id)}
                  onMappingChange={handleMappingChange}
                />
              ))}
            </div>
          )}

          {/* Preview Section */}
          {screens.length > 0 && (
            <div className={styles.previewSection}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>
                  <span>👁</span> {t('livePreview')}
                </h3>
                {screens.length > 0 && (
                  <div className={styles.previewTabs}>
                    {screens.map(s => (
                      <button
                        key={s.id}
                        className={`${styles.previewTab} ${previewScreen === s.id ? styles.activeTab : ''}`}
                        onClick={() => setPreviewScreen(prev => prev === s.id ? null : s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {previewScreen && (
                <div className={styles.previewWindow}>
                  {previewFolder ? (
                    <SlideshowCarousel
                      images={previewFolder.images}
                      duration={previewMapping.duration}
                      transition={previewMapping.transition}
                      showControls
                    />
                  ) : (
                    <div className={styles.previewEmpty}>
                      <span>{t('noFolderAssigned')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Launch errors */}
          {launchErrors.length > 0 && (
            <div className={styles.errorBox}>
              {launchErrors.map((e, i) => (
                <div key={i}>⚠ {e}</div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer / Launch bar */}
      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          {configuredMappings.length > 0 ? (
            <span className={styles.readyText}>
              {t('readyToLaunch', { count: configuredMappings.length, plural: configuredMappings.length !== 1 ? 's' : '' })}
            </span>
          ) : (
            <span className={styles.notReadyText}>
              {t('configureFirst')}
            </span>
          )}
        </div>
        <button
          className={`${styles.launchBtn} ${configuredMappings.length > 0 ? styles.launchBtnReady : ''}`}
          onClick={handleLaunch}
          disabled={configuredMappings.length === 0}
        >
          {t('launchSlideshows')}
        </button>
      </footer>
    </div>
  )
}

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const toggle = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }
  return (
    <button className={styles.langBtn} onClick={toggle} title="Switch language">
      {i18n.language === 'zh' ? t('langEn') : t('langZh')}
    </button>
  )
}
