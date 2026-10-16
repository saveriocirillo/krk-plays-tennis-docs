# krk-plays-tennis-docs
Docs portal for the KRKplaysTennis API, a fictional amateur tennis API for Kraków. Built docs-as-code: OpenAPI 3.1, Astro Starlight, Vale, Spectral, CI-tested examples, and an agent-first setup with llms.txt and Claude Code skills.

This fictional API aggregates amateur tennis matches in Kraków and computes player ratings from real results, not self-assessment.

## Run locally

Requires Node.js 22.22 or later (the repo pins 24 in `.nvmrc`).

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

## License

Code is MIT. Documentation content, the OpenAPI spec, and images are all rights reserved. [NOTICE.md](NOTICE.md) lists which paths fall under each.
