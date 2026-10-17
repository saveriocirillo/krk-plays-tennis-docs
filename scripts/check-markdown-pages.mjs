// Checks the Markdown version of every docs page, after `npm run build`:
// - every page in src/content/docs has a .md file in the build
// - no MDX syntax leaked into it (imports, component tags)
// - every code block is identical to the one in the source page
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_DIR = 'src/content/docs';
const BUILD_DIR = 'dist/krk-plays-tennis-api';
const FENCE = /^([ \t]*)```[a-z]*\n([\s\S]*?)^\1```/gm;
const MDX_LEFTOVERS = /^import |<\/?(Tabs|TabItem|CardGrid|LinkCard)\b/m;

const dedent = (code, indent) =>
	code
		.split('\n')
		.map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
		.join('\n')
		.trim();
const codeBlocks = (text) => [...text.matchAll(FENCE)].map(([, indent, body]) => dedent(body, indent));

const problems = [];
const pages = readdirSync(DOCS_DIR, { recursive: true }).filter((file) => /\.mdx?$/.test(file));

for (const page of pages) {
	const markdownFile = join(BUILD_DIR, page.replace(/\.mdx?$/, '.md'));
	if (!existsSync(markdownFile)) {
		problems.push(`${page}: no Markdown version at ${markdownFile}`);
		continue;
	}
	const markdown = readFileSync(markdownFile, 'utf-8');
	if (MDX_LEFTOVERS.test(markdown)) problems.push(`${markdownFile}: contains MDX syntax`);

	const expected = codeBlocks(readFileSync(join(DOCS_DIR, page), 'utf-8'));
	const actual = codeBlocks(markdown);
	if (JSON.stringify(expected) !== JSON.stringify(actual)) {
		problems.push(`${markdownFile}: code blocks differ from ${page}`);
	}
}

for (const problem of problems) console.error(`✗ ${problem}`);
if (problems.length) process.exit(1);
console.log(`✓ All ${pages.length} pages have a clean Markdown version.`);
