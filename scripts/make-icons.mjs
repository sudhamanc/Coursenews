/**
 * Icon generation — rasterises assets/icons/*.svg into the PNG set in public/.
 *
 * Run on demand (`npm run icons`), NEVER during the Netlify build: the outputs
 * are committed, so a deploy never has to execute a native image binary.
 *
 * sharp is already resolved in node_modules as an optionalDependency of astro
 * itself; the explicit devDependency entry just guarantees it survives an
 * `npm install --omit=optional`.
 *
 * Two things this script exists to get right:
 *
 *   density   librsvg rasterises by DPI, not by pixel target. Without a high
 *             density the 512 source is rendered small and then upscaled, and
 *             the serif brackets on the L turn to porridge.
 *
 *   maskable  Android crops maskable icons to a circle of diameter 0.8*size.
 *             checkMaskableSafeZone() reads the rendered pixels and asserts the
 *             ink actually falls inside that window — a real substitute for the
 *             Android device check, which we cannot run here.
 *
 * Usage:
 *   npm run icons
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets', 'icons');
const PUB = path.join(ROOT, 'public');

/** --paper in src/styles/newspaper.css. Used to flatten away any alpha. */
const PAPER = '#fff1e5';
/** librsvg DPI. 384 => the 512pt source rasterises well above every target. */
const DENSITY = 384;

/**
 * Render an SVG to a square PNG.
 * @param {string} src   source svg filename under assets/icons
 * @param {number} size  output edge length in px
 * @param {string} out   output path relative to public/
 * @param {boolean} opaque  strip alpha (required for apple-touch-icon)
 */
async function png(src, size, out, { opaque = false } = {}) {
  const dest = path.join(PUB, out);
  await mkdir(path.dirname(dest), { recursive: true });

  let pipeline = sharp(await readFile(path.join(SRC, src)), { density: DENSITY }).resize(
    size,
    size,
    { fit: 'contain' },
  );
  if (opaque) pipeline = pipeline.flatten({ background: PAPER });

  const info = await pipeline.png({ compressionLevel: 9 }).toFile(dest);
  console.log(
    `  + ${out.padEnd(34)} ${String(info.width).padStart(4)}x${info.height}  ` +
      `${info.channels}ch  ${(info.size / 1024).toFixed(1)} KB`,
  );
  return dest;
}

/** Non-square render, for the social card. */
async function pngWide(src, w, h, out) {
  const dest = path.join(PUB, out);
  const info = await sharp(await readFile(path.join(SRC, src)), { density: DENSITY })
    .resize(w, h, { fit: 'contain', background: PAPER })
    .flatten({ background: PAPER })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(
    `  + ${out.padEnd(34)} ${String(info.width).padStart(4)}x${info.height}  ` +
      `${info.channels}ch  ${(info.size / 1024).toFixed(1)} KB`,
  );
}

/**
 * Assert every non-background pixel of a maskable icon sits inside Android's
 * guaranteed-visible window.
 *
 * The guarantee is a centred circle of diameter 0.8*size. The largest square
 * inscribed in that circle has half-side (0.8*size/2)/sqrt(2), so for size=512
 * the safe window is [111, 401] on both axes.
 */
async function checkMaskableSafeZone(file, size) {
  const half = (0.8 * size) / 2 / Math.SQRT2;
  const lo = Math.round(size / 2 - half);
  const hi = Math.round(size / 2 + half);

  const { data, info } = await sharp(file)
    .flatten({ background: PAPER })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Background is the flat paper colour; anything else is ink.
  const bg = [0xff, 0xf1, 0xe5];
  const TOL = 6;
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const isBg =
        Math.abs(data[i] - bg[0]) <= TOL &&
        Math.abs(data[i + 1] - bg[1]) <= TOL &&
        Math.abs(data[i + 2] - bg[2]) <= TOL;
      if (isBg) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error(`${path.basename(file)}: no ink found — is the source blank?`);

  const ok = minX >= lo && minY >= lo && maxX <= hi && maxY <= hi;
  const label = `  ${ok ? '✓' : '✗'} maskable safe zone`;
  console.log(
    `${label}  ink bbox [${minX},${minY}]–[${maxX},${maxY}]  must fit [${lo},${lo}]–[${hi},${hi}]`,
  );
  if (!ok) {
    throw new Error(
      `${path.basename(file)} would be cropped by Android's circle mask. ` +
        `Scale the artwork in assets/icons/mark-maskable.svg so its bbox fits [${lo}, ${hi}].`,
    );
  }
}

async function main() {
  console.log('\nRasterising assets/icons -> public/\n');

  // Browser favicon fallback (the SVG is preferred; this covers older engines).
  await png('mark.svg', 32, 'favicon-32.png', { opaque: true });

  // iOS home screen. MUST be opaque and square — iOS applies its own rounding,
  // and an alpha channel here renders as a black backdrop on some versions.
  await png('mark.svg', 180, 'apple-touch-icon.png', { opaque: true });

  // Android / desktop PWA, purpose "any".
  await png('mark.svg', 192, 'icons/icon-192.png', { opaque: true });
  await png('mark.svg', 512, 'icons/icon-512.png', { opaque: true });

  // Android, purpose "maskable" — padded artwork, see mark-maskable.svg.
  await png('mark-maskable.svg', 192, 'icons/icon-maskable-192.png', { opaque: true });
  const maskable512 = await png('mark-maskable.svg', 512, 'icons/icon-maskable-512.png', {
    opaque: true,
  });

  // Social card.
  await pngWide('og.svg', 1200, 630, 'og.png');

  console.log('');
  await checkMaskableSafeZone(maskable512, 512);
  console.log('\nDone. Commit the generated files in public/.\n');
}

main().catch((err) => {
  console.error(`\nicon generation failed: ${err.message}\n`);
  process.exit(1);
});
