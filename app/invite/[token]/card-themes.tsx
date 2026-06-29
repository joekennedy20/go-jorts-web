/**
 * Invite card themes — the "vibe" looks for the Open Graph image that
 * unfurls when an invite link is pasted into a text / DM. Each theme is
 * a config (colors, fonts, layout, icon) applied to the real plan name,
 * date, location, and who's-in headcount.
 *
 * First three templates (Joe 2026-06-29) — type-driven, no photo:
 *   girl-dinner  : huge Anton type, LEFT-aligned + stacked, clinking
 *                  glasses icon, black regular-weight details
 *   dinner-party : centered cream editorial serif (DM Serif)
 *   cocktail-hour: dark editorial serif, LEFT-aligned + stacked, with a
 *                  martini glass to the right of the title
 *
 * Glass icons are original SVGs drawn here (no third-party art → no
 * licensing/copyright question), tinted per theme and embedded as data
 * URIs so Satori renders them as <img>.
 */
import { formatDay, type PlanSummary } from './invite-data';

export type ThemeKey = 'girl-dinner' | 'dinner-party' | 'cocktail-hour';

interface ThemeConf {
  bg: string;
  title: string;
  sub: string;
  wordmark: string;
  ring: string; // avatar ring = bg, so circles read as "punched out"
  headcount: string;
  titleFont: 'Anton' | 'Serif';
  detailFont: 'Sans' | 'Serif';
  detailColor: string;
  align: 'left' | 'center';
  stackWords: boolean;
  icon?: 'cheers' | 'martini';
  iconColor?: string;
  editorial: boolean;
  eyebrow?: string;
}

const THEMES: Record<ThemeKey, ThemeConf> = {
  'girl-dinner': {
    bg: '#F7D9D5', title: '#E8462E', sub: '#1A1A1A', wordmark: '#E8462E',
    ring: '#F7D9D5', headcount: '#E8462E', titleFont: 'Anton',
    detailFont: 'Sans', detailColor: '#1A1A1A',
    align: 'left', stackWords: true, icon: 'cheers', iconColor: '#E8462E',
    editorial: false,
  },
  'dinner-party': {
    bg: '#F3F0E7', title: '#1A1A1A', sub: '#3A3A3A', wordmark: '#9B8F72',
    ring: '#F3F0E7', headcount: '#1A1A1A', titleFont: 'Serif',
    detailFont: 'Serif', detailColor: '#3A3A3A',
    align: 'center', stackWords: false, editorial: true, eyebrow: 'you’re invited',
  },
  'cocktail-hour': {
    bg: '#14241C', title: '#F5EFE0', sub: 'rgba(245,239,224,0.72)', wordmark: '#E8A020',
    ring: '#14241C', headcount: '#F5EFE0', titleFont: 'Serif',
    detailFont: 'Serif', detailColor: 'rgba(245,239,224,0.72)',
    align: 'left', stackWords: true, icon: 'martini', iconColor: '#E8A020',
    editorial: true,
  },
};

export function pickTheme(plan: PlanSummary | null): ThemeKey {
  const explicit = (plan as { theme?: ThemeKey } | null)?.theme;
  if (explicit && THEMES[explicit]) return explicit;
  const n = (plan?.name || '').toLowerCase();
  if (/cocktail|martini|drinks|happy hour|wine|aperol|negroni|bar\b/.test(n)) return 'cocktail-hour';
  if (/girl dinner|girls|brunch|gals|bites|snack|hang\b/.test(n)) return 'girl-dinner';
  return 'dinner-party';
}

