// Vercel serves a static 404 page only from the output root, but Astro builds it
// under dist/portfolio/. Copy it to dist/404.html after each build.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/portfolio/404.html', 'dist/404.html');
