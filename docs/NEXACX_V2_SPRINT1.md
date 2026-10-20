# NexaCX AI V2 — Sprint 1

## Baseline inspection (20 October 2026)
- Default branch: `main`. This feature branch leaves `main` intact.
- Current application entry point: `src/index.ts`; root: `src/Root.tsx`.
- Registered application composition: `LectureIntro`, 150 frames, 30 fps, 1280×720, **without audio**.
- `deliverables/password-lecture-1080p.mp4` is the separate verified lecture deliverable.
- `deliverables/password-lecture-source.zip` contains the editable lecture source; its internal code still needs inspection before migrating the full renderer.
- No automated upload, transcription, AI storyboard planner, job orchestration or complete product API was verified in the inspected application.

## First implementation increment
- `src/v2/storyboard.ts`: TypeScript contract, finite timing/bounds checks, supported visual type allowlist, primitive text/element limits, teacher layout allowlist and seconds-to-frames function.
- `examples/v2-password-storyboard.json`: **illustrative fixture only**. Its element timestamps are placeholders, not verified speech-alignment data.

The validator is a baseline, not a complete security boundary. Before accepting untrusted model output, add strict key handling, per-element ID uniqueness, monotonic/overlap policy, frame-rate/source-media consistency, safe layout bounds and schema-driven tests. Never execute model-generated JS/JSX.

## Sprint 1 implementation order
1. Verify existing commands on a clean checkout with Node.js 24 / npm 11: `npm ci --cache /tmp/npm-cache`, `npm run typecheck`, `npm run render`. The existing render command assumes `/usr/bin/chromium`.
2. Download and inspect `deliverables/password-lecture-source.zip` and `LECTURE.md`. Locate source-video imports, scene definitions, render settings and audio-mux commands.
3. Add unit tests to the storyboard validator, especially malformed model data, invalid/overlapping timestamps, frame conversion and unsupported visual types.
4. Register a separate `NexaV2Preview` composition; do not overwrite `LectureIntro`.
5. Implement a deterministic `animated-checklist` scene from storyboard JSON and render a short silent preview.
6. Add a transcription-provider adapter and an AI planner with JSON-schema-validated output only after the deterministic renderer is tested.
7. Preserve source audio through muxing and compare hashes/decoded streams during QA.

## Sprint 1 completion gates
- Clean baseline install/typecheck/render verified.
- Full editable password lecture source inspected and migration map documented.
- Storyboard validation tests passing.
- A storyboard-driven Remotion preview renders reproducibly.
- Existing Version 1 output and `main` are unchanged.

## Scope and status
**Implemented in this branch:** storyboard contract and example JSON only.

**Not yet implemented:** provider integration, dynamic composition, teacher detection, reusable visual templates, automatic speech alignment, web UI, job queue, full lecture render, automated export. Do not call Version 2 automated until those components are integrated and tested.
