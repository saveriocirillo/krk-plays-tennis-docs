---
name: how-to-template
description: Drafts a new task guide (how-to) for the KRKplaysTennis docs from the house template. Use when asked to document a task, such as "write a guide for X", or when a new operation needs a guide.
---

# How-to template

A guide covers **one task**, from a clear starting point to a result the reader can check. If you can't name the task as a verb phrase ("Submit a match result"), it's probably a concept page instead.

## Before you draft

1. Read the operations involved in `openapi/krkplaystennis.v1.yaml`. The spec is the source of truth: if a page and the spec disagree, the spec wins.
2. Pick the scenario from the example dataset in `CLAUDE.md`, so every response in the guide matches what the mock returns.
3. Start the mock (`npm run mock`) and run each request you plan to show. Write down the real responses.

## Template

Save the guide as `src/content/docs/guides/<task-in-kebab-case>.mdx`:

````mdx
---
title: <Task, in sentence case, starting with a verb>
description: <One sentence: what the reader does and what they get.>
sidebar:
  order: <position among the guides>
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

<One paragraph: when you'd do this, and what the API does.>

This guide <does the task for a specific person or match from the dataset>.

## Before you begin

- <Credential, with a link to the authentication page that explains it>.
- `KRK_API_URL` set to the API base URL. For the [local mock](/portfolio/quickstart/), that's `http://127.0.0.1:4010`.

## Steps

1. <Imperative instruction>:

   <Tabs syncKey="lang">
   <TabItem label="curl">

   ```sh
   curl --silent "$KRK_API_URL/<path>" \
     --header "X-API-Key: $KRK_API_KEY"
   ```

   </TabItem>
   <TabItem label="JavaScript">

   Save this code as `<name>.mjs`, then run `node <name>.mjs`:

   ```js
   <self-contained ES module; check response.ok>
   ```

   </TabItem>
   <TabItem label="Python">

   Save this code as `<name>.py`, then run `python3 <name>.py`:

   ```python
   <self-contained script with requests; call raise_for_status()>
   ```

   </TabItem>
   </Tabs>

   <Expected result: the status and the field values the reader sees.>

2. <Next step, same pattern. Every step ends with its expected result.>

## If the request fails

| Status | `type` | Cause | Fix |
|---|---|---|---|
| <status> | [`<type>`](/portfolio/errors/#<type>) | <cause> | <fix> |
````

## Rules for the steps

- Number every step, and end each one with what the reader sees: a status, a field value, or printed output.
- Samples read `KRK_*` environment variables, never hard-coded URLs or keys.
- A step that only computes something, with no request, can drop the curl tab. Say so in the step.
- Link to the errors page anchor for each error type, never to the reference.

## Before you open the PR

1. Add the guide to a custom set in `astro.config.mjs` if it's in a new folder. `guides/**` is already covered.
2. Run the checks:

   ```sh
   npm run build && npm run check:markdown
   npm run mock &
   npm run test:samples
   ```

3. Apply the `style-guide` skill.
4. In the PR description, list the scenario you used and the real responses you checked.
