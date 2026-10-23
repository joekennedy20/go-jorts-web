/**
 * The two faces every Jorts link preview is drawn in.
 *
 * Satori has NO system fonts. Without real font data loaded, every
 * `fontWeight` you write is silently ignored and the whole card comes
 * out at one weight — which is how both of these cards looked until
 * somebody rendered one and looked at it.
 *
 * Not the documented `fetch(new URL('./x.ttf', import.meta.url))`:
 * that throws "fetch failed" in the dev edge sandbox, because the
 * asset URL webpack emits isn't reachable from inside it. It is
 * reported to work once deployed, which is a quality of code you
 * cannot check before shipping it. So the routes run on the node
 * runtime and read the files, and `outputFileTracingIncludes` in
 * next.config.js keeps them in the deployed functions — nothing
 * imports a .ttf, so the tracer would otherwise drop them and every
 * render would throw ENOENT.
 *
 * Shared because there are two cards now. They lived under the
 * invite route while it was the only one that had them, and the
 * night page's card spent that whole time rendering flat.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const DISPLAY = 'Anton';
export const BODY = 'Poppins';

export const NAVY = '#0D1F2D';
export const GOLD = '#E8A020';

/** Both faces, shaped for ImageResponse's `fonts`. */
export async function ogFonts() {
  const dir = join(process.cwd(), 'app', 'fonts');
  const [display, body] = await Promise.all([
    readFile(join(dir, 'Anton-Regular.ttf')),
    readFile(join(dir, 'Poppins-Regular.ttf')),
  ]);
  return [
    { name: DISPLAY, data: display, style: 'normal' as const },
    { name: BODY, data: body, style: 'normal' as const },
  ];
}
