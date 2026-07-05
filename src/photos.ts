import type { ImageMetadata } from "astro";

export type Photo = {
    src: ImageMetadata;
    alt: string;
};

// Auto-discover every image dropped into `src/assets/photography/`.
// Adding a photo is just: drop a file there + commit — no code changes needed.
// Both lower- and upper-case extensions are matched (globs are case-sensitive on
// Linux, and cameras typically export uppercase `.JPG`/`.JPEG`).
const modules = import.meta.glob<{ default: ImageMetadata }>(
    [
        "./assets/photography/*.{jpeg,jpg,png,webp,avif}",
        "./assets/photography/*.{JPEG,JPG,PNG,WEBP,AVIF}",
    ],
    { eager: true },
);

// Pull the filename out of a full module path, without its extension.
function filenameOf(path: string): string {
    return (path.split("/").pop() ?? path).replace(/\.[^.]+$/, "");
}

// Turn a filename like "2026-07-05-sunset-over-the-rhine" into readable alt
// text: "sunset over the rhine". Tolerates non-zero-padded dates and falls back
// to empty (decorative) alt when the filename is only a date.
function altFromPath(path: string): string {
    return filenameOf(path)
        .replace(/^\d{4}-\d{1,2}-\d{1,2}-?/, "") // strip YYYY-M-D date prefix
        .replace(/-/g, " ") // hyphens -> spaces
        .trim();
}

// Extract a sortable timestamp from a leading YYYY-M-D date prefix (padding
// tolerant). Files without a date prefix sort last.
function dateKey(path: string): number {
    const m = filenameOf(path).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return -Infinity;
    return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// Sort newest first by date prefix, falling back to filename for ties or
// undated files.
export const photos: Photo[] = Object.entries(modules)
    .sort(([a], [b]) => dateKey(b) - dateKey(a) || b.localeCompare(a))
    .map(([path, mod]) => ({
        src: mod.default,
        alt: altFromPath(path),
    }));
