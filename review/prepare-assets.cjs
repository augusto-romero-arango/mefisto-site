// Mechanical optimization and the two route-only redactions explicitly approved by the author.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
if (!process.argv[2]) {
  console.error('Uso: node review/prepare-assets.cjs /ruta/a/mefisto-direcciones');
  process.exit(1);
}
const sharp = require('sharp');
const source = path.resolve(process.argv[2]);
const assets = path.resolve(__dirname, '../site/assets');
const masks = [
  { left: 703, top: 258, width: 1430, height: 34 },
  { left: 703, top: 332, width: 1430, height: 34 }
];
async function main() {
  let originalBytes = 0, fullBytes = 0;
  for (const [input, output] of [['03-atlas-tierra-ganada-v2.png', 'atlas'], ['memoria-fausto-v2.png', 'fausto'], ['memoria-mefisto-v2.png', 'mefisto']]) {
    originalBytes += fs.statSync(path.join(source, input)).size;
    for (const width of [768, 1536]) {
      const target = path.join(assets, `${output}-${width}.webp`);
      await sharp(path.join(source, input)).resize({ width }).webp({ quality: 86, effort: 6 }).toFile(target);
      if (width === 1536) fullBytes += fs.statSync(target).size;
    }
  }
  fs.copyFileSync(path.join(source, 'fausto-planner-terminal.png'), path.join(assets, 'fausto-planner-terminal.png'));
  const original = path.join(source, 'mefisto-constructor-terminal.png');
  const redacted = path.join(assets, 'mefisto-constructor-terminal.png');
  const overlays = await Promise.all(masks.map(async rect => ({
    left: rect.left, top: rect.top,
    input: await sharp({ create: { width: rect.width, height: rect.height, channels: 3, background: '#343d45' } }).png().toBuffer()
  })));
  await sharp(original).composite(overlays).png().toFile(redacted);
  const before = await sharp(original).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(redacted).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual(before.info, after.info);
  for (let y = 0; y < before.info.height; y++) for (let x = 0; x < before.info.width; x++) {
    const masked = masks.some(r => x >= r.left && x < r.left + r.width && y >= r.top && y < r.top + r.height);
    const offset = (y * before.info.width + x) * 3;
    if (!masked) assert(before.data.subarray(offset, offset + 3).equals(after.data.subarray(offset, offset + 3)), `Unexpected pixel change: ${x},${y}`);
    else assert(after.data.subarray(offset, offset + 3).equals(Buffer.from([52, 61, 69])), 'Redaction must be opaque');
  }
  await sharp(path.join(assets, 'favicon.svg')).resize(32, 32).png().toFile(path.join(assets, 'favicon-32.png'));
  await sharp(path.join(assets, 'favicon.svg')).resize(180, 180).png().toFile(path.join(assets, 'apple-touch-icon.png'));
  console.log(JSON.stringify({ originalBytes, fullBytes, reductionPercent: Math.round((1 - fullBytes / originalBytes) * 100), privacy: 'Only the two approved rectangles changed; all other pixels are identical', masks }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
