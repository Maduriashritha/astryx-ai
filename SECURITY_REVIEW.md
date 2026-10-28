# GitHub pull request security reviews

ASTryx can review pull request changes with Gemini, post inline comments on added diff lines, and publish a GitHub check named **ASTryx Security Review**. The check fails when the analysis reports at least one Critical finding. Analysis errors, incomplete diffs, and missing setup also fail closed; a partial scan is never reported as clean.

The integration uses the existing Next.js App Router deployment. It does not run pull request code and does not store source diffs or findings in the application database. GitHub check runs provide the durable state used to avoid reprocessing completed deliveries for the same pull request commit.

## 1. Create and install a GitHub App

Create a GitHub App owned by the account or organization that owns the repository. Set its webhook URL to:

```text
https://<your-deployed-app-host>/api/github/webhook
```

Generate a long random webhook secret and enable the webhook. Subscribe to the **Pull request** event.

Grant only these repository permissions:

- **Pull requests: Read and write** — read changed-file diffs and post inline reviews.
- **Checks: Read and write** — create and complete the status check.
- **Metadata: Read-only** — required by GitHub.

Install the App on the `astryx-ai` repository only. Keep the App private and store its private key securely.

## 2. Configure deployment secrets

Set these server-side environment variables in the Next.js hosting environment (for Vercel, add them to the project settings):

| Variable | Value |
| --- | --- |
| `GITHUB_APP_ID` | Numeric App ID from the GitHub App settings |
| `GITHUB_APP_PRIVATE_KEY` | Full PEM private key; literal `\\n` line breaks are accepted |
| `GITHUB_WEBHOOK_SECRET` | The same random secret configured on the App webhook |
| `GEMINI_API_KEY` | Server-side Gemini API key |
| `GEMINI_MODEL` | Optional model override; defaults to `gemini-3.8-flash` |

Never prefix these values with `NEXT_PUBLIC_`, commit them, or expose them in client-side code. Keep `GEMINI_API_KEY` server-only; it is separate from any browser-visible configuration.

After setting the values, redeploy the application and use the GitHub App webhook page's **Recent deliveries** panel to confirm a `pull_request` delivery receives HTTP 202.

## 3. Require the check before merge

In the repository's branch protection rule or ruleset for the target branch, enable **Require status checks to pass before merging** and select **ASTryx Security Review**. GitHub will then block merges when a Critical finding is reported or the scan cannot complete. The integration publishes the check; repository branch protection must require it to enforce the result.

The check fails closed when Gemini is unavailable, a changed text file has no diff patch, the diff is over 100 KB, or the review cannot be posted. Fix the cause and push a new commit to run the scan again.

## Events and safety

- Reviews run for pull request `opened`, `synchronize`, `reopened`, and `ready_for_review` events.
- The webhook verifies `X-Hub-Signature-256` against the raw request body using HMAC-SHA256 and a timing-safe comparison before parsing the payload.
- GitHub App installation tokens are created for the installation in the signed event; no personal access token is needed.
- The route reads GitHub's PR diff as untrusted data and never checks out or executes proposed code.
- Gemini output is validated before posting. Inline comments are limited to added lines from the PR diff, which prevents comments from landing on unrelated context.
- The reviewer does not persist submitted source or findings. GitHub retains the PR review and check result.
- GitHub limits a single review to 50 inline comments. If more than 50 findings are returned, the check summary calls out the limit while Critical findings still fail the check.
- A review marker keyed to the commit SHA prevents duplicate comments when GitHub retries the same delivery. A later commit receives a new review; older GitHub review comments may become outdated naturally.

## Troubleshooting

- **401 Invalid webhook signature:** Confirm the GitHub App webhook secret matches `GITHUB_WEBHOOK_SECRET` exactly.
- **503 Not configured:** Set all required server environment variables and redeploy.
- **GitHub permission error:** Verify the App permissions above and reinstall/approve it after changing permissions.
- **Gemini error:** Verify the API key, model availability, quota, and network access. The check remains failed until a complete scan succeeds.
- **Check passes but merge is still allowed:** Add **ASTryx Security Review** to the required status checks for the target branch.

