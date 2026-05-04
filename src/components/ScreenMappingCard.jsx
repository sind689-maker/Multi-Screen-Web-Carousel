import { useState } from 'react'
import styles from './ScreenMappingCard.module.css'

const TRANSITIONS = [
  { value: 'fade', label: 'Fade', icon: '🌅' },
  { value: 'slide', label: 'Slide', icon: '➡' },
  { value: 'cube', label: 'Cube', icon: '🎲' },
  { value: 'flip', label: 'Flip', icon: '🔄' },
  { value: 'coverflow', label: 'Coverflow', icon: '🗂' },
]

export default function ScreenMappingCard({ screen, folders, mapping, onMappingChange }) {
  const [expanded, setExpanded] = useState(true)
  const selectedFolder = folders.find(f => f.id === mapping.folderId)

  const update = (field, value) => {
    onMappingChange(screen.id, { ...mapping, [field]: value })
  }

  return (
    <div className={`${styles.card} ${mapping.folderId ? styles.configured : ''}`}>
      <div className={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div className={styles.screenInfo}>
          <span className={styles.screenIcon}>🖥</span>
          <div>
            <span className={styles.screenName}>{screen.label}</span>
            {screen.isPrimary && <span className={styles.badge}>Primary</span>}
          </div>
          <span className={styles.resolution}>{screen.width}×{screen.height}</span>
        </div>
        <div className={styles.headerRight}>
          {mapping.folderId ? (
            <span className={styles.statusDot} title="Configured" />
          ) : (
            <span className={styles.statusDotEmpty} title="Not configured" />
          )}
          <span className={styles.chevron}>{expanded ? '▾' : '▸'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          {/* Folder Select */}
          <div className={styles.field}>
            <label className={styles.label}>Image Folder</label>
            <select
              className={styles.select}
              value={mapping.folderId || ''}
              onChange={e => update('folderId', e.target.value || null)}
            >
              <option value="">— Select a folder —</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name} ({folder.imageCount} images)
                </option>
              ))}
            </select>
            {folders.length === 0 && (
              <span className={styles.hint}>Add folders in the panel above first.</span>
            )}
          </div>

          {/* Preview thumbnails */}
          {selectedFolder && (
            <div className={styles.previewStrip}>
              {selectedFolder.images.slice(0, 5).map((img, i) => (
                <img key={i} src={img.url} alt={img.name} className={styles.thumb} />
              ))}
              {selectedFolder.images.length > 5 && (
                <span className={styles.moreImages}>+{selectedFolder.images.length - 5}</span>
              )}
            </div>
          )}

          {/* Duration */}
          <div className={styles.field}>
            <label className={styles.label}>
              Slide Duration
              <span className={styles.fieldValue}>{mapping.duration}s</span>
            </label>
            <input
              type="range"
              className={styles.range}
              min={1}
              max={30}
              step={1}
              value={mapping.duration}
              onChange={e => update('duration', Number(e.target.value))}
            />
            <div className={styles.rangeLabels}>
              <span>1s</span>
              <span>30s</span>
            </div>
          </div>

          {/* Transition */}
          <div className={styles.field}>
            <label className={styles.label}>Transition Effect</label>
            <div className={styles.transitionGrid}>
              {TRANSITIONS.map(t => (
                <button
                  key={t.value}
                  className={`${styles.transitionBtn} ${mapping.transition === t.value ? styles.active : ''}`}
                  onClick={() => update('transition', t.value)}
                >
                  <span className={styles.transitionIcon}>{t.icon}</span>
                  <span className={styles.transitionLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
