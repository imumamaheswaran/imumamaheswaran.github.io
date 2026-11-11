// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://umamaheswaran.com',
	integrations: [mdx(), sitemap()],
	// Old WordPress URL kept working.
	redirects: {
		'/about': '/about-me/',
	},
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			wrap: false,
		},
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Geist',
			cssVariable: '--font-sans',
			weights: ['300 800'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Geist Mono',
			cssVariable: '--font-mono',
			weights: [400, 500, 600],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],
});
