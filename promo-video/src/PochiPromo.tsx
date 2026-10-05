import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { COLORS, COPY, TIMING } from './content';
import { CopyBlock } from './components/Copy';
import { PhoneStage } from './PhoneStage';
import { Close } from './scenes/Close';
import { Hook } from './scenes/Hook';
import { START as S } from './timeline';

/** Scene copy is sequenced per scene; the phone persists underneath on its own stage. */
const SceneCopy: React.FC<{ duration: number; content: { eyebrow: string; headline: string; sub?: string }; brand?: boolean; enterAt?: number }> = ({
  duration,
  content,
  brand,
  enterAt,
}) => {
  const frame = useCurrentFrame();
  return <CopyBlock frame={frame} duration={duration} {...content} brandEyebrow={brand} enterAt={enterAt} />;
};

export const PochiPromo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 90% 60% at 50% 45%, #FDFBF7 0%, ${COLORS.background} 55%, #F1ECE0 100%)`,
    }}
  >
    <PhoneStage />

    <Sequence durationInFrames={TIMING.hook}>
      <Hook />
    </Sequence>
    <Sequence from={S.intro} durationInFrames={TIMING.intro}>
      <SceneCopy duration={TIMING.intro} content={COPY.intro} brand enterAt={8} />
    </Sequence>
    <Sequence from={S.buzz} durationInFrames={TIMING.buzz}>
      <SceneCopy duration={TIMING.buzz} content={COPY.buzz} />
    </Sequence>
    <Sequence from={S.room} durationInFrames={TIMING.room}>
      <SceneCopy duration={TIMING.room} content={COPY.room} />
    </Sequence>
    <Sequence from={S.elo} durationInFrames={TIMING.elo}>
      <SceneCopy duration={TIMING.elo} content={COPY.elo} />
    </Sequence>
    <Sequence from={S.close} durationInFrames={TIMING.close}>
      <Close />
    </Sequence>
  </AbsoluteFill>
);
