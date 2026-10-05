import { TIMING } from './content';

/** Absolute start frame of each scene, derived from TIMING. */
const order = ['hook', 'intro', 'buzz', 'room', 'elo', 'close'] as const;
export type SceneKey = (typeof order)[number];

export const START = {} as Record<SceneKey | 'end', number>;
let acc = 0;
for (const key of order) {
  START[key] = acc;
  acc += TIMING[key];
}
START.end = acc;

export const TOTAL_FRAMES = acc;
