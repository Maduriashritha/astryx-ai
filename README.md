# ASTryx — AI Code Reviewer & OWASP Security Linter

ASTryx is a Next.js application for AI-assisted code reviews, OWASP security analysis, and suggested patches. It uses Gemini for server-side code analysis and Supabase for optional generation history.

## Features

- Security findings with severity, line numbers, and mitigation suggestions.
- A split-pane code review workspace with editable examples and suggested patches.
- Optional Supabase-backed generation history.
- **GitHub pull request reviews:** a signed GitHub App webhook asks Gemini to review changed code, posts inline comments, and completes the `ASTryx Security Review` check. Critical findings fail the check.

## Tech stack

- Next.js App Router and TypeScript
- Gemini API
- Supabase (optional application history)
- GitHub App webhooks and Checks/Reviews APIs for pull request reviews

## Local development

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Set `GEMINI_API_KEY` in `.env.local` to enable AI analysis. If you want application history, also configure `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY`; the service role key must remain server-side. See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) to install the GitHub App, configure webhook secrets, and require the review check before merging.

## Security review setup

The PR integration runs in the deployed Next.js app. Configure the GitHub App webhook at `/api/github/webhook` and set `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`, and `GEMINI_API_KEY` in the hosting environment. The route verifies GitHub's HMAC signature, never executes proposed code, and does not persist submitted diffs or findings. Branch protection must require the `ASTryx Security Review` check to block merges when the check fails.

## Deployment

Deploy the Next.js app to a Node.js host that supports Next.js `after()` callbacks and a route function duration of up to five minutes. Configure the environment variables in the host, then set the GitHub App webhook URL to the deployed host. Configure branch protection on each protected target branch to require `ASTryx Security Review`.

