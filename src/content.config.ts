// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Define your collection(s)
const blog = defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./blog" }),
    schema: z.object({
        isDraft: z.boolean(),
        title: z.string(),
        author: z.string().default('Murad'),
        language: z.enum(["en", "nl"]),
        publishDate: z.date(),
        updatedDate: z.date().optional(),
    })
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog };