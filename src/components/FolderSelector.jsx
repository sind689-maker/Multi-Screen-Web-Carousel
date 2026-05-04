import styles from './FolderSelector.module.css'

export default function FolderSelector({ folders, loading, error, isSupported, onPickFolder, onRemoveFolder }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>📁</span>
          Image Folders
        </h2>
        <button
          className={styles.addBtn}
          onClick={onPickFolder}
          disabled={loading || !isSupported}
          title={!isSupported ? 'File System Access API not supported' : 'Select a folder'}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <span>+ Add Folder</span>
          )}
        </button>
      </div>

      {!isSupported && (
        <div className={styles.warning}>
          ⚠ File System Access API requires Chrome/Edge 86+ with HTTPS or localhost.
        </div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {folders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🖼</div>
          <p>No folders added yet.</p>
          <p className={styles.emptyHint}>Click <strong>+ Add Folder</strong> to select a local image folder.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {folders.map(folder => (
            <li key={folder.id} className={styles.item}>
              <div className={styles.folderIcon}>📂</div>
              <div className={styles.folderInfo}>
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>{folder.imageCount} image{folder.imageCount !== 1 ? 's' : ''}</span>
              </div>
              {folder.images.length > 0 && (
                <div className={styles.preview}>
                  {folder.images.slice(0, 3).map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={img.name}
                      className={styles.thumb}
                    />
                  ))}
                </div>
              )}
              <button
                className={styles.removeBtn}
                onClick={() => onRemoveFolder(folder.id)}
                title="Remove folder"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
