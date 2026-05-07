const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/avif'])

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg', '.avif'])

function isImageFile(name, type) {
    if (type && IMAGE_MIME_TYPES.has(type)) return true
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase()
    return IMAGE_EXTENSIONS.has(ext)
}

/**
 * Read all image files from a FileSystemDirectoryHandle.
 * Returns array of { name, url (object URL), file }.
 */
export async function readImagesFromDirectory(dirHandle) {
    const images = []
    for await (const [name, handle] of dirHandle) {
        if (handle.kind === 'file') {
            const file = await handle.getFile()
            if (isImageFile(name, file.type)) {
                const url = URL.createObjectURL(file)
                images.push({ name, url, size: file.size })
            }
        }
    }
    // Sort alphabetically by name
    images.sort((a, b) => a.name.localeCompare(b.name))
    return images
}

/**
 * Revoke all object URLs in an images array to free memory.
 */
export function revokeImageUrls(images) {
    images.forEach((img) => {
        if (img.url && img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url)
        }
    })
}
