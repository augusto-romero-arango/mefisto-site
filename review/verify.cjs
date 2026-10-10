const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const dir = path.resolve(__dirname, '../site');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const elements = [], ids = new Set(), stack = [];
const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
class Element {
  constructor(tag, attrs) { this.tag = tag; this.attrs = attrs; this.dataset = Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).map(([k,v]) => [k.slice(5),v])); this.listeners = {}; }
  setAttribute(k,v) { this.attrs[k] = v; }
  addEventListener(k,cb) { this.listeners[k] = cb; }
}
for (const match of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>/g)) {
  const raw = match[0]; if (raw.startsWith('<!')) continue;
  const tag = raw.match(/^<\/?([\w-]+)/)[1].toLowerCase();
  if (raw.startsWith('</')) { assert.equal(stack.pop(), tag, `Nesting: ${tag}`); continue; }
  const attrs = Object.fromEntries([...raw.replace(/^<[\w-]+/, '').matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1],m[2] ?? '']));
  if (attrs.id) { assert(!ids.has(attrs.id), `Duplicate ID ${attrs.id}`); ids.add(attrs.id); }
  elements.push(new Element(tag, attrs));
  if (!voids.has(tag)) stack.push(tag);
}
assert.equal(stack.length, 0, 'All tags closed');
let localChecks = 0;
for (const el of elements) {
  for (const attr of ['href','src']) {
    const value = el.attrs[attr]; if (!value) continue;
    if (value.startsWith('#')) assert(ids.has(value.slice(1)), `Broken anchor: ${value}`);
    else if (!/^[a-z][\w+.-]*:/i.test(value)) { assert(fs.existsSync(path.resolve(dir,value)), `Missing asset: ${value}`); localChecks++; }
  }
  if (el.attrs.srcset) for (const candidate of el.attrs.srcset.split(',')) assert(fs.existsSync(path.resolve(dir,candidate.trim().split(/\s/)[0])), 'Missing responsive image');
  for (const attr of ['aria-labelledby','aria-controls']) if (el.attrs[attr]) for (const id of el.attrs[attr].split(' ')) assert(ids.has(id), `Missing ${attr} target: ${id}`);
  if (el.attrs.target === '_blank') assert(el.attrs.rel?.includes('noopener'));
  if (el.tag === 'img') {
    for (const attr of ['alt','width','height']) assert(Object.hasOwn(el.attrs, attr), `Image missing ${attr}`);
    assert(Number(el.attrs.width) > 0 && Number(el.attrs.height) > 0, 'Image dimensions must be positive');
    if (!el.attrs.alt) assert.equal(el.attrs['aria-hidden'], 'true', 'Decorative images are explicitly hidden from assistive technology');
  }
  if (el.tag === 'button') assert.equal(el.attrs.type, 'button');
}
assert.equal(elements.filter(el => el.tag === 'article').length, 1);
assert.equal(elements.filter(el => el.tag === 'h1').length, 1);
for (const old of ['data-concept','role="tabpanel"','id="pacto"','id="acto"','DIRECCIÓN CREATIVA','La opción más arquitectónica']) assert(!html.includes(old), `Legacy content: ${old}`);
for (const s of ['memoria-inicio','memoria-relato','memoria-proceso','memoria-agentes','memoria-cuaderno','memoria-producto','memoria-dx','memoria-arquitectura','memoria-mecanismo','memoria-empezar']) assert(ids.has(s));
assert(html.includes('#instalación-rápida') && !html.includes('#1-configurar-'));
assert(html.includes('noindex,follow'));
assert.equal(fs.readFileSync(path.join(dir,'robots.txt'),'utf8').trim(), 'User-agent: *\nAllow: /');
assert(html.includes('<link rel="canonical" href="https://mefisto.io/">'));
for (const property of ['og:title','og:description','og:image','og:image:alt','twitter:card']) assert(html.includes(property));
for (const heading of html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)) assert(!heading[1].replace(/<[^>]*>/g,'').trim().endsWith('.'), 'No trailing full stops in headings');
assert.equal((html.match(/class="process-step"/g) || []).length, 8);
assert(html.indexOf('<h4>Funcionalidades con TDD') < html.indexOf('<h4>Proyecciones y consultas'));
assert.equal((html.match(/class="tdd-phase"/g) || []).length, 3);
assert.equal((html.match(/class="dx-mod-identity"/g) || []).length, 2);
assert(html.includes('rutas locales') && html.includes('privacidad'));
for (const forbidden of ['file:///','/Users/','/var/folders/','localhost:', 'googletagmanager', 'google-analytics', 'fbq(']) assert(!html.includes(forbidden), `Unexpected private or tracking reference: ${forbidden}`);
const styles = fs.readdirSync(path.join(dir,'styles')).filter(f => f.endsWith('.css')).map(f => ({ file: f, text: fs.readFileSync(path.join(dir,'styles',f),'utf8') }));
for (const {file,text} of styles) {
  assert.equal((text.match(/{/g) || []).length, (text.match(/}/g) || []).length, `${file}: balanced CSS`);
  for (const url of text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
    assert(!url[1].startsWith('http'), 'Self-hosted assets only');
    assert(fs.existsSync(path.resolve(dir,'styles',url[1])), `Missing CSS asset ${url[1]}`);
  }
}
const css = styles.map(s => s.text).join('\n');
assert(css.includes('prefers-reduced-motion') && css.includes('focus-visible') && css.includes('.skip-link'));
assert(!css.includes('article[hidden]{display:block}'));
for (const f of fs.readdirSync(path.join(dir,'assets','fonts')).filter(f => f.endsWith('.woff2'))) assert.equal(fs.readFileSync(path.join(dir,'assets','fonts',f)).toString('ascii',0,4),'wOF2');
const q = s => elements.filter(el => el.attrs[s.slice(1,-1)] !== undefined);
const byId = id => elements.find(el => el.attrs.id === id);
const script = fs.readFileSync(path.join(dir,'app.js'),'utf8');
new vm.Script(script).runInNewContext({document:{querySelectorAll:q,getElementById:byId}});
for (const b of q('[data-event]')) {
  b.listeners.click();
  assert.equal(q('[data-event]').filter(b => b.attrs['aria-pressed'] === 'true').length,1);
  assert.equal(byId('event-state').textContent, b.dataset.event === '2' ? 'Confirmado' : 'Borrador');
  assert(byId('event-detail').textContent.includes(`eventos aplicados: ${Number(b.dataset.event)+1}`));
}
for (const sprite of q('[data-sprite]')) assert(sprite.innerHTML.includes('role="img"') && sprite.innerHTML.includes('<rect'));
assert(q('[data-sprite]')[1].innerHTML.includes('#378add'), 'Mefisto keeps his computer');
for (const [file,w,h] of [['fausto-planner-terminal.png',2236,574],['mefisto-constructor-terminal.png',2314,540],['social-card.png',1200,630],['favicon-32.png',32,32],['apple-touch-icon.png',180,180]]) {
  const png = fs.readFileSync(path.join(dir,'assets',file));
  assert.equal(png.readUInt32BE(16),w); assert.equal(png.readUInt32BE(20),h);
}
function luminance(hex) { return hex.match(/\w\w/g).map(c => parseInt(c,16)/255).map(c => c<=.04045 ? c/12.92 : ((c+.055)/1.055)**2.4).reduce((sum,c,i) => sum+c*[.2126,.7152,.0722][i],0); }
const contrasts=[];
for (const fg of ['193f58','526874','a32d2d']) for (const bg of ['e9eef0','f2f6f7']) { const ratio=(luminance(bg)+.05)/(luminance(fg)+.05); assert(ratio>=4.5, `Contrast ${fg}/${bg}`); contrasts.push(Number(ratio.toFixed(2))); }
const artBytes = ['atlas','fausto','mefisto'].reduce((total,name) => total+fs.statSync(path.join(dir,'assets',`${name}-1536.webp`)).size,0);
assert(artBytes<1500000,'Full-size art budget');
const storyImages = elements.filter(el => el.tag === 'img' && el.attrs.class === 'story-illustration');
assert.equal(storyImages.length, 3, 'Three quiet narrative illustrations');
for (const el of storyImages) {
  assert.equal(el.attrs.loading, 'lazy');
  assert.equal(el.attrs.decoding, 'async');
  assert.equal(el.attrs.alt, '');
  assert.equal(el.attrs['aria-hidden'], 'true');
  assert(el.attrs.srcset && el.attrs.sizes, 'Responsive narrative illustrations');
}
const storyArtBytes = ['oficios','historiador','territorio'].reduce((total,name) => total+fs.statSync(path.join(dir,'assets',`${name}-1200.webp`)).size,0);
assert(storyArtBytes<600000,'Lower-page illustrations stay below 600 KB in total');
console.log(JSON.stringify({status:'passed',sections:'Atlas only',ids:ids.size,localAssetChecks:localChecks,eventStates:3,mascots:2,storyIllustrations:storyImages.length,textContrastMinimum:Math.min(...contrasts),fullSizeArtBytes:artBytes,storyArtBytes,indexing:'disabled',scope:'Source structure, local assets, isolated JS and solid-color contrast; not browser, screen-reader, screenshot or hosted-site QA'},null,2));
