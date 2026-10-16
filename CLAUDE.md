# CLAUDE.md

Conventions for working on the KRKplaysTennis API docs portal. Read this before you change anything.

## What this repo is

A public docs portal for a fictional API, built as Saverio Cirillo's technical writing portfolio. It shows three things: writing quality, a docs-as-code workflow, and docs that work for AI agents as well as humans. Saverio reviews and approves every change. You draft; Saverio decides.

## Ground rules

- **The spec is the source of truth.** `openapi/krkplaystennis.v1.yaml` is written before any page that depends on it. If a page and the spec disagree, fix the spec first (in its own commit), then the page.
- **Never hand-edit the API reference.** It's generated from the spec by `starlight-openapi`. Change the spec instead.
- **Every code sample must run** against the Prism mock. Mark testable blocks so `scripts/test-samples.mjs` picks them up (added in phase 5).
- **Fictional data only.** No real people, clubs, venues, or companies. No branding or content from Kong, Sabre, or Ververica.
- **Small scope.** A small, polished portal beats a big, unfinished one. Don't add pages or features outside the current phase.

## Git workflow

- Never commit to `main`. One branch per phase, named `phase-N/short-name`.
- Open a PR with `gh pr create` using the template in `.github/pull_request_template.md`. Don't merge: wait for Saverio's review.
- Keep commits focused, with imperative subject lines.

## Commands

```sh
npm run dev       # local site at http://localhost:4321/portfolio/
npm run build     # production build into dist/
npm run check     # Astro type and content checks
```

Linting (Vale, Spectral, lychee) and sample tests arrive in phase 5. Add their commands here when they land.

## Site configuration

- Astro Starlight, served under `base: '/portfolio'` with `trailingSlash: 'always'`. Internal links must include the base path or be relative.
- Production URL: `https://saverio-cirillo.com/portfolio/`, through a Vercel rewrite from the personal site. Fallback: `docs.saverio-cirillo.com`.
- The theme matches saverio-cirillo.com: Starlight default fonts and accent, `#f4f4f5` light-mode nav, blue card accents `#1d4ed8` to `#60a5fa`. Change both sites together or neither.

## Planned content structure

```
src/content/docs/
├── index.mdx                      # Overview
├── quickstart.md
├── authentication.md
├── guides/
│   ├── submit-a-match-result.md
│   ├── explain-a-rating-change.md
│   └── find-opponents.md
├── concepts/how-ratings-work.md
├── errors.md
├── changelog.md
└── agents/use-with-ai-agents.md
```

The API reference is generated under `/reference/`. Add sidebar entries in `astro.config.mjs` as pages land, never as empty placeholders.

## API design decisions (v1)

- Base URL: `https://api.krkplaystennis.example/v1` (`.example` is reserved and never resolves).
- Resources: `players`, `venues`, `competitions`, `matches`. Ratings and match suggestions are sub-resources of players: `/players/{id}/rating`, `/players/{id}/rating-history`, `/players/{id}/match-suggestions`.
- IDs are prefixed strings, such as `plr_`, `ven_`, `cmp_`, and `mat_`. Timestamps are RFC 3339.
- Lists use cursor pagination: `limit` and `cursor` in, `{ data, next_cursor }` out.
- Errors use RFC 9457 problem details (`application/problem+json`).
- Auth: API key for all reads. OAuth 2.0 client credentials with the `matches:write` scope for `POST /matches`, the only write in v1. Organizers submit results. There's no dispute flow.
- `POST /matches` takes an `Idempotency-Key` header.
- Matches have `status` (`completed`, `retired`, `walkover`) and a separate `rating_status` (`pending`, `rated`, `not_rated`).
- Player availability is a list of weekly time windows plus preferred venues. There's no calendar integration.
- Not in v1: doubles, webhooks, player registration, Arazzo workflows.

## Rating model

Elo with a confidence value. Keep explanations plain and the math reproducible by hand.

- The starting rating comes from the self-assessed level, with low confidence.
- After each rated match, the rating changes by K × (actual score − expected score). Expected score = 1 / (1 + 10^((opponent rating − player rating) / 400)).
- K is large when confidence is low and shrinks as confidence grows.
- Confidence rises with each rated match and decays slowly with inactivity.
- Walkovers aren't rated. Retired matches are rated on the games completed.

The exact constants are defined in phase 1. Once set, the spec, the concept page, and the worked example must all use the same numbers.

## Style rules

These apply to every page, spec description, and README.

- US English, second person, active voice, present tense.
- Sentence case for all headings.
- One task per page. Steps are numbered, and every step states its expected result.
- No marketing language and no filler.
- No em dashes or en dashes as punctuation. Use a period, a comma, a colon, or parentheses.
- No positional references such as "above", "below", or "the following section". Link to the target instead.
- Code samples come in curl, JavaScript, and Python, in that order.
