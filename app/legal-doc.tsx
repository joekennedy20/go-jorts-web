/**
 * The legal pages, rendered from plain text.
 *
 * Privacy and terms used to live as Google-Docs exports on a separate
 * host nobody here could deploy to, which is how the privacy policy
 * ended up with no mention of calendar data the app now reads (Joe,
 * 2026-09-16: "move the legal pages into the web app"). They're plain
 * text in /content now, so an edit is a one-line diff and a deploy.
 *
 * The format is the documents' own: a title line, "Effective Date" /
 * "Last Updated" lines, numbered sections (1., 2.), lettered
 * subsections (A., B.), bullets starting "•", and pipe tables with a
 * "---|---" separator row.
 */
import fs from 'fs';
import path from 'path';

type Block =
  | {kind: 'h2'; text: string}
  | {kind: 'h3'; text: string}
  | {kind: 'p'; text: string}
  | {kind: 'ul'; items: string[]}
  | {kind: 'table'; head: string[]; rows: string[][]};

const SECTION = /^\d+\.\s+\S/;
const SUBSECTION = /^[A-Z]\.\s+\S/;
const isDivider = (line: string) => /^-{3,}(\|-{3,})*$/.test(line.replace(/\s/g, ''));
const cells = (line: string) => line.split('|').map(c => c.trim());

export function readDoc(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'content', file), 'utf8');
}

function parse(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    if (line.startsWith('•')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('•')) {
        items.push(lines[i].trim().replace(/^•\s*/, ''));
        i++;
      }
      blocks.push({kind: 'ul', items});
      continue;
    }
    // A table: a header row, a dashed separator, then rows.
    if (line.includes('|') && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push({kind: 'table', head, rows});
      continue;
    }
    if (SECTION.test(line)) blocks.push({kind: 'h2', text: line});
    else if (SUBSECTION.test(line)) blocks.push({kind: 'h3', text: line});
    else blocks.push({kind: 'p', text: line});
    i++;
  }
  return blocks;
}

export function LegalDoc({text}: {text: string}) {
  const lines = text.split('\n').filter(l => l.trim());
  const title = lines[0];
  const dates = lines.filter(l => /^(Effective Date|Last Updated):/.test(l));
  const body = parse(text.split('\n').slice(1).join('\n')).filter(
    b => !(b.kind === 'p' && /^(Effective Date|Last Updated):/.test(b.text)),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
      <a
        href="https://apps.apple.com/app/id6759267210"
        className="text-sm font-semibold tracking-widest text-amber-300/90 no-underline"
      >
        JORTS
      </a>
      <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-white/50">{dates.join(' · ')}</p>

      <div className="mt-10 flex flex-col gap-5">
        {body.map((block, n) => {
          if (block.kind === 'h2') {
            return (
              <h2
                key={n}
                className="mt-6 border-t border-white/10 pt-6 text-xl font-bold text-white"
              >
                {block.text}
              </h2>
            );
          }
          if (block.kind === 'h3') {
            return (
              <h3 key={n} className="mt-2 text-base font-bold text-amber-200/90">
                {block.text}
              </h3>
            );
          }
          if (block.kind === 'ul') {
            return (
              <ul key={n} className="flex list-disc flex-col gap-2 pl-5 text-white/75">
                {block.items.map((item, m) => (
                  <li key={m} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          if (block.kind === 'table') {
            return (
              <div key={n} className="-mx-5 overflow-x-auto px-5">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {block.head.map((h, m) => (
                        <th
                          key={m}
                          className="border-b border-white/20 py-2 pr-4 font-semibold text-white"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, m) => (
                      <tr key={m}>
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="border-b border-white/10 py-2 pr-4 align-top leading-relaxed text-white/75"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return (
            <p key={n} className="leading-relaxed text-white/75">
              {block.text}
            </p>
          );
        })}
      </div>

      <p className="mt-12 border-t border-white/10 pt-6 text-sm text-white/40">
        If You Know You Know, Inc. ·{' '}
        <a href="/privacy" className="text-white/60 underline">
          Privacy
        </a>{' '}
        ·{' '}
        <a href="/terms" className="text-white/60 underline">
          Terms
        </a>
      </p>
    </main>
  );
}
