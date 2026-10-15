Lecture animation project

A TypeScript and React project for creating lecture videos with Remotion.

## Development

Use Node.js 24 and npm 11. Install dependencies with `npm ci --cache /tmp/npm-cache`.
Run `npm run dev` to start Remotion Studio on port 3000. The `LectureIntro`
composition is a five-second, 1280×720 animation at 30 fps.

Edit `src/LectureIntro.tsx` for the animation and `src/Root.tsx` for composition
settings. No API keys, external services, or downloaded media are required.

## Validation and rendering

Run `npm run typecheck`, then `npm run render`. Rendering uses the cloud
environment's `/usr/bin/chromium` and two workers. On another machine, override
the browser with `npm run render -- --browser-executable=/path/to/chromium`.

The output is `out/lecture-intro.mp4` (H.264). Inspect it using:

```sh
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,avg_frame_rate,nb_frames -show_entries format=duration -of json out/lecture-intro.mp4
ffmpeg -v error -i out/lecture-intro.mp4 -f null -
```

Expected output: 1280×720, 30 fps, 150 frames, five seconds. The sample has no
audio track. Generated videos and installed dependencies are ignored by Git.
