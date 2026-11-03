// A photo the person picks, redrawn on the device before anything is sent: decoded by the browser
// (a HEIC from an iPhone among what it reads), turned as the camera held it, scaled so its longest
// side is at most 1600 pixels, and drawn again as a JPEG. The host takes JPEG, and drawing it again
// keeps only the pixels: the photo's metadata, where it was taken among it, never leaves the device.

/** A photo's longest side, at most, in pixels. */
export const LONGEST = 1600

/** How a redrawn photo is encoded: JPEG, at this quality. */
const QUALITY = 0.85

/** The photo in `file`, redrawn: a JPEG's bytes, no side longer than LONGEST. */
export async function redraw(file: Blob): Promise<Uint8Array> {
  const image = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const scale = Math.min(1, LONGEST / Math.max(image.width, image.height))
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No canvas to draw the photo on.')
    context.drawImage(image, 0, 0, width, height)
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY })
    return new Uint8Array(await blob.arrayBuffer())
  } finally {
    image.close()
  }
}
