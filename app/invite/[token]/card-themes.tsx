/**
 * Invite card themes — the "vibe" looks for the Open Graph image that
 * unfurls when an invite link is pasted into a text / DM. Each theme is
 * just a config (colors + which display font) applied to the real plan
 * name, date, location, and who's-in headcount.
 *
 * First three templates (Joe 2026-06-29): the type-driven ones that
 * need no photo —
 *   girl-dinner  : huge bold type on color (Anton)         — "Typography"
 *   dinner-party : clean cream editorial serif (DM Serif)  — "Editorial"
 *   cocktail-hour: dark elevated editorial serif           — "Editorial"
 *
 * Photographic themes (Rooftop / House Party / Poolside) come next and
 * need a photo source, so they're intentionally not here yet.
 *
 * Theme selection is data-first: an explicit `theme` on the plan wins
 * (for when the app ships a vibe picker); until then we auto-pick from
 * the plan name as a sensible interim default.
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
  editorial: boolean;
  eyebrow?: string;
}

const THEMES: Record<ThemeKey, ThemeConf> = {
  'girl-dinner': {
    bg: '#F7D9D5', title: '#E8462E', sub: '#E8462E', wordmark: '#E8462E',
    ring: '#F7D9D5', headcount: '#E8462E', titleFont: 'Anton', editorial: false,
  },
  'dinner-party': {
    bg: '#F3F0E7', title: '#1A1A1A', sub: '#3A3A3A', wordmark: '#9B8F72',
    ring: '#F3F0E7', headcount: '#1A1A1A', titleFont: 'Serif', editorial: true,
    eyebrow: 'you’re invited',
  },
  'cocktail-hour': {
    bg: '#14241C', title: '#F5EFE0', sub: 'rgba(245,239,224,0.72)', wordmark: '#E8A020',
    ring: '#14241C', headcount: '#F5EFE0', titleFont: 'Serif', editorial: true,
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

const AVATAR_COLORS = ['#E2725B', '#5B8DE2', '#7BC47F', '#E2B85B', '#B57BE2'];

function Footer({ names, conf }: { names: string[]; conf: ThemeConf }) {
  if (!names.length) return null;
  const shown = names.slice(0, 5);
  const extra = names.length - shown.length;
  const circle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 60,
    border: `4px solid ${conf.ring}`,
    color: '#FFFFFF',
    fontFamily: 'Anton',
    fontSize: 26,
  } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 48 }}>
      <div style={{ display: 'flex' }}>
        {shown.map((nm, i) => (
          <div
            key={i}
            style={{
              ...circle,
              backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
              marginLeft: i === 0 ? 0 : -16,
            }}
          >
            {(nm.trim()[0] || '?').toUpperCase()}
          </div>
        ))}
        {extra > 0 ? (
          <div
            style={{
              ...circle,
              backgroundColor: 'rgba(0,0,0,0.18)',
              color: conf.headcount,
              fontSize: 22,
              marginLeft: -16,
            }}
          >
            +{extra}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          marginLeft: 22,
          fontFamily: conf.editorial ? 'Serif' : 'Anton',
          fontSize: 30,
          letterSpacing: conf.editorial ? 1 : 2,
          color: conf.headcount,
        }}
      >
        {names.length} going
      </div>
    </div>
  );
}

export function InviteCard({
  plan,
  theme,
}: {
  plan: PlanSummary | null;
  theme: ThemeKey;
}) {
  const c = THEMES[theme];
  const name = plan?.name || "You're invited";
  const details = plan
    ? ([formatDay(plan.day), plan.time, plan.location].filter(Boolean) as string[])
    : [];

  const titleSize =
    c.titleFont === 'Anton'
      ? name.length > 20 ? 86 : name.length > 12 ? 116 : 140
      : name.length > 22 ? 72 : name.length > 13 ? 96 : 118;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.bg,
        padding: '64px 80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: 'Anton',
          fontSize: 30,
          letterSpacing: 4,
          color: c.wordmark,
          marginBottom: 28,
        }}
      >
        jorts
      </div>

      {c.editorial && c.eyebrow ? (
        <div
          style={{
            display: 'flex',
            fontFamily: 'Serif',
            fontStyle: 'italic',
            fontSize: 38,
            color: c.sub,
            marginBottom: 14,
          }}
        >
          {c.eyebrow}
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          textAlign: 'center',
          fontFamily: c.titleFont,
          fontSize: titleSize,
          lineHeight: 0.98,
          color: c.title,
          maxWidth: 1040,
        }}
      >
        {c.titleFont === 'Anton' ? name.toUpperCase() : name}
      </div>

      {c.editorial ? (
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 2,
            backgroundColor: c.sub,
            opacity: 0.4,
            margin: '30px 0',
          }}
        />
      ) : (
        <div style={{ display: 'flex', height: 30 }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {details.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              fontFamily: c.editorial ? 'Serif' : 'Anton',
              fontSize: c.editorial ? 27 : 30,
              letterSpacing: c.editorial ? 4 : 2,
              color: c.sub,
              marginTop: i ? 8 : 0,
            }}
          >
            {d.toUpperCase()}
          </div>
        ))}
      </div>

      <Footer names={plan?.confirmed_names || []} conf={c} />
    </div>
  );
}
