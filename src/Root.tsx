import {Composition} from 'remotion';
import {LectureIntro} from './LectureIntro';

export const Root = () => (
  <Composition
    id="LectureIntro"
    component={LectureIntro}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
