[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

# Description

Enforces [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#summary) specification on PR titles and bodies, keeping your commit history structured and readable.

- Validates the PR title against the Conventional Commits format
- Validates the PR body against a configurable pattern
- Both patterns are fully customizable via action inputs

## Example

```yaml
name: Enforce Conventional Commits

on:
  pull_request:
    branches: [main]

jobs:
  validate-commit-convention:
    runs-on: ubuntu-latest
    steps:
      - name: Validate PR title and body
        uses: step-security/conventional-commit-checker-action@v2
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `pr-title-regex` | No | `^(.+)(?:(([^)s]+)))?: (.+)` | Custom regex pattern to validate the PR title |
| `pr-body-regex` | No | `(.*\n)+(.*)` | Custom regex pattern to validate the PR body |


## Note

GitHub does not allow customizing the default Squash and Merge commit message. For best results, manually paste the PR body into the description field when squash-merging.
