/**
 * NexaCX V2 storyboard contract.
 * AI planners produce JSON; the renderer consumes only validated scene data.
 * This module intentionally has no dependency on a model provider or renderer.
 */
export const VISUAL_TYPES = ['animated-checklist','text-reveal','flow-diagram','equation','concept-card','teacher-focus'] as const;
export type VisualType = (typeof VISUAL_TYPES)[number];
export type TeacherLayout = 'original' | 'bottom-right' | 'left' | 'hidden';
export type StoryboardElement = {
  id: string;
  type: 'text' | 'check' | 'node' | 'arrow' | 'equation';
  text?: string;
  atSeconds?: number;
};
export type StoryboardScene = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  visualType: VisualType;
  title: string;
  teacherLayout: TeacherLayout;
  elements: StoryboardElement[];
};
export type Storyboard = {
  version: 2;
  sourceDurationSeconds: number;
  fps: number;
  scenes: StoryboardScene[];
};
export type ValidationResult =
  | {ok: true; value: Storyboard}
  | {ok: false; errors: string[]};

const object = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const layouts = ['original','bottom-right','left','hidden'];
const elementTypes = ['text','check','node','arrow','equation'];

export function validateStoryboard(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!object(input)) return {ok: false, errors: ['Storyboard must be an object']};
  if (input.version !== 2) errors.push('version must be 2');
  if (!finite(input.sourceDurationSeconds) || input.sourceDurationSeconds <= 0 || input.sourceDurationSeconds > 14400)
    errors.push('sourceDurationSeconds must be within (0, 14400]');
  if (!finite(input.fps) || !Number.isInteger(input.fps) || input.fps < 1 || input.fps > 120)
    errors.push('fps must be an integer from 1 to 120');
  if (!Array.isArray(input.scenes) || input.scenes.length > 500)
    errors.push('scenes must be an array with at most 500 items');
  if (errors.length || !Array.isArray(input.scenes)) return {ok: false, errors};
  const ids = new Set<string>();
  input.scenes.forEach((s: unknown, i: number) => {
    const at = `scenes[${i}]`;
    if (!object(s)) { errors.push(`${at} must be an object`); return; }
    if (!text(s.id, 80) || ids.has(s.id as string)) errors.push(`${at}.id must be unique and nonempty`);
    else ids.add(s.id);
    if (!finite(s.startSeconds) || !finite(s.endSeconds) || s.startSeconds < 0 ||
        s.endSeconds <= s.startSeconds || s.endSeconds > (input.sourceDurationSeconds as number))
      errors.push(`${at} has invalid time bounds`);
    if (!VISUAL_TYPES.includes(s.visualType as VisualType)) errors.push(`${at}.visualType is unsupported`);
    if (!text(s.title, 120)) errors.push(`${at}.title must be 1-120 characters`);
    if (!layouts.includes(s.teacherLayout as string)) errors.push(`${at}.teacherLayout is unsupported`);
    if (!Array.isArray(s.elements) || s.elements.length > 30) {
      errors.push(`${at}.elements must contain at most 30 items`);
      return;
    }
    s.elements.forEach((e: unknown, j: number) => {
      if (!object(e) || !text(e.id, 80) || !elementTypes.includes(e.type as string) ||
          (e.text !== undefined && (typeof e.text !== 'string' || e.text.length > 240)) ||
          (e.atSeconds !== undefined && (!finite(e.atSeconds) || e.atSeconds < s.startSeconds! || e.atSeconds > s.endSeconds!)))
        errors.push(`${at}.elements[${j}] is invalid`);
    });
  });
  if (errors.length) return {ok: false, errors};
  return {ok: true, value: input as Storyboard};
}

export function secondsToFrames(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds) || !Number.isFinite(fps) || fps <= 0)
    throw new Error('Invalid time or frame rate');
  return Math.round(seconds * fps);
}
