/**
 * The Jorts mark, for the corner of a link preview.
 *
 * Read off disk and memoised per instance. `public/jorts-logo.png`
 * is the 2000x2000 lockup the pages use; this is a cropped, scaled
 * copy committed beside the code, because base64-ing 1.4MB on every
 * render to draw it at 96px is a silly way to spend a request.
 *
 * Same reason as the fonts for living here rather than in /public:
 * `outputFileTracingIncludes` has to keep it in the deployed
 * function, and nothing imports a .png.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let cached: string | null = null;

export async function jortsMark(): Promise<string | null> {
  if (cached) {
    return cached;
  }
  try {
    const buf = await readFile(join(process.cwd(), 'app', 'jorts-mark.png'));
    cached = `data:image/png;base64,${buf.toString('base64')}`;
    return cached;
  } catch {
    // A card without the badge is still a card.
    return null;
  }
}
