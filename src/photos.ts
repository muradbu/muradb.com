import type { ImageMetadata } from "astro";
import { join } from "node:path";
import exifr from "exifr";

export type PhotoExif = {
    camera?: string; // "Konica Minolta ALPHA-7 DIGITAL"
    lens?: string; // only present when the file records a LensModel tag
    focalLength?: string; // "50mm"
    aperture?: string; // "f/5.6"
    shutter?: string; // "1/250s"
    iso?: string; // "ISO 100"
    date?: string; // "21 June 2026"
};

export type Photo = {
    id: string;
    src: ImageMetadata;
    alt: string;
    exif?: PhotoExif;
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

function titleCase(s: string): string {
    return s
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Read EXIF from the source file at build time and pre-format the fields we
// display. Returns undefined when the file has no usable metadata (e.g. a PNG
// screenshot), so the detail page can simply omit the block.
async function exifFromPath(modulePath: string): Promise<PhotoExif | undefined> {
    // Resolve to the real source file. The glob key is relative to this module
    // (src/), so map it onto the project root — `import.meta.url` can't be used
    // here because Vite's SSR build rewrites it to the bundled chunk location.
    const basename = modulePath.split("/").pop() ?? modulePath;
    const absPath = join(process.cwd(), "src/assets/photography", basename);
    let raw: Record<string, unknown> | undefined;
    try {
        raw =
            (await exifr.parse(absPath, {
                pick: [
                    "Make",
                    "Model",
                    "LensModel",
                    "FNumber",
                    "ExposureTime",
                    "ISO",
                    "FocalLength",
                    "FocalLengthIn35mmFormat",
                    "DateTimeOriginal",
                ],
            })) ?? undefined;
    } catch {
        raw = undefined;
    }
    if (!raw) return undefined;

    const make = typeof raw.Make === "string" ? raw.Make.trim() : "";
    const model = typeof raw.Model === "string" ? raw.Model.trim() : "";
    let camera: string | undefined;
    if (make && model) {
        // Avoid "Konica Minolta KONICA MINOLTA …" when the model repeats the make.
        camera = model.toLowerCase().startsWith(make.toLowerCase())
            ? titleCase(model)
            : `${titleCase(make)} ${model}`;
    } else {
        camera = titleCase(model || make) || undefined;
    }

    const fnumber = typeof raw.FNumber === "number" ? raw.FNumber : undefined;
    const exposure =
        typeof raw.ExposureTime === "number" ? raw.ExposureTime : undefined;
    const iso = typeof raw.ISO === "number" ? raw.ISO : undefined;
    const focal =
        typeof raw.FocalLength === "number" ? raw.FocalLength : undefined;
    const lens = typeof raw.LensModel === "string" ? raw.LensModel.trim() : "";

    let date: string | undefined;
    const d = raw.DateTimeOriginal;
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
        date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }

    const exif: PhotoExif = {
        camera,
        lens: lens || undefined,
        focalLength: focal ? `${Math.round(focal)}mm` : undefined,
        aperture: fnumber ? `f/${fnumber}` : undefined,
        shutter: exposure
            ? exposure < 1
                ? `1/${Math.round(1 / exposure)}s`
                : `${exposure}s`
            : undefined,
        iso: iso ? `ISO ${iso}` : undefined,
        date,
    };

    // Drop the block entirely if nothing was extractable.
    return Object.values(exif).some(Boolean) ? exif : undefined;
}

// Sort newest first by date prefix, falling back to filename for ties or
// undated files, then attach build-time EXIF.
export const photos: Photo[] = await Promise.all(
    Object.entries(modules)
        .sort(([a], [b]) => dateKey(b) - dateKey(a) || b.localeCompare(a))
        .map(async ([path, mod]) => ({
            id: filenameOf(path),
            src: mod.default,
            alt: altFromPath(path),
            exif: await exifFromPath(path),
        })),
);
