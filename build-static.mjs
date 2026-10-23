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

// Distribute the original Redator bookmarklet, which loads the maintained
// runtime from its canonical project instead of saving a separate hub snapshot.
const bookmarklet = (await readFile(new URL('redacao/bookmarklet.txt', root), 'utf8')).trim();
if (!bookmarklet.startsWith('javascript:') || bookmarklet.length > 4096 ||
    !decodeURIComponent(bookmarklet.slice('javascript:'.length)).includes('https://redacao-maker.vercel.app/hub.js')) {
  throw new Error('Bookmarklet original do Redator Batata inválido.');
}
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
