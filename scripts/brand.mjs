// Generates the toon brand assets (avatar, favicon, social card) as SVG and
// PNG. Run with: node scripts/brand.mjs
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const C = {
	skin: '#8d5a3b',
	skinShade: '#74462c',
	hair: '#16100d',
	hairHi: '#3a2c25',
	line: '#1a1210',
	dobok: '#f7f7f4',
	dobokShade: '#dcdcd6',
	belt: '#111214',
	red: '#cd2e3a',
	blue: '#0047a0',
	bg: '#f7f8fa',
	gold: '#d8b45e',
};

// The head, drawn in a 200×200 box (face centred on x=100).
const head = () => `
<g stroke="${C.line}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
  <!-- neck -->
  <path d="M84 150 L84 196 L116 196 L116 150 Z" fill="${C.skinShade}"/>
  <!-- ears -->
  <ellipse cx="58" cy="116" rx="8.5" ry="13" fill="${C.skin}"/>
  <ellipse cx="142" cy="116" rx="8.5" ry="13" fill="${C.skin}"/>
  <!-- face: a little long, with a defined jaw -->
  <path d="M60 92 C60 66 140 66 140 92 L139 124 C136 154 119 174 100 176 C81 174 64 154 61 124 Z" fill="${C.skin}"/>
</g>
<!-- stubble along the jaw, darker on the chin -->
<path d="M62 128 C66 156 83 174 100 176 C117 174 134 156 138 128 C132 146 122 156 114 155 C108 152 92 152 86 155 C78 156 68 146 62 128 Z" fill="${C.hair}" opacity="0.3"/>
<path d="M89 163 C93 172 107 172 111 163 C107 167 93 167 89 163 Z" fill="${C.hair}" opacity="0.5"/>
<!-- sideburns -->
<path d="M60 100 L60 116 L64 116 L65 100 Z M140 100 L140 116 L136 116 L135 100 Z" fill="${C.hair}"/>
<!-- hair: a full quiff, swept up and to the right -->
<g stroke="${C.line}" stroke-width="3" stroke-linejoin="round" transform="translate(0 17) scale(1 0.84)">
  <path d="M57 106 C50 86 52 64 64 52 C66 38 78 30 90 32 C96 20 112 13 127 19 L134 7 L138 22 C148 18 160 22 165 32 L176 28 L167 43 C171 56 167 74 154 88 C151 96 149 102 147 108 C143 92 133 82 119 78 C101 74 82 78 70 90 C63 96 60 101 59 107 Z" fill="${C.hair}"/>
</g>
<g fill="none" stroke="${C.hairHi}" stroke-linecap="round" transform="translate(0 17) scale(1 0.84)">
  <path d="M74 62 C88 46 110 37 134 34" stroke-width="3.5"/>
  <path d="M82 74 C98 60 122 54 148 56" stroke-width="3"/>
  <path d="M96 46 C108 36 122 30 138 28" stroke-width="2.5"/>
</g>
<!-- eyebrows: thick, lifted at the outer ends -->
<path d="M70 98 Q81 89 95 94 L94 100 Q82 96 71 103 Z" fill="${C.hair}"/>
<path d="M130 98 Q119 89 105 94 L106 100 Q118 96 129 103 Z" fill="${C.hair}"/>
<!-- eyes: a smiling squint -->
<g class="eyes">
  <path d="M77 114 Q83 106 90 114 Q83 117 77 114 Z" fill="${C.line}"/>
  <path d="M110 114 Q117 106 123 114 Q117 117 110 114 Z" fill="${C.line}"/>
  <circle cx="85" cy="111" r="1.4" fill="#fff"/>
  <circle cx="119" cy="111" r="1.4" fill="#fff"/>
  <path d="M73 112 L70 110 M127 112 L130 110" stroke="${C.skinShade}" stroke-width="1.6" stroke-linecap="round"/>
</g>
<g class="tu-acc eyes-closed" fill="none" stroke="${C.line}" stroke-width="2.4" stroke-linecap="round">
  <path d="M77 113 Q83 118 90 113"/><path d="M110 113 Q117 118 123 113"/>
</g>
<!-- nose: broad -->
<path d="M100 110 C98 121 92 127 94 132 C97 136 106 136 110 132 C112 129 109 125 106 123" fill="none" stroke="${C.skinShade}" stroke-width="3" stroke-linecap="round"/>
<!-- moustache: thin -->
<path d="M84 142 C91 137 98 137 100 139.5 C102 137 109 137 116 142 C109 141 104 142 100 143 C96 142 91 141 84 142 Z" fill="${C.hair}"/>
<!-- a wide, toothy smile -->
<g class="mouth-smile">
  <path d="M83 147 Q100 167 117 147 Q100 153 83 147 Z" fill="#4a1f1a" stroke="${C.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M86.5 148.5 Q100 155.5 113.5 148.5 Q100 151.5 86.5 148.5 Z" fill="#fff"/>
</g>
<g class="tu-acc mouth-sleep">
  <ellipse cx="100" cy="151" rx="4" ry="3" fill="#4a1f1a" stroke="${C.line}" stroke-width="1.6"/>
</g>
<!-- cheeks -->
<ellipse cx="72" cy="128" rx="7" ry="4" fill="${C.red}" opacity="0.16"/>
<ellipse cx="128" cy="128" rx="7" ry="4" fill="${C.red}" opacity="0.16"/>
<!-- sunglasses (sunny) -->
<g class="tu-acc shades" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round">
  <path d="M68 104 H96 L94 118 C92 124 72 124 70 118 Z" fill="#11161d"/>
  <path d="M104 104 H132 L130 118 C128 124 108 124 106 118 Z" fill="#11161d"/>
  <path d="M96 107 Q100 104 104 107" fill="none"/>
  <path d="M68 105 L58 108 M132 105 L142 108" fill="none"/>
  <path d="M73 108 L80 108 M109 108 L116 108" stroke="#5fb3ff" stroke-width="2" opacity="0.8"/>
</g>
<!-- a bead of sweat (hot days) -->
<path class="tu-acc sweat" d="M136 92 C132 99 132 104 136 104 C140 104 140 99 136 92 Z" fill="#7cc4ff" stroke="${C.line}" stroke-width="1.5"/>
`;

