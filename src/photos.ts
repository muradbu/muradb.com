import type { ImageMetadata } from "astro";

export type Photo = {
    src: ImageMetadata;
    alt: string;
};

// Auto-discover every image dropped into `src/assets/photography/`.
// Adding a photo is just: drop a file there + commit — no code changes needed.
const modules = import.meta.glob<{ default: ImageMetadata }>(
    "./assets/photography/*.{jpeg,jpg,png,webp,avif}",
    { eager: true },
);

// Turn a file path like ".../2026-07-05-sunset-over-the-rhine.jpg" into
// readable alt text: "sunset over the rhine".
function altFromPath(path: string): string {
    const filename = path.split("/").pop() ?? path;
    return filename
        .replace(/\.[^.]+$/, "") // strip extension
        .replace(/^\d{4}-\d{2}-\d{2}-?/, "") // strip YYYY-MM-DD date prefix
        .replace(/-/g, " ") // hyphens -> spaces
        .trim();
}

// Sort newest first: filenames are date-prefixed, so a descending sort by
// path puts the most recent photos at the top.
export const photos: Photo[] = Object.entries(modules)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([path, mod]) => ({
        src: mod.default,
        alt: altFromPath(path),
    }));
