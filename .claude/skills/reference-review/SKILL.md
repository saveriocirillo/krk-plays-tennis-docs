---
name: reference-review
description: Reviews a change to the OpenAPI spec as an API docs reviewer, before the generated reference goes live. Use when a PR changes openapi/krkplaystennis.v1.yaml, or when asked to review the API reference.
---

# Reference review

The API reference is generated from `openapi/krkplaystennis.v1.yaml` by `starlight-openapi`. Reviewing the reference means reviewing the spec: never fix wording in generated pages.

## 1. Run the automated checks

```sh
npm run lint:spec      # spectral:oas plus the krk-* house rules
npm run check:errors   # every problem type has a section on the errors page
```

Both must pass before you review by hand. The checks catch structure. You review meaning.

## 2. Review each changed operation

For every operation the change adds or edits, check:

- [ ] `summary` names the task in sentence case, starting with a verb: "Submit a match result". It becomes the page title and sidebar label.
- [ ] `description` says what the operation does, in second person and present tense, and covers behavior that isn't obvious from the schema (asynchronous rating, idempotency, ordering).
- [ ] `operationId` is a camelCase verb phrase. It becomes the page URL, so don't rename existing ones.
- [ ] Every parameter and property has a description that says what it means, not only its type. Units, ranges, and defaults are stated.
- [ ] Examples use the dataset from `CLAUDE.md`, and the numbers are consistent with the rating model. Recompute any rating number you change.
- [ ] Each 4xx response uses a problem `type` documented on the errors page. A new type needs a new section in the same PR.
- [ ] For responses with several examples, the most generic one comes first. Prism returns the first one for invalid requests.

## 3. Review the design, not only the text

- [ ] **Breaking or not?** A removed or renamed field, a new required request field, or a new enum value in a response is breaking. Flag it, and apply the `release-notes` skill.
- [ ] **Enums that will grow** should be objects of independent rules, like `match_format`. Adding an optional field is safe, and adding an enum value isn't.
- [ ] **Writes** need an `Idempotency-Key` and the `matches:write` scope pattern, or a stated reason why not.

## 4. Check what depends on the spec

- [ ] The Bruno collection in `collections/bruno/` has a request for every new operation.
- [ ] If a tool in `mcp-server/src/index.ts` wraps the operation, its description and `test/smoke.mjs` still match.
- [ ] Guides that show the operation still match the new responses. Run `npm run test:samples` against the mock.

## 5. Look at the rendered page

Open the Vercel preview of the PR and read the generated reference page for each changed operation. Check that headings, examples, and the `oneOf` variants read well. If something reads badly, fix the spec.

## Writing the review

Group comments by severity: **blocking** (wrong or breaking), **should fix** (unclear or inconsistent), and **suggestion**. For each comment, quote the spec path, such as `paths./matches.post.description`, and propose the new text.
