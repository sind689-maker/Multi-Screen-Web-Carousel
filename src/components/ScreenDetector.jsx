import styles from './ScreenDetector.module.css'

export default function ScreenDetector({ screens, loading, error, isSupported, onDetect }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🖥</span>
          Connected Displays
        </h2>
        <button
          className={styles.detectBtn}
          onClick={onDetect}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : (
            screens.length > 0 ? '↺ Refresh' : 'Detect Screens'
          )}
        </button>
      </div>

      {!isSupported && (
        <div className={styles.warning}>
          ⚠ Window Management API requires Chrome/Edge 100+ with HTTPS or localhost.
          Falling back to single-screen mode.
        </div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {screens.length === 0 && !loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🖥</div>
          <p>No screens detected yet.</p>
          <p className={styles.emptyHint}>Click <strong>Detect Screens</strong> to discover your monitors.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {screens.map(screen => (
            <div key={screen.id} className={`${styles.card} ${screen.isPrimary ? styles.primary : ''}`}>
              <div className={styles.cardHeader}>
                <span className={styles.screenIcon}>🖥</span>
                <div className={styles.screenLabel}>
                  {screen.label}
                  {screen.isPrimary && <span className={styles.badge}>Primary</span>}
                </div>
              </div>
              <div className={styles.specs}>
                <div className={styles.spec}>
                  <span className={styles.specLabel}>Resolution</span>
                  <span className={styles.specValue}>{screen.width} × {screen.height}</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specLabel}>Position</span>
                  <span className={styles.specValue}>({screen.availLeft}, {screen.availTop})</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specLabel}>DPR</span>
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
