import { type CollectionEntry, getCollection } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. Drafts show up only in `npm run dev`. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Parts of the WordPress-style URL: /YYYY/MM/DD/slug/ */
export function postParams(post: Post) {
	// The folder name starts with the date (YYYY-MM-DD-), which matches the old
	// WordPress URLs exactly regardless of time zone.
	const folder = (post.filePath ?? post.id).replace(/\\/g, '/').split('/').at(-2) ?? '';
	const m = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/.exec(folder);
	if (!m) throw new Error(`Post folder "${folder}" must be named YYYY-MM-DD-slug`);
	const [, year, month, day, folderSlug] = m;
	return { year, month, day, slug: post.data.slug ?? folderSlug };
}

export function postUrl(post: Post) {
	const { year, month, day, slug } = postParams(post);
	return `/${year}/${month}/${day}/${slug}/`;
}

export function slugify(name: string) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function categoryUrl(name: string) {
	return `/category/${slugify(name)}/`;
}

export function readingTime(body: string | undefined) {
	const words = (body ?? '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 230));
}
