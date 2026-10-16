# krk-plays-tennis-docs
Docs portal for the KRKplaysTennis API, a fictional amateur tennis API for Kraków. Built docs-as-code: OpenAPI 3.1, Astro Starlight, Vale, Spectral, CI-tested examples, and an agent-first setup with llms.txt and Claude Code skills.

This fictional API aggregates amateur tennis matches in Kraków and computes player ratings from real results, not self-assessment.

**Live portal:** [saverio-cirillo.com/portfolio](https://saverio-cirillo.com/portfolio/)

## What this portal shows

I built this portal as a technical writing portfolio. It shows three things:

- **Writing.** Task-based guides with one task per page, a [concept page](https://saverio-cirillo.com/portfolio/concepts/how-ratings-work/) that explains a rating model in plain language, and an [errors reference](https://saverio-cirillo.com/portfolio/errors/) that matches every error the API returns.
- **Docs as code.** The OpenAPI spec came first. The API reference is generated from it, every page goes through a reviewed pull request, and every code sample runs against a mock server in CI.
- **Docs for agents.** [`llms.txt`](https://saverio-cirillo.com/portfolio/llms.txt), a Markdown version of every page, and a read-only MCP server. See [Use this API with AI agents](https://saverio-cirillo.com/portfolio/agents/use-with-ai-agents/).

## How these docs are made

```
plan → branch and PR → agent draft → automated checks → preview → human review → merge → deploy
```

1. **Plan first.** Every phase started with a short written plan: what to build, the trade-offs, and the open decisions. I approved each plan before any work began.
2. **One branch and one pull request per change.** `main` is protected: nothing reaches it without a PR and five green checks.
3. **An AI agent drafts.** [Claude Code](https://code.claude.com/docs/en/overview) wrote the first drafts of the pages, the spec, and the tooling. Two things guide it:
   - [`CLAUDE.md`](CLAUDE.md): the project's conventions, design decisions, rating constants, and the shared example dataset.
   - Four skills in [`.claude/skills/`](.claude/skills/), one per recurring task:

     | Skill | Use |
     |---|---|
     | `style-guide` | Apply the style rules and fix what Vale finds |
     | `how-to-template` | Draft a new task guide from the house template |
     | `release-notes` | Write a changelog entry from the spec changes |
     | `reference-review` | Review a spec change before the reference goes live |

4. **Automated checks do the mechanical review.** Every PR runs five CI jobs: Spectral on the spec, Vale on the prose, the Astro build, lychee on every link and anchor, and every code sample against the Prism mock. Before the pipeline went live, a test PR broke one thing per job on purpose, to prove that each job catches what it should.
5. **I review and decide.** I read every PR and its Vercel preview, then merge it or ask for changes. The checks free me to review what a machine can't judge: whether a page is clear, whether the task is the right one, and whether the API design makes sense.

Review changed the work in ways the checks couldn't. Three examples:

- Match formats were first an enum. In review, I pointed out that amateur leagues in Kraków mix short sets and regular sets. The format became an object of independent rules, which can grow without breaking clients, and the change went into the changelog as a breaking change.
- The access token guide first hard-coded the example token from the mock in a command. Review replaced it with a placeholder, and made the "Save this code as" instructions consistent across pages.
- The concept page said the top confidence band ran up to 100. Review caught that confidence caps at 95.

The agent drafts and runs the checks. I make the final call. Commits are co-authored with Claude Code, so the history shows how the work was done.

## Repository structure

```
├── openapi/krkplaystennis.v1.yaml   The OpenAPI 3.1 spec: the source of truth
├── src/content/docs/                The pages (MDX)
├── src/pages/                       Endpoints for openapi.yaml and the Markdown pages
├── mcp-server/                      The read-only MCP server
├── collections/bruno/               A Bruno collection with one request per operation
├── scripts/                         Checks for samples, error types, and Markdown pages
├── .github/workflows/docs-ci.yml    The CI pipeline
├── .vale/ and .vale.ini             Vale styles and the project vocabulary
├── .spectral.yaml                   Spectral rules for the spec
├── .claude/skills/                  Skills for the AI agent
└── CLAUDE.md                        Conventions for the AI agent, and for people
```

## Run locally

You need Node.js 22.22 or later. The repository pins version 24 in `.nvmrc`.

```sh
npm install
npm run dev
```

The site runs at `http://localhost:4321/portfolio/`.

## Try the API against the mock

KRKplaysTennis is fictional, so there's no live server. A [Prism](https://github.com/stoplightio/prism) mock serves the examples from the OpenAPI spec instead:

```sh
npm run mock
curl -H "X-API-Key: any-value" http://127.0.0.1:4010/players
```

The mock checks that each request matches the spec and that credentials are present, but it doesn't run business logic.

To explore every operation in a client, open `collections/bruno/` in [Bruno](https://www.usebruno.com/) and select the `mock` environment. In Insomnia or Postman, import `openapi/krkplaystennis.v1.yaml` directly.

## Run the checks locally

```sh
npm run lint:spec        # Spectral on the spec
npm run check:errors     # every error type is documented
npm run build
npm run check:markdown   # every page has a clean Markdown version
npm run mock &           # then, in the same terminal:
npm run test:samples     # every code sample in the docs
```

Vale and lychee need their own binaries: see [Vale](https://vale.sh/docs/install) and [lychee](https://github.com/lycheeverse/lychee#installation). With Vale installed, run `vale sync` once, then `npm run lint:prose`.

## License

Code is MIT. Documentation content, the OpenAPI spec, and images are all rights reserved. [NOTICE.md](NOTICE.md) lists which paths fall under each.
