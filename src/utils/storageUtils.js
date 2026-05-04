/**
 * Store slideshow configurations for cross-window access.
 * Child windows opened via window.open() can access the parent's
 * __slideshowData via window.opener.__slideshowData.
 */

const STORAGE_KEY = '__slideshowData'

/**
 * Save all screen configurations to window global for child window access.
 * @param {Array} mappings - Array of {screenId, images, duration, transition}
 */
export function saveSlideshowData(mappings) {
  window[STORAGE_KEY] = {}
  mappings.forEach(m => {
    window[STORAGE_KEY][m.screenId] = {
      images: m.images,
      duration: m.duration,
      transition: m.transition,
      folderName: m.folderName,
    }
  })
}

/**
 * Get slideshow config for a specific screen from the parent window.
 * Called from child (slideshow) windows.
 * @param {string} screenId
 */
export function getSlideshowData(screenId) {
  // Try own window first (in case of same-window fallback)
  if (window[STORAGE_KEY]?.[screenId]) {
    return window[STORAGE_KEY][screenId]
  }
  // Try parent window (opened via window.open)
  if (window.opener?.[STORAGE_KEY]?.[screenId]) {
    return window.opener[STORAGE_KEY][screenId]
  }
  return null
}