// Half-body: head on a black-belt dobok (black collar trim for dan grades).
const body = `
<g stroke="${C.line}" stroke-width="3" stroke-linejoin="round">
  <path d="M28 400 C28 300 70 244 160 240 C250 244 292 300 292 400 Z" fill="${C.dobok}"/>
  <path d="M140 240 L160 296 L180 240 Z" fill="${C.skinShade}"/>
  <path d="M128 242 L190 372 L210 362 L152 240 Z" fill="${C.belt}"/>
  <path d="M194 242 L158 330 L140 320 L170 240 Z" fill="${C.belt}"/>
  <path d="M60 300 C70 330 72 360 70 400" fill="none" stroke="${C.dobokShade}" stroke-width="3"/>
  <path d="M260 300 C250 330 248 360 250 400" fill="none" stroke="${C.dobokShade}" stroke-width="3"/>
  <path d="M34 356 L286 356 L288 384 L32 384 Z" fill="${C.belt}"/>
  <rect x="146" y="350" width="30" height="40" rx="4" fill="${C.belt}"/>
</g>
<path d="M150 388 L140 400 M172 388 L182 400" stroke="${C.line}" stroke-width="10"/>
<rect x="60" y="364" width="64" height="5" fill="${C.gold}" opacity="0.9"/>
<g transform="translate(232 300) rotate(-33.7)">
  <circle r="11" fill="${C.blue}"/>
  <path d="M-11 0A11 11 0 0 1 11 0A5.5 5.5 0 0 1 0 0A5.5 5.5 0 0 0 -11 0Z" fill="${C.red}"/>
</g>
`;

const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 50 320 350" width="320" height="350" class="toon-svg">
<style>.tu-acc{display:none}</style>
<g transform="translate(60 60)">${head()}</g>
${body}
</svg>`;

const faviconToon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<defs><clipPath id="c"><circle cx="100" cy="100" r="92"/></clipPath></defs>
<circle cx="100" cy="100" r="96" fill="${C.bg}"/>
<g clip-path="url(#c)"><g transform="translate(-2 6) scale(1.02)">${head()}</g></g>
<circle cx="100" cy="100" r="93" fill="none" stroke="${C.red}" stroke-width="8"/>
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<rect width="1200" height="630" fill="${C.bg}"/>
<g opacity="0.07" transform="translate(1010 140) rotate(-33.7)">
  <circle r="300" fill="${C.blue}"/>
  <path d="M-300 0A300 300 0 0 1 300 0A150 150 0 0 1 0 0A150 150 0 0 0 -300 0Z" fill="${C.red}"/>
</g>
<text x="80" y="150" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="4" fill="${C.red}">SOFTWARE ARCHITECT · INDIA</text>
<text x="80" y="260" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="80" font-weight="900" fill="#0d0e10">Umamaheswaran<tspan fill="${C.red}">.</tspan></text>
<text x="80" y="330" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="${C.blue}">Software Architect <tspan fill="#9aa0a8">/</tspan> <tspan fill="#555a63">Engineering Manager</tspan></text>
<text x="80" y="392" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#555a63">.NET · React · Azure/AWS · AI · Taekwondo black belt</text>
<text x="80" y="470" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#0d0e10">umamaheswaran.com</text>
<g transform="translate(830 150) scale(1.1)">
  <g transform="translate(60 60)">${head()}</g>${body}
</g>
<rect x="0" y="540" width="1200" height="44" fill="${C.belt}"/>
<text x="80" y="569" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="6" fill="${C.gold}">UMAMAHESWARAN · TAEKWONDO · ARCHITECTURE</text>
</svg>`;

writeFileSync('public/brand/avatar.svg', avatar);
writeFileSync('src/assets/avatar.svg', avatar);

writeFileSync('public/brand/og.svg', og);
await sharp(Buffer.from(og)).png().toFile('public/og.png');
await sharp(Buffer.from(avatar)).resize(640).png().toFile('public/brand/avatar.png');
console.log('brand assets written');
