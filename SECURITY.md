# Security

This is a demo repository with fictional data. Please keep it that way.

## Never commit

- Secrets of any kind: passwords, tokens, keys, client secrets, connection strings.
- Environment details: environment IDs, tenant IDs, app IDs, SharePoint site addresses, OneDrive paths.
- Real people's names or email addresses. Use sample addresses on `contoso.example`.

`power.config.json` and the per-list schema files under `.power/schemas/sharepointonline/` hold environment details and are git-ignored. Use `power.config.example.json` as the template.

## Safeguards

- Secret scanning and push protection should be on for this repository (Settings, Code security).
- Dependabot opens weekly pull requests for npm and GitHub Actions updates.
- Every pull request carries a checklist that includes a look for identifiers.

## Reporting a problem

If you find a secret or an identifier in this repository, open a private security advisory (Security tab, Report a vulnerability) rather than a public issue.
