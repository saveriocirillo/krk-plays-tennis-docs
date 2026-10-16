// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';

export default defineConfig({
	// The portal is served from saverio-cirillo.com/portfolio/ through a Vercel rewrite.
	site: 'https://saverio-cirillo.com',
	base: '/portfolio',
	trailingSlash: 'always',
	// Mirror the base path on disk so Vercel serves /portfolio/ as static files,
	// with directory indexes, and needs no rewrites.
	outDir: './dist/portfolio',
	integrations: [
		starlight({
			plugins: [
				// The API reference is generated from the spec at build time. Never edit it by hand.
				starlightOpenAPI([
					{
						base: 'reference',
						schema: './openapi/krkplaystennis.v1.yaml',
						sidebar: {
							label: 'API reference',
							collapsed: false,
							operations: { badges: true, labels: 'summary', sort: 'document' },
							tags: { sort: 'document' },
						},
						snippets: {
							operation: {
								clients: { shell: ['curl'], javascript: ['fetch'] },
								default: { target: 'shell', client: 'curl' },
							},
						},
					},
				]),
			],
			title: 'KRKplaysTennis API',
			description:
				'Developer documentation for the KRKplaysTennis API, a fictional API that rates amateur tennis players in Kraków from real match results.',
			customCss: ['./src/styles/custom.css'],
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				Footer: './src/components/Footer.astro',
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/saveriocirillo/krk-plays-tennis-docs',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/saveriocirillo/krk-plays-tennis-docs/edit/main/',
			},
			// Sections are added as each phase lands. See CLAUDE.md for the planned structure.
			sidebar: [{ label: 'Overview', link: '/' }, ...openAPISidebarGroups],
		}),
	],
});
