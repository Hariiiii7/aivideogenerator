/** Sprint 1 handoff pipeline: SRT -> GPT plan -> Claude TSX artifacts. No execution. */
import {parseSrt} from './providers/descript';
import {planLecture} from './providers/gpt-director';
import {generateRemotionScene, type GeneratedScene} from './providers/claude-engineer';

export type GenerationPackage = {
  sourceDurationSeconds:number;
  plan: Awaited<ReturnType<typeof planLecture>>;
  artifacts:GeneratedScene[];
  executable:false;
  sandboxRequired:true;
};
export async function generateLectureSourceFromSrt(srt: string, duration: number): Promise<GenerationPackage> {
  const transcript = parseSrt(srt);
  if (!transcript.length) throw new Error('SRT contains no transcription segments');
  if (transcript.some(s=>s.startSeconds < 0 || s.endSeconds > duration))
    throw new Error('Transcript timestamps exceed video duration');
  const plan = await planLecture(transcript,duration);
  const artifacts: GeneratedScene[] = [];
  // Sequential by design to limit provider calls and spending in this initial version.
  for (const scene of plan.scenes) {
    artifacts.push(await generateRemotionScene(scene));
  }
  return {sourceDurationSeconds:duration,plan,artifacts,executable:false,sandboxRequired:true};
}
