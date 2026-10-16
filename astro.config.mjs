// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import starlightLlmsTxt from 'starlight-llms-txt';

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
				// llms.txt, llms-full.txt, and llms-small.txt for AI agents, under /portfolio/.
				starlightLlmsTxt({
					projectName: 'KRKplaysTennis API',
					description:
						'The KRKplaysTennis API rates amateur tennis players in Kraków from real match results. KRKplaysTennis is a fictional API, built as a technical writing portfolio: every example runs against a local mock server.',
					details: [
						'- The OpenAPI 3.1 spec is the most precise source for paths, parameters, and schemas: https://saverio-cirillo.com/portfolio/openapi.yaml',
						'- Every page is also available as Markdown: add `.md` to its URL without the trailing slash, for example https://saverio-cirillo.com/portfolio/quickstart.md',
						'- To try requests, start the mock with `npx @stoplight/prism-cli@5 mock https://saverio-cirillo.com/portfolio/openapi.yaml`, then call http://127.0.0.1:4010 with any `X-API-Key` value.',
						'- Read operations need an API key in `X-API-Key`. `POST /matches` needs an OAuth 2.0 access token with the `matches:write` scope.',
					].join('\n'),
					optionalLinks: [
						{
							label: 'OpenAPI spec',
							url: 'https://saverio-cirillo.com/portfolio/openapi.yaml',
							description: 'The source of truth for every operation and schema, in OpenAPI 3.1 YAML.',
						},
					],
					customSets: [
						{ label: 'Get started', paths: ['index', 'quickstart', 'authentication/**'], description: 'what the API does, a first request against the mock, and authentication' },
						{ label: 'Guides', paths: ['guides/**'], description: 'one task per page: submit a match result, explain a rating change, find opponents' },
						{ label: 'Concepts', paths: ['concepts/**'], description: 'how ratings work, with worked examples' },
						{ label: 'Reference', paths: ['errors', 'changelog'], description: 'every error type, and the changelog' },
						{ label: 'AI agents', paths: ['agents/**'], description: 'plain-text versions of the docs and the read-only MCP server' },
					],
					promote: ['index', 'quickstart', 'concepts/**'],
					demote: ['changelog'],
				}),
			],
			title: 'KRKplaysTennis API',
			description:
				'Developer documentation for the KRKplaysTennis API, a fictional API that rates amateur tennis players in Kraków from real match results.',
			customCss: ['./src/styles/custom.css'],
			components: {
				Head: './src/components/Head.astro',
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
			sidebar: [
				{ label: 'Overview', link: '/' },
				{ label: 'Get started', items: ['quickstart'] },
				{ label: 'Authentication', items: [{ autogenerate: { directory: 'authentication' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Concepts', items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'AI agents', items: ['agents/use-with-ai-agents'] },
				...openAPISidebarGroups,
				{ label: 'Errors', link: '/errors/' },
				{ label: 'Changelog', link: '/changelog/' },
			],
		}),
	],
});
