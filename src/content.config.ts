import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each post lives in its own folder: src/content/blog/YYYY-MM-DD-my-post/index.md
// Images for the post go in the same folder.
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// URL slug. Defaults to the folder name without the date.
			slug: z.string().optional(),
			heroImage: z.optional(image()),
			categories: z.array(z.string()).default([]),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			// Set on posts imported from WordPress; used to show archived comments.
			wordpressId: z.number().optional(),
		}),
});

export const collections = { blog };
