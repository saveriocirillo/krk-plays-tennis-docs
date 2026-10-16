// The Markdown version of a docs page, or null for pages that don't have one,
// such as the generated API reference: agents should read openapi.yaml for that.
import { getCollection } from 'astro:content';

const docIds = new Set((await getCollection('docs')).map((entry) => entry.id));

export function markdownUrl(id: string, base: string): string | null {
	// Starlight gives the home page an empty route ID; its content entry is `index`.
	const entryId = id === '' ? 'index' : id;
	if (!docIds.has(entryId)) return null;
	return `${base.replace(/\/$/, '')}/${entryId}.md`;
}
