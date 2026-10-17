// Renders public/og.png, the 1200×630 image shown when a portal link is shared,
// from the SVG below. Run it again after changing the text: node scripts/make-og-image.mjs
import sharp from 'sharp';

const blues = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'];
const font = "font-family='Helvetica Neue, Helvetica, Arial, sans-serif'";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0b1220"/>
  ${blues.map((color, i) => `<rect x="${80 + i * 70}" y="96" width="56" height="8" rx="4" fill="${color}"/>`).join('')}
  <g transform="translate(1000 110)">
    <circle r="62" fill="#1d4ed8"/>
    <path d="M-44 -44a62 62 0 0 1 0 88M44 -44a62 62 0 0 0 0 88" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
  </g>
  <text x="80" y="250" ${font} font-size="76" font-weight="700" fill="#ffffff">KRKplaysTennis API docs</text>
  <text x="80" y="320" ${font} font-size="36" fill="#cbd5e1">Docs portal for a fictional tennis API</text>
  <text x="80" y="400" ${font} font-size="30" fill="#60a5fa">OpenAPI-first · Tested in CI · Ready for AI agents</text>
  <text x="80" y="540" ${font} font-size="28" fill="#94a3b8">Saverio Cirillo, Senior Technical Writer</text>
  <text x="80" y="580" ${font} font-size="28" fill="#94a3b8">saverio-cirillo.com/krk-plays-tennis-api</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('Wrote public/og.png');
