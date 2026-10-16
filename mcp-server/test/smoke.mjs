// Smoke test: starts the server the way an MCP client does, over stdio, then lists
// its tools and calls three of them against the Prism mock (npm run mock in the root).
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
	command: 'node',
	args: ['dist/index.js'],
	env: { ...process.env, KRK_API_URL: process.env.KRK_API_URL ?? 'http://127.0.0.1:4010', KRK_API_KEY: 'smoke-test-key' },
});
const client = new Client({ name: 'krk-smoke-test', version: '1.0.0' });
await client.connect(transport);

const text = (result) => {
	assert.ok(!result.isError, result.content[0].text);
	return result.content[0].text;
};

const { tools } = await client.listTools();
assert.deepEqual(
	tools.map((tool) => tool.name).sort(),
	['explain_rating_change', 'find_opponents', 'find_players', 'get_player_rating', 'list_competitions', 'list_matches'],
);
assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true), 'Every tool must be read-only.');
console.log(`✓ ${tools.length} tools, all read-only`);

const rating = JSON.parse(text(await client.callTool({ name: 'get_player_rating', arguments: { player_id: 'plr_2b7xq9mhk4' } })));
assert.equal(rating.value, 1432);
console.log('✓ get_player_rating: Ola is rated 1432');

const explained = JSON.parse(text(await client.callTool({ name: 'explain_rating_change', arguments: { player_id: 'plr_2b7xq9mhk4' } })));
assert.equal(explained.rating.change, 32);
assert.equal(explained.calculation.matches_api, true);
console.log(`✓ explain_rating_change: ${explained.calculation.change}`);

const opponents = text(await client.callTool({ name: 'find_opponents', arguments: { player_id: 'plr_2b7xq9mhk4' } }));
assert.match(opponents, /Marta Z\./);
console.log('✓ find_opponents: suggests Marta Z.');

const invalid = await client.callTool({ name: 'get_player_rating', arguments: { player_id: 'not-an-id' } });
assert.ok(invalid.isError, 'An invalid player ID must be rejected.');
console.log('✓ invalid input is rejected');

await client.close();
