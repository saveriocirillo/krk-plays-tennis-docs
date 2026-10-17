// Serves a Markdown version of every docs page: /krk-plays-tennis-api/quickstart/ is also at
// /krk-plays-tennis-api/quickstart.md. Agents read Markdown more reliably than HTML.
//
// Each page is rendered to HTML first, so MDX components such as <Tabs> come out as
// they look on the page, then converted to Markdown. This follows the same approach
// as starlight-llms-txt, so these files match llms-full.txt.
import mdxServer from '@astrojs/mdx/server.js';
import type { APIRoute, GetStaticPaths } from 'astro';
import { experimental_AstroContainer } from 'astro/container';
import { getCollection, render, type CollectionEntry } from 'astro:content';
import type { Element, Root } from 'hast';
import { selectAll } from 'hast-util-select';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

const SITE_URL = 'https://saverio-cirillo.com/krk-plays-tennis-api';

const container = await experimental_AstroContainer.create({
	renderers: [{ name: 'astro:jsx', ssr: mdxServer }],
});

/** Turns each <Tabs> block into a list: the tab label, then the tab's content. */
function tabsToLists() {
	return (tree: Root) => {
		for (const tabs of selectAll('starlight-tabs', tree)) {
			const labels = selectAll('[role="tab"]', tabs).map((tab) =>
				tab.children
					.filter((child) => child.type === 'text')
					.map((child) => (child.type === 'text' ? child.value.trim() : ''))
					.join(''),
			);
			const panels = selectAll('[role="tabpanel"]', tabs);
			tabs.tagName = 'ul';
			tabs.properties = {};
			tabs.children = panels.map(
				(panel, i): Element => ({
					type: 'element',
					tagName: 'li',
					properties: {},
					children: [{ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: labels[i] ?? '' }] }, panel],
				}),
			);
		}
	};
}

/** All the text inside a node. */
function textOf(node: Element | Element['children'][number]): string {
	if (node.type === 'text') return node.value;
	return 'children' in node ? node.children.map(textOf).join('') : '';
}

/**
 * Rebuilds each Expressive Code block as plain code: the language from its
 * data-language attribute, and the code from its lines, joined with one newline
 * each. Also drops the "Terminal window" label meant for screen readers.
 */
function plainCodeBlocks() {
	return (tree: Root) => {
		for (const figcaption of selectAll('.expressive-code figcaption', tree)) {
			figcaption.tagName = 'span';
			figcaption.children = [];
		}
		for (const pre of selectAll('pre[data-language]', tree)) {
			const code = selectAll('code', pre)[0];
			if (!code) continue;
			// An empty line is rendered as a newline character, so drop it before joining.
			const lines = selectAll('.ec-line', code).map((line) => textOf(line).replace(/\n$/, ''));
			code.properties = { className: [`language-${pre.properties.dataLanguage}`] };
			code.children = [{ type: 'text', value: lines.join('\n') }];
		}
	};
}

/** Turns <CardGrid> link cards into a list of links: "[Title](url): description". */
function linkCardsToList() {
	return (tree: Root) => {
		for (const grid of selectAll('.card-grid', tree)) {
			const cards = selectAll('.sl-link-card', grid);
			if (cards.length === 0) continue;
			grid.tagName = 'ul';
			grid.properties = {};
			grid.children = cards.map((card): Element => {
				const link = selectAll('a', card)[0];
				const title = textOf(selectAll('.title', card)[0] ?? card).trim();
				const description = textOf(selectAll('.description', card)[0] ?? card).trim();
				return {
					type: 'element',
					tagName: 'li',
					properties: {},
					children: [
						{ type: 'element', tagName: 'a', properties: { href: link?.properties.href }, children: [{ type: 'text', value: title }] },
						{ type: 'text', value: `: ${description}` },
					],
				};
			});
		}
	};
}

/** Turns asides (:::note) into block quotes that start with the aside title in bold. */
function asidesToQuotes() {
	return (tree: Root) => {
		for (const aside of selectAll('.starlight-aside', tree)) {
			const title = textOf(selectAll('.starlight-aside__title', aside)[0] ?? aside).trim();
			const content = selectAll('.starlight-aside__content', aside)[0];
			aside.tagName = 'blockquote';
			aside.properties = {};
			aside.children = [
				{ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: title }] }] },
				...(content?.children ?? []),
			];
		}
	};
}

/** Removes the "Section titled …" anchor links Starlight adds after each heading. */
function removeHeadingAnchors() {
	return (tree: Root) => {
		for (const anchor of selectAll('.sl-anchor-link', tree)) {
			anchor.tagName = 'span';
			anchor.children = [];
		}
	};
}

const toMarkdown = unified()
	.use(rehypeParse, { fragment: true })
	.use(tabsToLists)
	.use(plainCodeBlocks)
	.use(linkCardsToList)
	.use(asidesToQuotes)
	.use(removeHeadingAnchors)
	.use(rehypeRemark)
	.use(remarkGfm)
	.use(remarkStringify);

export const getStaticPaths = (async () => {
	const entries = await getCollection('docs');
	return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: CollectionEntry<'docs'> }> = async (context) => {
	const { entry } = context.props;
	const { Content } = await render(entry);
	const html = await container.renderToString(Content, context);
	// Make site links absolute, so they work wherever an agent reads the file.
	const body = String(await toMarkdown.process(html))
		.trim()
		.replaceAll('](/krk-plays-tennis-api/', `](${SITE_URL}/`);

	const pageUrl = entry.id === 'index' ? `${SITE_URL}/` : `${SITE_URL}/${entry.id}/`;
	const markdown = [
		`# ${entry.data.title}`,
		entry.data.description ? `> ${entry.data.description}` : '',
		`Source: ${pageUrl}`,
		body,
	]
		.filter(Boolean)
		.join('\n\n');

	return new Response(`${markdown}\n`, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
