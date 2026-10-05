/**
 * Simplified recreations of PochiPochi screens (432×960 screen space),
 * modeled on the real app: app/(tabs)/play.tsx, src/battle/BattleGameView.tsx,
 * and app/(tabs)/leaderboard.tsx. Animated state is passed in as props.
 */
import React from 'react';
import { COLORS, UI } from '../content';
import { FONTS } from '../fonts';
import { Buzzer } from './Buzzer';
import { Pochi } from './Mascot';
import { SCREEN_W } from './Phone';

const PAD = 18;
const abs = (top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute',
  top,
  left: PAD,
  right: PAD,
  ...extra,
});

const label = (size: number, color: string = COLORS.inkMuted): React.CSSProperties => ({
  fontFamily: FONTS.body,
  fontWeight: 800,
  fontSize: size,
  letterSpacing: size * 0.12,
  color,
});

const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      height: 32,
      padding: '0 10px',
      borderRadius: 10,
      whiteSpace: 'nowrap',
      border: `2px solid ${COLORS.ink}`,
      background: COLORS.card,
      boxSizing: 'border-box',
      ...label(11.5, COLORS.primary),
      ...style,
    }}
  >
    {children}
  </div>
);

const Bolt: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = COLORS.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z" fill={color} />
  </svg>
);

