// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	// The portal is served from saverio-cirillo.com/portfolio/ through a Vercel rewrite.
	site: 'https://saverio-cirillo.com',
	base: '/portfolio',
	trailingSlash: 'always',
	integrations: [
		starlight({
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
			sidebar: [{ label: 'Overview', link: '/' }],
		}),
	],
});
