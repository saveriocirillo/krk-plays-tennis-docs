#!/usr/bin/env node
// A read-only MCP server for the KRKplaysTennis API. It exposes six tools that read
// players, ratings, matches, and competitions. It has no tool that submits results:
// a write that changes real players' ratings needs a person to check it first.
//
// Configuration, from environment variables:
//   KRK_API_URL  The API base URL. For the local mock: http://127.0.0.1:4010
//   KRK_API_KEY  An API key. The mock accepts any value.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = process.env.KRK_API_URL?.replace(/\/$/, '');
const API_KEY = process.env.KRK_API_KEY;

if (!API_URL || !API_KEY) {
	console.error('Set KRK_API_URL and KRK_API_KEY. For the local mock: KRK_API_URL=http://127.0.0.1:4010 and any KRK_API_KEY.');
	process.exit(1);
}

type Query = Record<string, string | number | undefined>;

/** Calls a read operation and returns the JSON body. Throws the API's problem details on errors. */
async function get(path: string, query: Query = {}): Promise<any> {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) params.set(key, String(value));
	}
	const url = `${API_URL}${path}${params.size ? `?${params}` : ''}`;
	const response = await fetch(url, { headers: { 'X-API-Key': API_KEY! } });
	const body = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(`The API returned ${response.status}: ${JSON.stringify(body)}`);
	}
	return body;
}

/** Wraps a tool so it returns JSON text, or the API error as a tool error the model can read. */
function jsonTool<Args>(handler: (args: Args) => Promise<unknown>) {
	return async (args: Args) => {
		try {
			const result = await handler(args);
			return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
		} catch (error) {
			return { isError: true, content: [{ type: 'text' as const, text: (error as Error).message }] };
		}
	};
}

const playerId = z.string().regex(/^plr_[a-z0-9]{10}$/).describe('A player ID, such as plr_2b7xq9mhk4.');
const readOnly = { readOnlyHint: true, idempotentHint: true, openWorldHint: true } as const;

const server = new McpServer({ name: 'krk-plays-tennis', version: '1.0.0' });

server.registerTool(
	'find_players',
	{
		title: 'Find players',
		description:
			'Lists players with their self-assessed NTRP level, current rating, confidence, availability, and preferred venues. Filter by rating range or venue. Use it to find a player ID by name before calling the other tools.',
		inputSchema: {
			min_rating: z.number().int().min(0).optional().describe('Only players rated at least this much.'),
			max_rating: z.number().int().min(0).optional().describe('Only players rated at most this much.'),
			venue_id: z.string().optional().describe('Only players who prefer this venue, such as ven_7hk2p9wq4m.'),
			limit: z.number().int().min(1).max(100).optional().describe('Maximum number of players. Default 20.'),
			cursor: z.string().optional().describe('The next_cursor value from a previous call, to get the next page.'),
		},
		annotations: readOnly,
	},
	jsonTool((args: Query) => get('/players', args)),
);

server.registerTool(
	'get_player_rating',
	{
		title: "Get a player's rating",
		description:
			"Returns a player's current rating, confidence (0 to 100), the K-factor for their next match, and the number of rated matches. A rating is usually between 1000 and 1800. Higher confidence means a more settled rating.",
		inputSchema: { player_id: playerId },
		annotations: readOnly,
	},
	jsonTool(({ player_id }: { player_id: string }) => get(`/players/${player_id}/rating`)),
);

server.registerTool(
	'explain_rating_change',
	{
		title: 'Explain a rating change',
		description:
			"Explains why a player's rating changed after a match. Returns the API's one-sentence explanation, the numbers it used, and the same calculation redone step by step, so you can quote the math without computing it yourself. Without match_id, it explains the most recent match.",
		inputSchema: {
			player_id: playerId,
			match_id: z.string().regex(/^mat_[a-z0-9]{10}$/).optional().describe('The match to explain, such as mat_4nc8xq2vbt.'),
		},
		annotations: readOnly,
	},
	jsonTool(async ({ player_id, match_id }: { player_id: string; match_id?: string }) => {
		const { data } = await get(`/players/${player_id}/rating-history`, { limit: 100 });
		const entry = data.find(
			(e: any) => e.reason.code === 'match_result' && (!match_id || e.reason.match_id === match_id),
		);
		if (!entry) throw new Error(`No rated match found for ${player_id}${match_id ? ` and ${match_id}` : ''}.`);

		const { opponent_rating, actual_score, k_factor } = entry.calculation;
		const expected = Math.round((1 / (1 + 10 ** ((opponent_rating - entry.value_before) / 400))) * 1000) / 1000;
		const change = Math.round(k_factor * (actual_score - expected));
		return {
			explanation: entry.reason.explanation,
			match_id: entry.reason.match_id,
			rating: { before: entry.value_before, after: entry.value_after, change: entry.change },
			confidence: { before: entry.confidence_before, after: entry.confidence_after },
			calculation: {
				expected_score: `1 / (1 + 10^((${opponent_rating} - ${entry.value_before}) / 400)) = ${expected}`,
				change: `${k_factor} × (${actual_score} - ${expected}) = ${change}`,
				matches_api: change === entry.change,
			},
		};
	}),
);

server.registerTool(
	'find_opponents',
	{
		title: 'Find opponents for a player',
		description:
			'Suggests opponents with a similar rating who share at least one weekly time window with the player, closest rating first. Each suggestion has the rating gap, the overlapping windows in Kraków local time, and shared venues. If the list is empty, try a larger max_rating_gap.',
		inputSchema: {
			player_id: playerId,
			max_rating_gap: z.number().int().min(0).max(500).optional().describe('Maximum rating difference, in either direction. Default 150.'),
			venue_id: z.string().optional().describe('Only opponents who prefer this venue.'),
			limit: z.number().int().min(1).max(10).optional().describe('Maximum number of suggestions. Default 5.'),
		},
		annotations: readOnly,
	},
	jsonTool(({ player_id, ...query }: { player_id: string } & Query) => get(`/players/${player_id}/match-suggestions`, query)),
);

server.registerTool(
	'list_matches',
	{
		title: 'List matches',
		description:
			'Lists match results, newest first, with scores, the winner, and whether the match is rated. Filter by player, competition, status, or date. Walkovers are never rated.',
		inputSchema: {
			player_id: z.string().optional().describe('Only matches this player played.'),
			competition_id: z.string().optional().describe('Only matches in this competition, such as cmp_6tw2hn8rxe.'),
			status: z.enum(['completed', 'retired', 'walkover']).optional(),
			rating_status: z.enum(['pending', 'rated', 'not_rated']).optional(),
			played_after: z.string().optional().describe('RFC 3339 date-time, such as 2026-10-01T00:00:00+02:00.'),
			played_before: z.string().optional().describe('RFC 3339 date-time.'),
			limit: z.number().int().min(1).max(100).optional(),
			cursor: z.string().optional(),
		},
		annotations: readOnly,
	},
	jsonTool((args: Query) => get('/matches', args)),
);

server.registerTool(
	'list_competitions',
	{
		title: 'List competitions',
		description:
			'Lists leagues and tournaments with their organizer, season, dates, venues, and match format (games per set, no-ad scoring, and whether a match tiebreak replaces the third set).',
		inputSchema: {
			type: z.enum(['league', 'tournament']).optional(),
			season: z.string().optional().describe('A season, such as 2026-autumn.'),
			venue_id: z.string().optional(),
		},
		annotations: readOnly,
	},
	jsonTool((args: Query) => get('/competitions', args)),
);

await server.connect(new StdioServerTransport());
