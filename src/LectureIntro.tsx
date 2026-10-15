import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const LectureIntro = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 18}});
  const progress = frame / (durationInFrames - 1);
  return (
    <AbsoluteFill style={{backgroundColor: '#10192e', color: '#f4f7ff', fontFamily: 'sans-serif', padding: 90, justifyContent: 'center'}}>
      <div style={{color: '#5eead4', fontSize: 24, letterSpacing: 5}}>LECTURE 01</div>
      <h1 style={{fontSize: 76, margin: '24px 0', opacity: entrance, transform: `translateY(${(1 - entrance) * 40}px)`}}>Ideas into motion</h1>
      <p style={{fontSize: 32, color: '#b9c8e5', opacity: interpolate(frame, [25, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>Explain. Animate. Understand.</p>
      <div style={{height: 8, backgroundColor: '#263650', marginTop: 48, borderRadius: 4, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${progress * 100}%`, backgroundColor: '#5eead4'}} />
      </div>
    </AbsoluteFill>
  );
};