// ── Original glass icons (drawn here, tinted per theme) ──────────────
function iconUri(kind: 'cheers' | 'martini', color: string): string {
  const svg =
    kind === 'cheers'
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 120" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
           <g transform="rotate(-16 60 100)"><path d="M40 20 Q40 52 60 56 Q80 52 80 20"/><line x1="60" y1="56" x2="60" y2="92"/><line x1="45" y1="94" x2="75" y2="94"/></g>
           <g transform="rotate(16 90 100)"><path d="M70 20 Q70 52 90 56 Q110 52 110 20"/><line x1="90" y1="56" x2="90" y2="92"/><line x1="75" y1="94" x2="105" y2="94"/></g>
           <g stroke="none" fill="${color}"><path d="M75 4 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z"/></g>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 150" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
           <path d="M16 26 L114 26 L65 80 Z"/><line x1="65" y1="80" x2="65" y2="128"/><line x1="36" y1="130" x2="94" y2="130"/>
           <line x1="80" y1="30" x2="94" y2="16"/><circle cx="78" cy="42" r="7" fill="${color}" stroke="none"/>
         </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const AVATAR_COLORS = ['#E2725B', '#5B8DE2', '#7BC47F', '#E2B85B', '#B57BE2'];

function Footer({ names, conf }: { names: string[]; conf: ThemeConf }) {
  if (!names.length) return null;
  const shown = names.slice(0, 5);
  const extra = names.length - shown.length;
  const circle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 60, height: 60, borderRadius: 60, border: `4px solid ${conf.ring}`,
    color: '#FFFFFF', fontFamily: 'Anton', fontSize: 26,
  } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 44 }}>
      <div style={{ display: 'flex' }}>
        {shown.map((nm, i) => (
          <div key={i} style={{ ...circle, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], marginLeft: i === 0 ? 0 : -16 }}>
            {(nm.trim()[0] || '?').toUpperCase()}
          </div>
        ))}
        {extra > 0 ? (
          <div style={{ ...circle, backgroundColor: 'rgba(0,0,0,0.18)', color: conf.headcount, fontSize: 22, marginLeft: -16 }}>
            +{extra}
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', marginLeft: 22, fontFamily: conf.editorial ? 'Serif' : 'Anton', fontSize: 30, letterSpacing: conf.editorial ? 1 : 2, color: conf.headcount }}>
        {names.length} going
      </div>
    </div>
  );
}

function StackedTitle({ words, size, color, font, upper }: { words: string[]; size: number; color: string; font: string; upper: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {words.map((w, i) => (
        <div key={i} style={{ display: 'flex', fontFamily: font, fontSize: size, lineHeight: 0.96, color }}>
          {upper ? w.toUpperCase() : w}
        </div>
      ))}
    </div>
  );
}

export function InviteCard({ plan, theme }: { plan: PlanSummary | null; theme: ThemeKey }) {
  const c = THEMES[theme];
  const name = plan?.name || "You're invited";
  const details = plan
    ? ([formatDay(plan.day), plan.time, plan.location].filter(Boolean) as string[])
    : [];
  const items = c.align === 'left' ? 'flex-start' : 'center';
  const words = name.split(/\s+/);

  const titleSize = c.titleFont === 'Anton'
    ? (words.length >= 3 ? 80 : 104)
    : (words.length >= 3 ? 72 : 88);

  const titleNode = c.stackWords ? (
    <StackedTitle words={words} size={titleSize} color={c.title} font={c.titleFont} upper={c.titleFont === 'Anton'} />
  ) : (
    <div style={{ display: 'flex', textAlign: 'center', fontFamily: c.titleFont, fontSize: name.length > 13 ? 96 : 118, lineHeight: 0.98, color: c.title, maxWidth: 1040 }}>
      {name}
    </div>
  );

  const titleBlock = c.icon ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {titleNode}
      <img
        src={iconUri(c.icon, c.iconColor || c.title)}
        width={c.icon === 'cheers' ? 150 : 128}
        height={c.icon === 'cheers' ? 120 : 148}
        style={{ marginLeft: 30 }}
        alt=""
      />
    </div>
  ) : titleNode;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: items, justifyContent: 'center', backgroundColor: c.bg, padding: '60px 84px' }}>
      <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 30, letterSpacing: 4, color: c.wordmark, marginBottom: 26 }}>
        jorts
      </div>

      {c.editorial && c.eyebrow ? (
        <div style={{ display: 'flex', fontFamily: 'Serif', fontStyle: 'italic', fontSize: 38, color: c.sub, marginBottom: 14 }}>
          {c.eyebrow}
        </div>
      ) : null}

      {titleBlock}

      {c.editorial ? (
        <div style={{ display: 'flex', width: 120, height: 2, backgroundColor: c.sub, opacity: 0.4, margin: '30px 0' }} />
      ) : (
        <div style={{ display: 'flex', height: 32 }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: items }}>
        {details.map((d, i) => (
          <div key={i} style={{ display: 'flex', fontFamily: c.detailFont, fontSize: c.detailFont === 'Sans' ? 28 : 27, letterSpacing: c.detailFont === 'Sans' ? 2 : 4, color: c.detailColor, marginTop: i ? 8 : 0 }}>
            {d.toUpperCase()}
          </div>
        ))}
      </div>

      <Footer names={plan?.confirmed_names || []} conf={c} />
    </div>
  );
}
