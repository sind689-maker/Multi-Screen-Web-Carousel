import { useTranslation } from 'react-i18next'
import styles from './ScreenDetector.module.css'

export default function ScreenDetector({ screens, loading, error, isSupported, onDetect }) {
  const { t } = useTranslation()
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🖥</span>
          {t('connectedDisplays')}
        </h2>
        <button
          className={styles.detectBtn}
          onClick={onDetect}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : (
            screens.length > 0 ? t('refresh') : t('detectScreens')
          )}
        </button>
      </div>

      {!isSupported && (
        <div className={styles.warning}>
          {t('wmApiWarning')}
        </div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {screens.length === 0 && !loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🖥</div>
          <p>{t('noScreensYet')}</p>
          <p className={styles.emptyHint} dangerouslySetInnerHTML={{ __html: t('noScreensHint') }} />
        </div>
      ) : (
        <div className={styles.grid}>
          {screens.map(screen => (
            <div key={screen.id} className={`${styles.card} ${screen.isPrimary ? styles.primary : ''}`}>
              <div className={styles.cardHeader}>
                <span className={styles.screenIcon}>🖥</span>
                <div className={styles.screenLabel}>
                  {screen.label}
                  {screen.isPrimary && <span className={styles.badge}>{t('primary')}</span>}
                </div>
              </div>
              <div className={styles.specs}>
                <div className={styles.spec}>
                  <span className={styles.specLabel}>{t('resolution')}</span>
                  <span className={styles.specValue}>{screen.width} × {screen.height}</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specLabel}>{t('position')}</span>
                  <span className={styles.specValue}>({screen.availLeft}, {screen.availTop})</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specLabel}>{t('dpr')}</span>
                  <span className={styles.specValue}>{screen.devicePixelRatio}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
