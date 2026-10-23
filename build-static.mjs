import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const output = new URL('./public/', root);

// Publish the site's assets only. Server code and operator configuration stay
// available to the function bundler, outside the directory served by the CDN.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
const directories = ['assets', 'batatagpt', 'batataGames', 'scripts', 'apostilas', 'redacao'];
for (const name of [...pages, ...directories]) {
  await cp(new URL(name, root), new URL(name, output), { recursive: true });
}

// Ship a ready-to-save favorite in the page itself, including when the runtime
// download is unavailable. Keep its complete code so it works without a loader.
const source = await readFile(new URL('redacao/hub.js', root), 'utf8');
if (!source.includes("const PANEL_ID = 'redator-batata-console';") ||
    !source.includes("const SERVICE_ORIGIN = 'https://redacao-maker.vercel.app';") ||
    source.length > 150000) {
  throw new Error('Runtime do Redator Batata inválido para preparar o bookmarklet.');
}
const bookmarklet = 'javascript:' + encodeURIComponent(source);
const escapedBookmarklet = bookmarklet.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const installationPath = new URL('redacao-maker.html', output);
let installation = await readFile(installationPath, 'utf8');
let bookmarkletLinks = 0;
installation = installation.replace(/<a\b[^>]*\bdata-bookmarklet\b[^>]*>/g, tag => {
  bookmarkletLinks++;
  return tag.replace(/href="[^"]*"/, `href="${escapedBookmarklet}"`).replace(/ aria-disabled="true"/, '');
});
if (bookmarkletLinks !== 2) throw new Error('Os dois atalhos do bookmarklet devem estar presentes.');
installation = installation.replace(/<code id="scriptCode">[^<]*<\/code>/, `<code id="scriptCode">${escapedBookmarklet}</code>`);
installation = installation.replace(/<button\b[^>]*\bdata-copy\b[^>]*>/g, tag => tag.replace(/ disabled\b/, ''));
await writeFile(installationPath, installation);
console.log(`Site preparado em ${fileURLToPath(output)}`);
