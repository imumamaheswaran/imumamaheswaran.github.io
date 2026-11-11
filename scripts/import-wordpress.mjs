// One-off importer: pulls every post (and approved comment) from the
// WordPress.com public API and writes them as Markdown into src/content/blog.
// Images are downloaded next to each post so nothing depends on wordpress.com.
//
// Usage: node scripts/import-wordpress.mjs
// Re-running overwrites the imported posts, so don't hand-edit them until
// you're done importing.

import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const SITE = 'umamaheswaran.com';
const API = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE}`;
const OUT = path.resolve('src/content/blog');
const COMMENTS_OUT = path.resolve('src/data/comments.json');

const LANGS = {
	csharp: 'csharp', 'c#': 'csharp', jscript: 'javascript', js: 'javascript',
	javascript: 'javascript', ts: 'typescript', typescript: 'typescript',
	plain: 'text', text: 'text', bash: 'bash', shell: 'bash', css: 'css',
	xml: 'xml', html: 'html', powershell: 'powershell', ps: 'powershell',
	json: 'json', sql: 'sql', python: 'python', py: 'python', yaml: 'yaml',
};

async function getJSON(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return res.json();
}

async function fetchAll(endpoint, key, fields) {
	const items = [];
	for (let page = 1; ; page++) {
		const data = await getJSON(`${API}/${endpoint}/?number=100&page=${page}${fields ? `&fields=${fields}` : ''}`);
		items.push(...data[key]);
		if (items.length >= data.found || data[key].length === 0) return items;
	}
}

function decodeEntities(s) {
	return cheerio.load(`<p>${s}</p>`)('p').text();
}

/** Strip resizing params so we download the original image. */
function originalImageUrl(src) {
	const u = new URL(src.startsWith('//') ? `https:${src}` : src);
	u.search = '';
	u.protocol = 'https:';
	return u.toString();
}

const downloaded = new Map();
async function download(src, dir) {
	const url = originalImageUrl(src);
	const key = `${dir}|${url}`;
	if (downloaded.has(key)) return downloaded.get(key);
	let name = decodeURIComponent(path.basename(new URL(url).pathname)).replace(/[^\w.-]+/g, '-');
	if (!/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name)) name += '.png';
	const res = await fetch(url);
	if (!res.ok) {
		console.warn(`  ! could not download ${url} (${res.status})`);
		downloaded.set(key, null);
		return null;
	}
	await fs.writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
	downloaded.set(key, `./${name}`);
	return `./${name}`;
}

function makeTurndown() {
	const td = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '_',
	});
	td.use(gfm);
	td.keep(['iframe', 'video', 'audio']);
	td.addRule('fencedWithLang', {
		filter: (node) => node.nodeName === 'PRE',
		replacement: (_content, node) => {
			const lang = node.getAttribute('data-lang') || '';
			const code = node.textContent.replace(/\n+$/, '').replace(/^\n/, '');
			const fence = code.includes('```') ? '````' : '```';
			return `\n\n${fence}${lang}\n${code}\n${fence}\n\n`;
		},
	});
	return td;
}

/** Clean WordPress-specific markup into plain HTML that converts cleanly. */
async function cleanHtml(html, dir) {
	const $ = cheerio.load(html, null, false);

	// CodeMirror-pasted code: one <div class="cm-line"> per line.
	$('pre').each((_, pre) => {
		const lines = $(pre).find('.cm-line');
		if (lines.length) {
			const text = lines.map((_, l) => $(l).text()).get().join('\n');
			$(pre).empty().text(text);
		}
		// SyntaxHighlighter: class="brush: csharp; title: ; notranslate"
		const brush = /brush:\s*([\w#]+)/.exec($(pre).attr('class') || '');
		const codeClass = /language-([\w#]+)/.exec($(pre).find('code').attr('class') || '');
		const lang = (brush || codeClass)?.[1]?.toLowerCase();
		if (lang) $(pre).attr('data-lang', LANGS[lang] ?? lang);
	});
	// Unwrap code-block wrapper divs.
	$('.wp-block-code, .cm-editor, .cm-scroller, .wp-block-syntaxhighlighter-code').each((_, el) => {
		$(el).replaceWith($(el).contents());
	});

	// Images: download locally, drop links that just point at the full-size file.
	for (const img of $('img').toArray()) {
		const src = $(img).attr('data-orig-file') || $(img).attr('src');
		if (!src) continue;
		const local = await download(src, dir);
		if (!local) continue;
		const alt = $(img).attr('alt') || '';
		const parentLink = $(img).parent('a');
		const replacement = $('<img>').attr('src', local).attr('alt', alt);
		if (parentLink.length && /\.(png|jpe?g|gif|webp)/i.test(parentLink.attr('href') || '')) {
			parentLink.replaceWith(replacement);
		} else {
			$(img).replaceWith(replacement);
		}
	}

	// Captions → italic line under the image.
	$('figcaption').each((_, el) => {
		$(el).replaceWith(`<p><em>${$(el).html()}</em></p>`);
	});

	// Internal links: point at the new site's relative URLs.
	$('a[href]').each((_, a) => {
		const href = $(a).attr('href');
		const m = /^https?:\/\/(?:www\.)?(?:umamaheswaran\.com|umacoder\.wordpress\.com)(\/.*)?$/.exec(href);
		if (m && !/\/wp-content\/|files\.wordpress/.test(href)) $(a).attr('href', m[1] || '/');
	});

	$('script, style, .sharedaddy, .jp-relatedposts').remove();
	return $.html();
}

function yamlString(s) {
	return JSON.stringify(s);
}

function excerpt(post) {
	const text = decodeEntities(post.excerpt || post.content)
		.replace(/\s+/g, ' ')
		.replace(/\[…\]|\[&hellip;\]|…$/g, '')
		.trim();
	if (text.length <= 160) return text;
	return text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

async function main() {
	console.log('Fetching posts…');
	const posts = await fetchAll(
		'posts',
		'posts',
		'ID,title,date,modified,slug,URL,excerpt,content,categories,tags,featured_image,status',
	);
	console.log(`  ${posts.length} posts`);

	// Remove previously imported posts (folders we created), keep anything else.
	await fs.mkdir(OUT, { recursive: true });
	for (const entry of await fs.readdir(OUT, { withFileTypes: true })) {
		if (entry.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(entry.name)) {
			await fs.rm(path.join(OUT, entry.name), { recursive: true });
		}
	}

	const td = makeTurndown();
	for (const post of posts) {
		if (post.status !== 'publish') continue;
		const slug = decodeURIComponent(post.slug);
		const date = post.date.slice(0, 10);
		const folder = `${date}-${slug.replace(/[^\w-]+/g, '-')}`;
		const dir = path.join(OUT, folder);
		await fs.mkdir(dir, { recursive: true });
		console.log(`  ${date} ${slug}`);

		const html = await cleanHtml(post.content, dir);
		let body = td.turndown(html).replace(/\n{3,}/g, '\n\n').trim();

		let hero = '';
		if (post.featured_image) {
			const local = await download(post.featured_image, dir);
			if (local) hero = local;
		}

		const categories = Object.values(post.categories).map((c) => decodeEntities(c.name));
		const tags = Object.values(post.tags).map((t) => decodeEntities(t.name));
		const frontmatter = [
			'---',
			`title: ${yamlString(decodeEntities(post.title))}`,
			`description: ${yamlString(excerpt(post))}`,
			`pubDate: ${post.date}`,
			post.modified.slice(0, 10) !== date ? `updatedDate: ${post.modified}` : null,
			`slug: ${yamlString(slug)}`,
			hero ? `heroImage: ${yamlString(hero)}` : null,
			`categories: ${JSON.stringify(categories)}`,
			`tags: ${JSON.stringify(tags)}`,
			`wordpressId: ${post.ID}`,
			'---',
		].filter((l) => l !== null);
		await fs.writeFile(path.join(dir, 'index.md'), `${frontmatter.join('\n')}\n\n${body}\n`);
	}

	console.log('Fetching comments…');
	const comments = await fetchAll('comments', 'comments');
	const byPost = {};
	for (const c of comments) {
		if (c.status !== 'approved' || c.type !== 'comment') continue;
		(byPost[c.post.ID] ??= []).push({
			id: c.ID,
			parent: c.parent ? c.parent.ID : null,
			author: decodeEntities(c.author.name),
			url: c.author.URL || null,
			date: c.date,
			html: c.content,
		});
	}
	for (const list of Object.values(byPost)) list.sort((a, b) => a.date.localeCompare(b.date));
	await fs.mkdir(path.dirname(COMMENTS_OUT), { recursive: true });
	await fs.writeFile(COMMENTS_OUT, JSON.stringify(byPost, null, '\t') + '\n');
	console.log(`  ${comments.length} comments`);
	console.log('Done.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
