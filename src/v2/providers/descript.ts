/** Descript API adapter. Requires a drive-scoped token. */
const API = 'https://descriptapi.com/v1';
export type ImportJob = {job_id: string; upload_urls?: Record<string, {upload_url: string}>};
export type JobStatus = Record<string, unknown>;

function token(): string {
  const value = process.env.DESCRIPT_API_TOKEN;
  if (!value) throw new Error('DESCRIPT_API_TOKEN is required');
  return value;
}
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(API + path, {
    ...options,
    headers: {Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', ...options.headers},
    signal: options.signal ?? AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Descript request failed: HTTP ${response.status}`);
  return await response.json() as T;
}
/** Import a video by a DIRECT media URL, not a YouTube/share page URL. */
export async function importLectureFromUrl(name: string, mediaUrl: string): Promise<ImportJob> {
  const url = new URL(mediaUrl);
  if (url.protocol !== 'https:') throw new Error('A secure direct media URL is required');
  if (name.length === 0 || name.length > 120) throw new Error('Invalid project name');
  return api<ImportJob>('/jobs/import/project_media', {
    method: 'POST',
    body: JSON.stringify({
      project_name: name,
      add_media: {'lecture.mp4': {url: mediaUrl}},
      add_compositions: [{name: 'Lecture', clips: [{media: 'lecture.mp4'}]}],
    }),
  });
}
/** Request local media upload; PUT bytes to the returned signed URL separately. */
export async function requestLectureUpload(name: string, fileSize: number): Promise<ImportJob> {
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) throw new Error('Invalid file size');
  return api<ImportJob>('/jobs/import/project_media', {
    method: 'POST',
    body: JSON.stringify({
      project_name: name,
      add_media: {'lecture.mp4': {content_type: 'video/mp4', file_size: fileSize}},
      add_compositions: [{name: 'Lecture', clips: [{media: 'lecture.mp4'}]}],
    }),
  });
}
export async function uploadLectureBytes(signedUrl: string, bytes: Uint8Array): Promise<void> {
  if (!signedUrl.startsWith('https://')) throw new Error('HTTPS signed URL required');
  const response = await fetch(signedUrl, {
    method: 'PUT', headers: {'Content-Type': 'application/octet-stream'},
    body: Buffer.from(bytes), signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`Descript signed upload failed: HTTP ${response.status}`);
}
export async function getDescriptJob(jobId: string): Promise<JobStatus> {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(jobId)) throw new Error('Invalid job ID');
  return api<JobStatus>(`/jobs/${encodeURIComponent(jobId)}`);
}
/**
 * Transcript export is a separate asynchronous handoff.
 * The export route and composition ID must be resolved against the pinned
 * Descript OpenAPI schema before enabling automation.
 */
export type TranscriptSegment = {startSeconds: number; endSeconds: number; text: string};
export function parseSrt(srt: string): TranscriptSegment[] {
  const toSeconds = (v: string) => {
    const match = /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/.exec(v);
    if (!match) throw new Error('Invalid SRT timestamp');
    return Number(match[1])*3600 + Number(match[2])*60 + Number(match[3]) + Number(match[4])/1000;
  };
  return srt.replace(/\r/g, '').trim().split(/\n\s*\n/).filter(Boolean).map(block => {
    const lines = block.split('\n'); const index = lines.findIndex(line => line.includes(' --> '));
    if (index < 0 || lines.length <= index + 1) throw new Error('Invalid SRT block');
    const [start, end] = lines[index].split(' --> ');
    const startSeconds = toSeconds(start.trim()), endSeconds = toSeconds(end.trim().split(' ')[0]);
    if (endSeconds <= startSeconds) throw new Error('Invalid SRT segment bounds');
    return {startSeconds, endSeconds, text: lines.slice(index+1).join(' ').trim()};
  });
}
