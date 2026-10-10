// Read-only HTTP checks. No deployment, credentials, or account mutations.
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.resolve(__dirname, '../site/index.html'), 'utf8');
const urls = [...new Set([...html.matchAll(/href="(https:\/\/[^\"]+)"/g)].map(m => m[1]))].filter(u => !u.startsWith('https://mefisto.io/'));
const slug = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/ /g, '-');
const results = [];
async function check(url) {
  const parsed = new URL(url);
  let requestUrl = url, markdown = false;
  if (parsed.hostname === 'github.com') {
    if (parsed.pathname.includes('/blob/main/')) {
      requestUrl = 'https://raw.githubusercontent.com' + parsed.pathname.replace('/blob/main/', '/main/');
      markdown = parsed.pathname.endsWith('.md');
    } else if (parsed.pathname.split('/').filter(Boolean).length === 2) {
      requestUrl = 'https://raw.githubusercontent.com' + parsed.pathname + '/main/README.md'; markdown = true;
    }
  }
  try {
    const res = await fetch(requestUrl, { signal: AbortSignal.timeout(20000) });
    let anchor = null;
    if (res.ok && markdown && parsed.hash) {
      const body = await res.text();
      const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => slug(m[1]));
      anchor = headings.includes(decodeURIComponent(parsed.hash.slice(1)));
    } else if (res.body) await res.body.cancel();
    return { url, status: res.status, anchor, ok: res.ok && anchor !== false };
  } catch (e) { return { url, ok: false, error: e.message }; }
}
async function main() {
  for (let start = 0; start < urls.length; start += 4) results.push(...await Promise.all(urls.slice(start, start + 4).map(check)));
  for (const result of results) console.log(JSON.stringify(result));
  console.log(`${results.filter(r => r.ok).length}/${urls.length} checked links passed`);
  if (results.some(r => !r.ok)) process.exitCode = 1;
}
main();
