import React from 'react';
import { Composition } from 'remotion';
import { VIDEO } from './content';
import { PochiPromo } from './PochiPromo';
import { TOTAL_FRAMES } from './timeline';
import './fonts';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PochiPromo"
    component={PochiPromo}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
