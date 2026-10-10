// Mechanical web optimization only. Composition and fading live in CSS.
// Usage: NODE_PATH=<Sharp package directory> node review/prepare-story-art.cjs <oficios.png> <historiador.png> <territorio.png>
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const names = ['oficios', 'historiador', 'territorio'];
const sources = process.argv.slice(2);
assert.equal(sources.length, names.length, 'Provide the three original images in order: oficios, historiador, territorio');

(async () => {
  const results = [];
  for (let i = 0; i < names.length; i++) {
    const metadata = await sharp(sources[i]).metadata();
    assert.equal(metadata.width, 1536);
    assert.equal(metadata.height, 1024);
    for (const width of [640, 1200]) {
      const file = path.resolve(__dirname, '../site/assets', names[i] + '-' + width + '.webp');
      await sharp(sources[i]).resize({ width }).webp({ quality: 82, effort: 6 }).toFile(file);
      results.push({ asset: path.basename(file), bytes: fs.statSync(file).size });
    }
  }
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
