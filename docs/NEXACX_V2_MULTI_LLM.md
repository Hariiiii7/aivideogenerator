# NexaCX V2 — Dynamic multi-LLM architecture (Sprint 1)

## Current implementation
1. Descript adapter (`src/v2/providers/descript.ts`): create media import job by direct HTTPS media URL or signed-upload workflow, poll job status, parse SRT transcript.
2. GPT director (`src/v2/providers/gpt-director.ts`): POST to OpenAI Responses API with strict JSON schema for time-bounded scene briefs.
3. Claude engineer (`src/v2/providers/claude-engineer.ts`): POST to Anthropic Messages API and request one new Remotion TSX source file per planned scene.
4. Orchestrator (`src/v2/pipeline.ts`): accepts SRT content, produces a GPT plan and unexecuted Claude source artifacts.

**Status:** integration adapters committed; no live credentialed API calls, tests, worker, user-facing API or finished video have been verified. The SRT workflow is currently the usable handoff; Descript API transcript export wiring remains to be added once project/composition IDs and output format are confirmed.

## Setup (server-side environment only)
```text
DESCRIPT_API_TOKEN=...   # drive-scoped Descript token
OPENAI_API_KEY=...
OPENAI_MODEL=...          # configured model supporting structured output
ANTHROPIC_API_KEY=...
CLAUDE_MODEL=...          # configured Anthropic model identifier
```
Do not add actual keys to GitHub. The application currently has no env loader; set environment variables securely in the server process.

## Provider docs
- Descript: https://help.descript.com/developers (imports POST /v1/jobs/import/project_media; signed uploads; job polling; separate transcript export)
- OpenAI: https://developers.openai.com/api/docs/guides/structured-outputs
- Anthropic: https://platform.claude.com/docs/en/api/typescript/messages/create

## Security: dynamic AI code is NOT trusted
The source generation function **returns an artifact only**. It does not run, install, bundle, or import the generated code. Simple prompt restrictions or text checks are not a sandbox.

Before automatic execution build a separate disposable render worker with:
- Hardened container or microVM boundary; non-root; no host Docker socket; no privilege escalation.
- No outbound networking or cloud credentials; read-only package cache with locked dependencies; no npm install during render.
- Limit CPU/RAM/PIDs/disk/output bytes and execution time; enforce input/video caps.
- Static TSX inspection and compile checks, plus per-scene human approval during the pilot.
- Inject input assets through read-only sandbox mount, output through a designated writable directory.
- Collect compiler errors/diagnostics, render screenshots and QA artifacts.
- Never execute generated source inside the API process or GitHub Actions with repository secrets.

## Sprint 1 follow-ups
1. Verify `npm ci` and `npm run typecheck` on a clean checkout.
2. Pin compatible provider model IDs via deployment settings; make live test calls with test media and explicit cost caps.
3. Implement Descript transcript export based on actual composition IDs and API spec.
4. Add provider mocks, invalid transcript tests, schema tests, failure/retry/timeouts and spending limits.
5. Build the isolated code rendering worker, plus human approval interface for generated TSX.
6. Inspect the editable legacy lecture ZIP and preserve the original audio and layout.
7. Produce a 15-second test preview only after the sandbox and QA gates pass.

This V2 implementation differs from the prior template-driven plan: it **generates new TSX per scene**. The existing `src/v2/storyboard.ts` template-schema module remains for compatibility but is not currently the output contract of the dynamic GPT plan.
