# Photography

Drop your photos in this folder to publish them. That's the whole workflow — no config
files, no code changes.

## How to add a photo

1. Copy the image file into this directory (`src/assets/photography/`).
2. Name it like:

   ```
   YYYY-MM-DD-short-description.jpg
   ```

   - The `YYYY-MM-DD` date prefix controls ordering — photos are shown **newest first**
     (highest date at the top) on both the homepage and `/photography`.
   - The `short-description` part becomes the image's alt text (hyphens turn into spaces),
     so keep it readable and lowercase, e.g. `2026-07-05-sunset-over-the-rhine.jpg`.
   - Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.

3. Commit and push. The build automatically optimizes the image (resized `srcset` +
   AVIF/WebP) and adds it to the gallery.

## Notes

- You don't have to pre-compress images — Astro generates responsive, modern-format
  versions at build time, so upload the highest quality you have.
- The homepage shows only the most recent few; `/photography` shows everything.
