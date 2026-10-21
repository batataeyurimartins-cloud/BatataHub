import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const output = new URL('./public/', root);

// Publish the site's assets only. Server code and operator configuration stay
// available to the function bundler, outside the directory served by the CDN.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
const directories = ['assets', 'batatagpt', 'batataGames', 'scripts'];
for (const name of [...pages, ...directories]) {
  await cp(new URL(name, root), new URL(name, output), { recursive: true });
}
console.log(`Site preparado em ${fileURLToPath(output)}`);
