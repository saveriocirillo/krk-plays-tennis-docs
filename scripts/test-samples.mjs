// Runs every code sample in the docs against the Prism mock, exactly as a reader
// would copy it: `sh` blocks that start with `curl`, every `js` block, and every
// `python` block. Start the mock first with `npm run mock`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DOCS_DIR = 'src/content/docs';
const PYTHON = process.env.PYTHON ?? 'python3';

// The same variables the pages tell readers to set, pointing at the local mock.
const env = {
	...process.env,
	KRK_API_URL: 'http://127.0.0.1:4010',
	KRK_API_KEY: 'ci-api-key',
	KRK_AUTH_URL: 'http://127.0.0.1:4010',
	KRK_CLIENT_ID: 'ci-client-id',
	KRK_CLIENT_SECRET: 'ci-client-secret',
	KRK_ACCESS_TOKEN: 'ci-access-token',
};

// Fenced blocks can be indented inside numbered steps, so match the indentation too.
const FENCE = /^([ \t]*)```(sh|js|python)\n([\s\S]*?)^\1```/gm;

function dedent(code, indent) {
	return code
		.split('\n')
		.map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
		.join('\n');
}

function commandFor(lang, code, dir) {
	if (lang === 'sh') {
		// --fail turns a 4xx or 5xx response into a non-zero exit code.
		return ['bash', ['-c', code.replace('curl --silent', 'curl --silent --show-error --fail')]];
	}
	const file = join(dir, lang === 'js' ? 'sample.mjs' : 'sample.py');
	writeFileSync(file, code);
	return lang === 'js' ? ['node', [file]] : [PYTHON, ['-I', file]];
}

const pages = readdirSync(DOCS_DIR, { recursive: true })
	.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
	.sort();

let passed = 0;
const failures = [];

for (const page of pages) {
	const source = readFileSync(join(DOCS_DIR, page), 'utf-8');
	for (const [, indent, lang, body] of source.matchAll(FENCE)) {
		const code = dedent(body, indent);
		if (lang === 'sh' && !code.trimStart().startsWith('curl')) continue;

		const dir = mkdtempSync(join(tmpdir(), 'krk-sample-'));
		const label = `${page} [${lang}] ${code.trim().split('\n')[0].slice(0, 60)}`;
		try {
			const [command, args] = commandFor(lang, code, dir);
			const output = execFileSync(command, args, { env, encoding: 'utf-8', timeout: 30_000, stdio: 'pipe' });
			if (!output.trim()) throw new Error('The sample printed nothing.');
			passed += 1;
			console.log(`✓ ${label}`);
		} catch (error) {
			failures.push(label);
			console.error(`✗ ${label}\n  ${(error.stderr || error.message).trim().split('\n').slice(-3).join('\n  ')}`);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
