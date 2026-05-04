import { useState, useCallback } from 'react'
import { readImagesFromDirectory, revokeImageUrls } from '../utils/imageUtils'

/**
 * Hook for selecting image folders via the File System Access API.
 */
export function useFolderPicker() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isSupported = typeof window !== 'undefined' &&
    'showDirectoryPicker' in window

  const pickFolder = useCallback(async () => {
    if (!isSupported) {
      setError('File System Access API is not supported in this browser.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' })
      const images = await readImagesFromDirectory(dirHandle)

      if (images.length === 0) {
        setError(`No image files found in "${dirHandle.name}".`)
        setLoading(false)
        return
      }

      const newFolder = {
        id: `folder-${Date.now()}`,
        name: dirHandle.name,
        handle: dirHandle,
        images,
        imageCount: images.length,
      }
      setFolders(prev => [...prev, newFolder])
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(`Failed to read folder: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  const removeFolder = useCallback((folderId) => {
    setFolders(prev => {
      const folder = prev.find(f => f.id === folderId)
      if (folder) revokeImageUrls(folder.images)
      return prev.filter(f => f.id !== folderId)
    })
  }, [])

  return { folders, loading, error, isSupported, pickFolder, removeFolder }
}
