/**
 * BattleKeypad.tsx
 * 
 * Re-exports and wraps the Dynamic 6-Letter Sequential Typing Component
 * with full backward-compatibility for existing imports.
 */

import React from 'react';
import { BattleDynamicTyping, BattleDynamicTypingProps } from './BattleDynamicTyping';
import { MatrixTile } from './types';

export { BattleDynamicTyping };

export interface BattleKeypadProps {
  /** Target answer length (number of slots) */
  targetSlots: number;
  /** Optional target answer string */
  targetAnswer?: string;
  /** The matrix tiles */
  tiles?: MatrixTile[];
  /** Maximum timeout in milliseconds */
  timeoutMs?: number;
  /** Timestamp when answering phase started */
  startTime?: number;
  /** Callback fired automatically when answer is submitted */
  onSubmit: (answer: string) => void;
  /** Callback for real-time keystroke streaming to opponents */
  onKeystroke?: (currentSlots: string[]) => void;
  /** Callback when the countdown timer expires */
  onTimeout?: () => void;
  /** Whether the keypad is disabled */
  disabled?: boolean;
  /** If spectating, display the opponent's live typed letters */
  spectatorInput?: string[];
  /** Optional opponent name when spectating */
  opponentName?: string;
}

export const BattleKeypad: React.FC<BattleKeypadProps> = ({
  targetSlots,
  targetAnswer = '',
  onSubmit,
  onKeystroke,
  onTimeout,
  disabled = false,
  spectatorInput,
  opponentName,
}) => {
  return (
    <BattleDynamicTyping
      targetAnswer={targetAnswer}
      targetSlots={targetSlots}
      letterTimeoutMs={2000}
      onSubmit={onSubmit}
      onKeystroke={onKeystroke}
      onTimeout={onTimeout}
      disabled={disabled}
      spectatorInput={spectatorInput}
      opponentName={opponentName}
    />
  );
};