const StatusBar: React.FC = () => (
  <div style={{ position: 'absolute', top: 14, left: 36, right: 32, display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>9:41</span>
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {[6, 9, 12].map((h) => (
        <div key={h} style={{ width: 3.5, height: h, borderRadius: 1, background: COLORS.ink }} />
      ))}
      <div style={{ width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${COLORS.ink}`, marginLeft: 4, padding: 1.5, boxSizing: 'border-box' }}>
        <div style={{ width: '75%', height: '100%', background: COLORS.ink, borderRadius: 1 }} />
      </div>
    </div>
  </div>
);

const MascotRow: React.FC<{ top: number; text: string; expression?: 'happy' | 'pensive' | 'excited' }> = ({
  top,
  text,
  expression = 'pensive',
}) => (
  <div style={abs(top, { display: 'flex', alignItems: 'center', gap: 12 })}>
    <Pochi size={60} expression={expression} />
    <div
      style={{
        flex: 1,
        border: `2px solid ${COLORS.ink}`,
        borderRadius: 16,
        background: COLORS.card,
        padding: '9px 12px',
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: 12.5,
        lineHeight: 1.4,
        color: COLORS.ink,
      }}
    >
      {text}
    </div>
  </div>
);

const Slot: React.FC<{ char?: string; tone?: 'primary' | 'correct'; w?: number }> = ({ char, tone = 'primary', w = 24 }) => {
  const filled = !!char;
  const fg = tone === 'correct' ? COLORS.correct : COLORS.primary;
  const bg = tone === 'correct' ? COLORS.correctLight : COLORS.primaryLight;
  return (
    <div
      style={{
        width: w,
        height: w * 1.25,
        borderRadius: 6,
        border: `1.5px solid ${filled ? fg : COLORS.border}`,
        background: filled ? bg : '#FBF9F4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONTS.body,
        fontWeight: 800,
        fontSize: w * 0.62,
        color: fg,
      }}
    >
      {char ?? <span style={{ color: '#B8B2A6', fontSize: w * 0.5 }}>_</span>}
    </div>
  );
};

const ClueText: React.FC<{ chars: number; cursor: boolean; size?: number }> = ({ chars, cursor, size = 16.5 }) => (
  <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: size, lineHeight: 1.45, color: COLORS.ink }}>
    {UI.clue.slice(0, Math.floor(chars))}
    {cursor && <span style={{ color: COLORS.primary }}> |</span>}
  </div>
);

const TabBar: React.FC<{ active: number }> = ({ active }) => {
  const tabs = ['Home', 'Pochi Solo', 'Notebook', 'Champions'];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 92,
        background: COLORS.card,
        borderTop: `2px solid ${COLORS.ink}`,
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: 12,
        boxSizing: 'border-box',
      }}
    >
      {tabs.map((t, i) => (
        <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 34,
              height: 30,
              borderRadius: 10,
              background: i === active ? COLORS.primary : 'transparent',
              border: `2px solid ${i === active ? COLORS.ink : '#94A3B8'}`,
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 11, color: i === active ? COLORS.primary : '#94A3B8' }}>
            {t}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ---------------------------------- Solo ---------------------------------- */

export const SoloScreen: React.FC<{ chars: number }> = ({ chars }) => {
  const p = Math.min(1, chars / UI.clue.length);
  const bonus = 1 + Math.pow(1 - p, 1.5); // README §2.2
  const words = ['ANDES', 'MOUNTAINS'];
  let index = 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StatusBar />
      <div style={abs(56, { display: 'flex', justifyContent: 'space-between' })}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill>{UI.category}</Pill>
          <Pill style={{ width: 32, padding: 0, justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2.5px solid ${COLORS.ink}` }} />
          </Pill>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill style={{ borderColor: '#F1A49C', background: COLORS.incorrectLight, color: COLORS.incorrect }}>
            <svg width="11" height="13" viewBox="0 0 24 28"><path d="M12 0 C14 8 22 10 22 18 A10 10 0 0 1 2 18 C2 12 7 10 8 4 C10 8 12 8 12 0 Z" fill={COLORS.incorrect} /></svg>
            3
          </Pill>
          <Pill style={{ borderColor: COLORS.primary, background: COLORS.primaryLight }}>{UI.playerElo} ELO</Pill>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 104, left: 0, right: 0, height: 1.5, background: COLORS.border }} />
      <MascotRow top={120} text="Words are revealing... Answer quickly for up to 2.0x speed bonus!" />
      <div style={abs(206, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 })}>
        {words.map((w) => (
          <div key={w} style={{ display: 'flex', gap: 6 }}>
            {w.split('').map((ch) => {
              const i = index++;
              const show = (i === 0 && p >= 0.4) || (i === UI.answer.length - 1 && p >= 0.75);
              return <Slot key={i} char={show ? ch : undefined} />;
            })}
          </div>
        ))}
        <div style={{ ...label(10.5), marginTop: 2 }}>14 LETTERS</div>
      </div>
      <div
        style={abs(326, {
          minHeight: 132,
          background: COLORS.card,
          border: `2.5px solid ${COLORS.ink}`,
          borderRadius: 20,
          padding: 18,
          boxSizing: 'border-box',
          boxShadow: `0 0 0 ${p < 1 ? 5 : 0}px rgba(0,0,159,0.08)`,
        })}
      >
        <ClueText chars={chars} cursor={p < 1} />
      </div>
      <div style={abs(476, { display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
        <Pill style={{ border: `1.5px solid ${COLORS.border}`, background: COLORS.backgroundSecondary, color: COLORS.inkSecondary }}>
          <Bolt size={13} color={bonus > 1.5 ? COLORS.gold : COLORS.inkSecondary} />
          <span style={{ color: bonus > 1.5 ? COLORS.goldDark : COLORS.inkSecondary }}>{bonus.toFixed(2)}x SPEED BONUS</span>
        </Pill>
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 11, color: COLORS.inkSecondary }}>
          Earlier answer = higher score
        </span>
      </div>
      <div style={abs(524, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 })}>
        {UI.options.map((o, i) => (
          <div
            key={o}
            style={{
              height: 56,
              borderRadius: 16,
              border: `2.5px solid ${COLORS.ink}`,
              background: COLORS.card,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              fontFamily: FONTS.body,
              fontWeight: 800,
              fontSize: 14.5,
              color: COLORS.ink,
              boxShadow: '2px 3px 0 rgba(15,23,42,0.12)',
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: `2px solid ${COLORS.ink}`,
                background: COLORS.backgroundSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              {'ABCD'[i]}
            </div>
            {o}
          </div>
        ))}
      </div>
      <div style={abs(690, { display: 'flex', justifyContent: 'center', gap: 26 })}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${COLORS.ink}` }} />
        ))}
      </div>
      <TabBar active={1} />
    </div>
  );
};

/* --------------------------------- Battle --------------------------------- */

const BattleTopBar: React.FC<{ badge: string }> = ({ badge }) => (
  <div style={abs(56, { display: 'flex', justifyContent: 'space-between' })}>
    <div style={{ display: 'flex', gap: 7 }}>
      <Pill style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.inkSecondary }}>←</Pill>
      <Pill style={{ background: COLORS.primaryLight, borderColor: COLORS.primary, color: COLORS.primaryDark }}>{UI.category}</Pill>
      <Pill style={{ background: COLORS.goldLight, borderColor: COLORS.gold, color: COLORS.goldDark }}>{badge}</Pill>
    </div>
    <Pill style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.inkSecondary }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.correct }} />
      24ms
    </Pill>
  </div>
);

const Matchup: React.FC<{ top: number; youScore: number; rivalScore: number; rivalName: string; rivalTag: string; flash?: number }> = ({
  top,
  youScore,
  rivalScore,
  rivalName,
  rivalTag,
  flash = 0,
}) => {
  const side = (tag: string, name: string, score: number, tone: 'you' | 'rival') => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexDirection: tone === 'you' ? 'row' : 'row-reverse' }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: tone === 'you' ? COLORS.primaryLight : COLORS.goldLight,
          border: `1.5px solid ${tone === 'you' ? COLORS.primary : COLORS.gold}`,
        }}
      />
      <div style={{ flex: 1, textAlign: tone === 'you' ? 'left' : 'right' }}>
        <div style={label(8.5, tone === 'you' ? COLORS.primary : COLORS.goldDark)}>{tag}</div>
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 15, color: COLORS.ink, whiteSpace: 'nowrap' }}>{name}</div>
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 12,
          color: tone === 'you' && flash > 0 ? COLORS.correct : COLORS.ink,
          transform: tone === 'you' ? `scale(${1 + flash * 0.25})` : undefined,
        }}
      >
        {score}
      </div>
    </div>
  );
  return (
    <div
      style={abs(top, {
        height: 62,
        borderRadius: 16,
        border: `2px solid ${COLORS.ink}`,
        background: COLORS.card,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 10,
        boxSizing: 'border-box',
      })}
    >
      {side('YOU', UI.you, youScore, 'you')}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: COLORS.ink,
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 11,
        }}
      >
        VS
      </div>
      {side(rivalTag, rivalName, rivalScore, 'rival')}
    </div>
  );
};

export const BattleScreen: React.FC<{
  chars: number;
  press: number;
  buzzed: boolean;
  typed: number;
  resolved: boolean;
  scoreFlash: number;
}> = ({ chars, press, buzzed, typed, resolved, scoreFlash }) => {
  const streaming = !buzzed;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StatusBar />
      <BattleTopBar badge="ROUND 3/10" />
      <Matchup top={102} youScore={resolved ? 60 : 40} rivalScore={20} rivalName={UI.rival} rivalTag="OPPONENT" flash={scoreFlash} />
      <MascotRow
        top={180}
        expression={resolved ? 'excited' : buzzed ? 'happy' : 'pensive'}
        text={
          resolved
            ? 'Correct! +20 pts to you.'
            : buzzed
            ? 'You won the buzz! Spell the answer quickly!'
            : `Facing ${UI.rival}! Words are revealing... Buzz in early!`
        }
      />
      <div style={abs(262, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 })}>
        <div style={label(10)}>TARGET ANSWER (14 LETTERS)</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {UI.answer.split('').map((ch, i) => (
            <Slot key={i} w={23} char={i < typed ? ch : undefined} tone={resolved ? 'correct' : 'primary'} />
          ))}
        </div>
      </div>
      <div
        style={abs(334, {
          background: COLORS.card,
          border: `2.5px solid ${COLORS.ink}`,
          borderRadius: 20,
          padding: 16,
          minHeight: 160,
          boxSizing: 'border-box',
        })}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              ...label(9.5, '#FFF'),
              background: streaming ? COLORS.ink : COLORS.gold,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            {streaming ? 'STREAMING' : 'BUZZ PAUSED'}
          </div>
          <div
            style={{
              ...label(9.5, resolved ? COLORS.correct : COLORS.goldDark),
              background: resolved ? COLORS.correctLight : COLORS.goldLight,
              padding: '4px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Bolt size={10} color={resolved ? COLORS.correct : COLORS.gold} />
            {resolved ? '+20 PTS WON' : buzzed ? '+20 PTS AT STAKE' : '+20 PTS SOLVE'}
          </div>
        </div>
        <ClueText chars={chars} cursor={streaming} size={16} />
      </div>
      <div style={{ position: 'absolute', top: 540, left: 0, width: SCREEN_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Buzzer size={150} press={press} dim={resolved} />
        <div style={label(10.5, buzzed ? COLORS.primary : COLORS.inkSecondary)}>
          {buzzed ? 'BUZZED IN!' : 'TAP TO FREEZE CLUE & ANSWER (+20 PTS)'}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Lobby ---------------------------------- */

export const LobbyScreen: React.FC<{ copied: boolean; matched: boolean }> = ({ copied, matched }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <StatusBar />
    <BattleTopBar badge={`ROOM: ${UI.roomCode}`} />
    <Matchup
      top={102}
      youScore={0}
      rivalScore={0}
      rivalName={matched ? UI.rival : 'Waiting...'}
      rivalTag={matched ? 'OPPONENT' : `ROOM: ${UI.roomCode}`}
    />
    <MascotRow
      top={180}
      expression={matched ? 'excited' : 'happy'}
      text={
        matched
          ? `Matched against ${UI.rival}! Match starting soon...`
          : "Send your friend the room code and password. I'll wait right here!"
      }
    />
    <div
      style={abs(270, {
        background: COLORS.card,
        border: `2.5px solid ${COLORS.ink}`,
        borderRadius: 20,
        padding: 16,
        boxSizing: 'border-box',
      })}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: matched ? COLORS.correct : COLORS.gold }} />
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 15, letterSpacing: 0.6, color: matched ? COLORS.correct : COLORS.ink }}>
          {matched ? 'CHALLENGER MATCHED!' : 'WAITING FOR CHALLENGER'}
        </div>
      </div>
      <div style={{ background: COLORS.primarySubtle, border: `1.5px solid ${COLORS.primaryLight}`, borderRadius: 14, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[
            ['ROOM CODE', UI.roomCode],
            ['PASSWORD', UI.roomPassword],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={label(9.5)}>{k}</div>
              <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: COLORS.primary }}>{v}</div>
            </div>
          ))}
        </div>
        {!matched && (
          <div
            style={{
              marginTop: 12,
              height: 40,
              borderRadius: 12,
              border: `2px solid ${copied ? COLORS.correct : COLORS.primary}`,
              background: COLORS.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...label(11.5, copied ? COLORS.correct : COLORS.primaryDark),
            }}
          >
            {copied ? '✓  INVITE COPIED' : 'INVITE A FRIEND'}
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.inkMuted }}>
        {matched
          ? `Matched with ${UI.rival}! Round 1 starting shortly...`
          : 'Your friend enters this code and password under Join Room.'}
      </div>
    </div>
  </div>
);

/* ------------------------------- Standings -------------------------------- */

/** Screen-space centers of the four Category Proficiency pills (for the Elo scene hand-off). */
export const CATEGORY_PILL_CENTERS = [0, 1, 2, 3].map((i) => ({
  x: PAD + (i % 2) * 206 + 99,
  y: 474 + Math.floor(i / 2) * 68 + 29,
}));

export const StandingsScreen: React.FC<{ hidePills?: number }> = ({ hidePills = 0 }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <StatusBar />
    <div style={abs(58, { textAlign: 'center' })}>
      <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 28, color: COLORS.ink }}>Trivia Champions</div>
      <div style={{ ...label(10), marginTop: 2 }}>HALL OF FAME • ELO RANKINGS</div>
    </div>
    <div
      style={abs(126, {
        height: 174,
        borderRadius: 20,
        border: `2.5px solid ${COLORS.ink}`,
        background: COLORS.card,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      })}
    >
      <svg width="30" height="22" viewBox="0 0 30 22"><path d="M2 20 L4 5 L10 12 L15 2 L20 12 L26 5 L28 20 Z" fill={COLORS.gold} /></svg>
      <Pochi size={58} expression="excited" />
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 11, color: COLORS.inkMuted }}>Current No. 1 Champion</div>
      <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 18, color: COLORS.ink }}>Mika</div>
    </div>
    <div
      style={abs(314, {
        height: 82,
        borderRadius: 18,
        border: `2px solid ${COLORS.primary}`,
        background: COLORS.primarySubtle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        boxSizing: 'border-box',
      })}
    >
      <div>
        <div style={label(9.5, COLORS.primary)}>YOUR STANDING</div>
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 19, color: COLORS.ink }}>Grandmaster Owl</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, color: COLORS.primary }}>{UI.playerElo}</div>
        <div style={label(9.5, COLORS.primary)}>ELO</div>
      </div>
    </div>
    <div style={abs(414, { fontFamily: FONTS.heading, fontWeight: 700, fontSize: 17, color: COLORS.ink })}>Category Proficiencies</div>
    {UI.categoryElos.map((c, i) => {
      const { x, y } = CATEGORY_PILL_CENTERS[i];
      return (
        <div
          key={c.key}
          style={{
            position: 'absolute',
            left: x - 99,
            top: y - 29,
            width: 198,
            height: 58,
            borderRadius: 14,
            border: `2px solid ${COLORS.ink}`,
            background: COLORS.card,
            padding: '8px 12px',
            boxSizing: 'border-box',
            opacity: 1 - hidePills,
          }}
        >
          <div style={label(9.5)}>{c.key}</div>
          <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 20, color: COLORS.ink }}>{c.value}</div>
        </div>
      );
    })}
    <div style={abs(624, { fontFamily: FONTS.heading, fontWeight: 700, fontSize: 17, color: COLORS.ink })}>Global Ranks</div>
    {['Mika', 'Theo', 'Rin'].map((n, i) => (
      <div
        key={n}
        style={abs(656 + i * 56, {
          height: 48,
          borderRadius: 14,
          border: `1.5px solid ${COLORS.border}`,
          background: COLORS.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          fontFamily: FONTS.body,
          fontWeight: 800,
          fontSize: 14,
          color: COLORS.ink,
        })}
      >
        <span>#{i + 1} {n}</span>
        <span style={{ fontFamily: FONTS.mono, fontWeight: 700, color: COLORS.inkSecondary }}>{[1684, 1612, 1570][i]}</span>
      </div>
    ))}
    <TabBar active={3} />
  </div>
);
