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
     (highest date at the top) on both the homepage and `/photography`. Zero-pad the month
     and day (`2026-07-05`, not `2026-7-5`) so ordering is always correct.
   - The `short-description` part becomes the image's alt text (hyphens turn into spaces),
     so keep it readable and lowercase, e.g. `2026-07-05-sunset-over-the-rhine.jpg`. It's
     optional — a bare date like `2026-07-05.jpg` works too (just no alt text).
   - Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` — **any capitalization**,
     so the uppercase `.JPG`/`.JPEG` that cameras export work as-is.

   > RAW files (e.g. Minolta `.mrw`) can't go here — browsers can't display them and the
   > optimizer can't read them. Develop your RAW in an editor and **export to JPEG** first.

3. Commit and push. The build automatically optimizes the image (resized `srcset` +
   AVIF/WebP) and adds it to the gallery.

## Notes

- You don't have to pre-compress images — Astro generates responsive, modern-format
  versions at build time, so upload the highest quality you have.
- The homepage shows only the most recent few; `/photography` shows everything.
