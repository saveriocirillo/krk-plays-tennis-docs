---
name: release-notes
description: Writes a changelog entry for a new KRKplaysTennis API version from the spec changes since the last release. Use when preparing a release, when asked for release notes, or when a PR changes the OpenAPI spec in a way users would notice.
---

# Release notes

The changelog is `src/content/docs/changelog.mdx`, newest version first. Readers use it to answer one question: "do I need to change my code?" Write every entry so they can answer it in seconds.

## 1. Find what changed

Compare the spec with the last release, and read the PRs merged since then:

```sh
git log --oneline <last-release-commit>..HEAD -- openapi/
git diff <last-release-commit>..HEAD -- openapi/krkplaystennis.v1.yaml
```

Sort each change into one of these groups:

| Group | What goes in it |
|---|---|
| **Breaking changes** | Anything that can break a working client: a removed or renamed field, parameter, operation, or error type; a type change; a new required field in a request; a new value in an enum that appears in responses |
| **Added** | New operations, new optional fields, new optional parameters |
| **Changed** | Behavior changes that don't break clients |
| **Deprecated** | Anything that will be removed in the next major version |
| **Fixed** | Bugs, including wrong examples or descriptions in the spec |

Changes to the docs pages alone don't go in the changelog.

## 2. Pick the version

The API follows semantic versioning. From 1.0.0, a breaking change needs a new major version with a new base URL, such as `/v2`. If you find a breaking change in a minor release, stop and tell the reviewer: it's a design problem, not a changelog problem.

Update `info.version` in the spec to the same version.

## 3. Write the entry

```mdx
## <version>

*<Month day, year>*

### Breaking changes

- **<What changed, in one bold sentence.>** <What it was, what it is now, and why.>

  <Before and after, as JSON, when the shape changed.>

  To migrate, <the exact change to make in client code>. <A mapping table, if old values map to new ones.>

### Added

- **<Feature>.** <What it does, with a link to its reference page or guide.>
```

For a beta release, add `· Beta` after the date, not in the heading.

## Rules

- Lead with the impact on the reader, not with how it was built.
- Every breaking change has migration steps. "Update your code" isn't a migration step.
- Link each new operation to its reference page: `/krk-plays-tennis-api/reference/operations/<operationid>/`.
- Use the style guide. Run `vale src/content/docs/changelog.mdx` before you open the PR.
