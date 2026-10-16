---
name: style-guide
description: Applies the KRKplaysTennis docs style guide to any prose change, and fixes Vale findings. Use when writing or editing a page in src/content/docs, a description in openapi/, or README.md, and before opening a PR that touches prose.
---

# Style guide

The rules live in the "Style rules" section of `CLAUDE.md`. This skill is how to apply them and check your work.

## Before you write

- Know the reader: a developer integrating the API, or an agent reading the Markdown version. Write for someone who wants to finish a task, not read about the product.
- Reuse the example dataset in `CLAUDE.md` (Ola, Kasia, Tomek, Marta, and their IDs and numbers). Don't invent new people, IDs, or ratings.

## Rewrites that come up most

| Instead of | Write | Why |
|---|---|---|
| "as shown above", "see below" | A link to the section: `[Retirements and walkovers](#retirements-and-walkovers)` | Positional references break in Markdown versions and for screen readers |
| An em dash or en dash as punctuation | A period, comma, colon, or parentheses | House rule, enforced by `KRK.Dashes` |
| "she", "he", "her" for a fictional person | The person's name | Fictional people have no stated gender |
| "The request is sent by the organizer" | "The organizer sends the request" | Active voice |
| "The API will return" | "The API returns" | Present tense |
| "simply", "seamless", "powerful" | Say what happens | No marketing language |
| "OAuth" alone, in prose | "OAuth 2.0" | Google style |
| "the API's spec" | "the spec of the API" | Avoid possessives of acronyms |
| "Click here" | Link text that names the target | Links make sense out of context |

## Terms

Use these consistently, and don't swap in synonyms:

- **rating**, **confidence**, **K-factor**, **expected score**, **actual score**
- **match tiebreak** (the tiebreak to 10 that replaces a third set), **tiebreak** (inside a set)
- **completed**, **retired**, **walkover**: the three match statuses
- **API key** for reads, **access token** for writes. Never "token" alone for an API key.
- **competition organizer**, not "admin" or "owner"

## Check your work

1. Run Vale on the files you changed:

   ```sh
   vale src/content/docs README.md
   ```

   The result must be 0 errors and 0 warnings.

2. For each finding, decide which case it is:
   - **A real problem:** fix the text. Never edit a rule to make a finding go away.
   - **A correct project term** flagged by spelling, such as a new venue name: add it to `.vale/styles/config/vocabularies/KRK/accept.txt`.
   - **A false positive** from a Google rule on a correct sentence: rephrase the sentence. Explain any rule change in the PR description.
3. Read the page as its Markdown version (`npm run build`, then open `dist/portfolio/<page>.md`). If a sentence only makes sense next to a picture or a tab, rewrite it.
