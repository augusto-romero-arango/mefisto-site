const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { build } = require('../scripts/build.cjs');

function temporaryOutput(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mefisto-pages-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

for (const [baseUrl, indexable] of [
  ['https://augusto-romero-arango.github.io/mefisto-site', false],
  ['https://mefisto.io/', true]
]) {
  test(`Metadatos y 404 para ${baseUrl}`, t => {
    const output = temporaryOutput(t);
    const result = build(output, baseUrl, indexable);
    const url = new URL(result.baseUrl);
    const read = file => fs.readFileSync(path.join(output, file), 'utf8');
    assert(read('index.html').includes(`<link rel="canonical" href="${url.href}">`));
    assert(read('index.html').includes(`content="${indexable ? 'index' : 'noindex'},follow"`));
    assert.equal(read('index.html').split(`content="${url.href}assets/social-card.png"`).length - 1, 2);
    assert(read('sitemap.xml').includes(`<loc>${url.href}</loc>`));
    assert.equal(read('robots.txt').includes('Sitemap:'), indexable);
    assert(read('robots.txt').includes('Allow: /'));
    assert(read('404.html').includes(`href="${url.pathname}"`));
    assert(read('404.html').includes('content="noindex"'));
    // Even a nested missing page must resolve assets and its home link correctly.
    for (const [, resource] of read('404.html').matchAll(/href="([^"]+)"/g)) {
      const resolved = new URL(resource, `${url.href}missing/nested/page`);
      assert(resolved.href.startsWith(url.href));
      assert(fs.existsSync(path.join(output, resolved.pathname.slice(url.pathname.length))));
    }
    assert.deepEqual(fs.readFileSync(path.join(output, 'assets/mefisto-constructor-terminal.png')),
      fs.readFileSync(path.resolve(__dirname, '../site/assets/mefisto-constructor-terminal.png')));
    for (const privateFile of ['.git', '.claude', '.mefisto', 'review', 'README.md']) {
      assert(!fs.existsSync(path.join(output, privateFile)));
    }
    assert.deepEqual(build(output, baseUrl, indexable), result, 'Reproducible sobre su propia salida');
  });
}

test('No indexa por defecto y rechaza URL inseguras o salidas inesperadas', t => {
  const output = temporaryOutput(t);
  assert.equal(build(output, 'https://example.org/').indexing, 'disabled');
  for (const url of ['http://example.org/', 'https://user:pass@example.org/', 'https://example.org/?a=1', 'https://example.org/#fragment']) {
    assert.throws(() => build(output, url));
  }
  assert.throws(() => build(path.resolve(__dirname, '../site'), 'https://example.org/'));
  fs.writeFileSync(path.join(output, 'unexpected.txt'), 'do not publish');
  assert.throws(() => build(output, 'https://example.org/'), /Archivo inesperado/);
});
