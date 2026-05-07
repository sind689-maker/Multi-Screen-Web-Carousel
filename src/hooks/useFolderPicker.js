import { useState, useCallback } from 'react'
import { readImagesFromDirectory, revokeImageUrls } from '../utils/imageUtils'

const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI)

/**
 * Hook for selecting image folders.
 * In Electron, uses native dialog + IPC to get the full folder path.
 * In a plain browser, falls back to the File System Access API.
 */
export function useFolderPicker() {
    const [folders, setFolders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const isSupported = isElectron || (typeof window !== 'undefined' && 'showDirectoryPicker' in window)

    const pickFolder = useCallback(async () => {
        if (!isSupported) {
            setError('File System Access API is not supported in this browser.')
            return
        }
        setError(null)
        setLoading(true)
        try {
            if (isElectron) {
                // ── Electron path ──────────────────────────────────────────────────
                const picked = await window.electronAPI.folder.showPicker()
                if (!picked) {
                    setLoading(false)
                    return
                } // user cancelled

                const images = await window.electronAPI.folder.readImages(picked.path)
                if (images.length === 0) {
                    setError(`No image files found in "${picked.name}".`)
                    setLoading(false)
                    return
                }
                const newFolder = {
                    id: `folder-${Date.now()}`,
                    name: picked.name,
                    path: picked.path,
                    images,
                    imageCount: images.length,
                }
                setFolders((prev) => [...prev, newFolder])
            } else {
                // ── Browser path ───────────────────────────────────────────────────
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
                setFolders((prev) => [...prev, newFolder])
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(`Failed to read folder: ${err.message}`)
            }
        } finally {
            setLoading(false)
        }
    }, [isSupported])

    const removeFolder = useCallback((folderId) => {
        setFolders((prev) => {
            const folder = prev.find((f) => f.id === folderId)
            if (folder) revokeImageUrls(folder.images)
            return prev.filter((f) => f.id !== folderId)
        })
    }, [])

    /**
     * Restore previously-saved folders from config (Electron only).
     * @param {Array<{id, name, path, images, imageCount}>} savedFolders
     */
    const restoreFolders = useCallback((savedFolders) => {
        setFolders(savedFolders)
    }, [])

    return { folders, loading, error, isSupported, pickFolder, removeFolder, restoreFolders }
}
