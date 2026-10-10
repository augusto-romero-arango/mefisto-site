const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const source = path.resolve(__dirname, '../site');

function build(destination, baseUrl, indexable = false) {
  const url = new URL(baseUrl);
  assert(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash,
    'La URL debe ser HTTPS, sin credenciales, query ni fragmento');
  assert(!/[<>"'&]/.test(url.href), 'La URL debe ser segura para los metadatos HTML/XML');
  assert(typeof indexable === 'boolean', 'La indexación debe ser explícita');
  url.pathname = url.pathname.replace(/\/+$/, '') + '/';
  const out = path.resolve(destination);
  assert(out !== source && !source.startsWith(out + path.sep) && !out.startsWith(source + path.sep),
    'La salida debe estar separada del código fuente');

  function files(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      assert(!entry.isSymbolicLink(), 'No se publican enlaces simbólicos');
      return entry.isDirectory()
        ? files(path.join(directory, entry.name)).map(file => `${entry.name}/${file}`)
        : [entry.name];
    });
  }
  const sourceFiles = files(source);
  // No se borra una salida anterior: un archivo inesperado requiere revisión.
  if (fs.existsSync(out)) {
    for (const file of files(out)) assert(sourceFiles.includes(file), `Archivo inesperado en la salida: ${file}`);
  }
  fs.cpSync(source, out, { recursive: true });
  let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  const replacements = [
    [/<link rel="canonical" href="[^"]+">/g, `<link rel="canonical" href="${url.href}">`],
    [/<meta property="og:url" content="[^"]+">/g, `<meta property="og:url" content="${url.href}">`],
    [/<meta property="og:image" content="[^"]+">/g, `<meta property="og:image" content="${new URL('assets/social-card.png', url)}">`],
    [/<meta name="twitter:image" content="[^"]+">/g, `<meta name="twitter:image" content="${new URL('assets/social-card.png', url)}">`],
    [/<meta name="robots" content="[^"]+">/g, `<meta name="robots" content="${indexable ? 'index' : 'noindex'},follow">`]
  ];
  for (const [pattern, replacement] of replacements) {
    assert.equal([...html.matchAll(pattern)].length, 1, `Metadato ausente o duplicado: ${pattern}`);
    html = html.replace(pattern, replacement);
  }
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const notFound = fs.readFileSync(path.join(source, '404.html'), 'utf8')
    .replace(/href="\/(?!\/)([^"]*)"/g, (_, resource) => `href="${url.pathname}${resource}"`);
  fs.writeFileSync(path.join(out, '404.html'), notFound);
  fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n${indexable ? `Sitemap: ${new URL('sitemap.xml', url)}\n` : ''}`);
  fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url.href}</loc></url>\n</urlset>\n`);
  return { baseUrl: url.href, indexing: indexable ? 'enabled' : 'disabled', files: sourceFiles.length };
}

if (require.main === module) {
  const [baseUrl, indexing = '--indexable=false', ...extra] = process.argv.slice(2);
  assert(baseUrl && /^--indexable=(true|false)$/.test(indexing) && !extra.length,
    'Uso: npm run build -- https://host/ruta/ [--indexable=true|false]');
  console.log(JSON.stringify(build(path.resolve(__dirname, '../dist'), baseUrl, indexing === '--indexable=true'), null, 2));
}

module.exports = { build };
