// Checks that every problem `type` URL in the OpenAPI spec points to a section of
// the errors page, and that the errors page documents no type the spec doesn't use.
// Link checkers can't catch this: the type URLs live in the spec, not in the pages.
import { readFile } from 'node:fs/promises';
import GithubSlugger from 'github-slugger';

const SPEC = 'openapi/krkplaystennis.v1.yaml';
const ERRORS_PAGE = 'src/content/docs/errors.mdx';
const TYPE_URL = /https:\/\/saverio-cirillo\.com\/portfolio\/errors\/#([a-z0-9-]+)/g;

const spec = await readFile(SPEC, 'utf-8');
const specTypes = new Set([...spec.matchAll(TYPE_URL)].map((match) => match[1]));

// Starlight builds heading anchors with github-slugger, so do the same here.
const page = await readFile(ERRORS_PAGE, 'utf-8');
const slugger = new GithubSlugger();
const anchors = new Set();
const documentedTypes = new Set();
for (const [, level, text] of page.matchAll(/^(#{2,6}) (.+)$/gm)) {
	const slug = slugger.slug(text.replace(/`/g, ''));
	anchors.add(slug);
	// Error type sections are level 3 headings written as code, such as ### `not-found`.
	if (level === '###' && /^`[a-z0-9-]+`$/.test(text)) documentedTypes.add(slug);
}

const undocumented = [...specTypes].filter((type) => !anchors.has(type));
const unused = [...documentedTypes].filter((type) => !specTypes.has(type));

for (const type of undocumented) console.error(`✗ ${type}: in ${SPEC}, but no section in ${ERRORS_PAGE}`);
for (const type of unused) console.error(`✗ ${type}: documented in ${ERRORS_PAGE}, but no operation in ${SPEC} returns it`);

if (undocumented.length || unused.length) process.exit(1);
console.log(`✓ All ${specTypes.size} error types in the spec are documented.`);
