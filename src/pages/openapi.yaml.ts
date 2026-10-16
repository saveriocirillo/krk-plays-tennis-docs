// Publishes the OpenAPI spec at /portfolio/openapi.yaml, so readers and agents can
// download it or start a mock from its URL. The file in openapi/ stays the only copy.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';

// Resolved from the project root: during the build, import.meta.url points at the bundle.
const SPEC_PATH = resolve('openapi/krkplaystennis.v1.yaml');

export const GET: APIRoute = async () => {
	const spec = await readFile(SPEC_PATH, 'utf-8');
	return new Response(spec, { headers: { 'Content-Type': 'application/yaml; charset=utf-8' } });
};
