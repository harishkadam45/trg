// Static site generator for The Rock Guy TX. Run: node build.mjs  -> outputs ./dist
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const read = (f) => JSON.parse(readFileSync(join('data', f), 'utf8'));
const site = read('site.json');
const { categories, items: products } = read('products.json');
const areas = read('areas.json');
const faqs = read('faqs.json').items;
const todayISO = new Date().toISOString().slice(0, 10);
const live = (x) => !x.expires || x.expires >= todayISO;
const specials = read('specials.json').items.filter(live);
if (site.announcementExpires && site.announcementExpires < todayISO) site.announcement = '';
const LOGO = site.logo || '/images/brand/logo.jpg';
const OG = '/images/brand/ig-2.jpg';
const brandMark = (w = 48) => `<img src="${LOGO}" width="${w}" height="${w}" alt="${esc(site.name)} logo" class="mark"><span class="wordmark">THE ROCK GUY <b>TX</b></span>`;

const OUT = 'dist';
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });
cpSync('static', OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (path) => site.domain + path;
const catName = (slug) => categories.find((c) => c.slug === slug).name;
const today = new Date().toISOString().slice(0, 10);
const sitemap = [];

const addr = site.address;
const fullAddr = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;

// ---------- structured data ----------
const business = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': url('/#business'),
  name: site.name,
  alternateName: ['The Rock Guy', 'TRG TX'],
  description: site.tagline,
  url: url('/'),
  telephone: site.phoneIntl,
  email: site.email,
  image: [url(OG), url('/images/brand/fb-cover.jpg')],
  logo: url(LOGO),
  priceRange: 'Call for pricing',
  address: { '@type': 'PostalAddress', streetAddress: addr.street, addressLocality: addr.city, addressRegion: addr.state, postalCode: addr.zip, addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
  areaServed: [
    ...areas.texas.map((a) => ({ '@type': 'City', name: `${a.name}, TX` })),
    { '@type': 'State', name: 'Texas' }, { '@type': 'State', name: 'Arkansas' }, { '@type': 'State', name: 'Oklahoma' }
  ],
  sameAs: Object.values(site.social),
  makesOffer: categories.map((c) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: c.name } })),
  potentialAction: { '@type': 'QuoteAction', target: url('/quote/') }
};
const website = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': url('/#website'), url: url('/'), name: site.name, publisher: { '@id': url('/#business') }, inLanguage: 'en-US' };
const faqSchema = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const crumbSchema = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t[0], item: url(t[1]) })) });

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

let _soc = 0;
const socialLinks = () => {
  const n = ++_soc;
  return `<a class="soc" href="${site.social.instagram}" rel="noopener me" target="_blank" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><defs><linearGradient id="ig${n}" x1="0.1" y1="1" x2="0.9" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".25" stop-color="#FA7E1E"/><stop offset=".5" stop-color="#D62976"/><stop offset=".75" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig${n})"/><rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="16.1" cy="7.9" r="1" fill="#fff"/></svg></a><a class="soc" href="${site.social.facebook}" rel="noopener me" target="_blank" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M16.67 15.47 17.2 12h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.67V12H6.08v3.47h3.05V24a12.1 12.1 0 0 0 3.74 0v-8.53h2.8z"/></svg></a><a class="soc" href="https://wa.me/${site.phoneIntl.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi The Rock Guy TX, I need a quote.')}" rel="noopener" target="_blank" aria-label="WhatsApp" title="WhatsApp"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path transform="translate(4.6 4.6) scale(.617)" fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>`;
};

// ---------- layout ----------
const nav = [
  ['/', 'Home'], ['/products/', 'Products'], ['/service-area/', 'Service Area'], ['/specials/', 'Specials'],
  ['/gallery/', 'Gallery'], ['/about/', 'About'], ['/faq/', 'FAQ'], ['/contact/', 'Contact']
];

function layout({ path, title, desc, body, schema = [], trail = [], robots = 'index,follow', ogType = 'website' }) {
  const canonical = url(path);
  const crumbs = trail.length ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map((t, i) => i < trail.length - 1 ? `<li><a href="${t[1]}">${esc(t[0])}</a></li>` : `<li aria-current="page">${esc(t[0])}</li>`).join('')}</ol></nav>` : '';
  const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots},max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#111111">
<meta name="geo.region" content="US-TX"><meta name="geo.placename" content="Dallas"><meta name="geo.position" content="${site.geo.lat};${site.geo.lng}"><meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${url(OG)}"><meta property="og:image:width" content="640"><meta property="og:image:height" content="640"><meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${url(OG)}"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
<link rel="icon" href="${LOGO}" type="image/jpeg"><link rel="apple-touch-icon" href="${LOGO}">
<link rel="stylesheet" href="/css/styles.css">
${ld(business)}
${ld(website)}
${trail.length ? ld(crumbSchema(trail)) : ''}
${schema.map(ld).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${site.announcement ? `<div class="announce"><a class="announce-text" href="/specials/">${esc(site.announcement)}</a><span class="social announce-social">${socialLinks()}</span></div>` : ''}
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="/" aria-label="${esc(site.name)} home">${brandMark()}</a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span><span></span></button>
    <nav id="nav" class="nav" aria-label="Main">
      ${nav.map((n) => `<a href="${n[0]}"${(n[0] === '/' ? path === '/' : path.startsWith(n[0])) ? ' aria-current="page"' : ''}>${n[1]}</a>`).join('')}
      <a class="btn btn-sm" href="/quote/">Get a Quote</a>
    </nav>
  </div>
</header>
<main id="main">
${crumbs}
${body}
</main>
<footer class="site-footer">
  <div class="wrap grid4">
    <div>
      <a class="brand" href="/">${brandMark(56)}</a>
      <p>${esc(site.tagline)}</p>
      <p class="social">${socialLinks()}</p>
    </div>
    <div><h3>Products</h3><ul>${categories.map((c) => `<li><a href="/products/#${c.slug}">${c.name}</a></li>`).join('')}</ul></div>
    <div><h3>Company</h3><ul>${nav.map((n) => `<li><a href="${n[0]}">${n[1]}</a></li>`).join('')}<li><a href="/quote/">Request a Quote</a></li></ul></div>
    <div>
      <h3>Contact</h3>
      <address>
        <a href="tel:${site.phoneIntl}">${site.phone}</a><br>
        <a href="mailto:${site.email}">${site.email}</a><br>
        ${esc(addr.street)}<br>${addr.city}, ${addr.state} ${addr.zip}
      </address>
      <p class="muted">Serving Texas, Arkansas &amp; Oklahoma</p>
    </div>
  </div>
  <div class="wrap legal">© ${new Date().getFullYear()} ${esc(site.name)}. All rights reserved. · <a href="/sitemap.xml">Sitemap</a></div>
</footer>
<div class="sticky-cta" aria-label="Quick contact"><a href="tel:${site.phoneIntl}">Call</a><a class="primary" href="/quote/">Free Quote</a></div>
<script src="/js/main.js" defer></script>
</body>
</html>`;
  const dir = path === '/404.html' ? OUT : join(OUT, path);
  if (path !== '/404.html') mkdirSync(dir, { recursive: true });
  writeFileSync(path === '/404.html' ? join(OUT, '404.html') : join(dir, 'index.html'), html);
  if (robots.startsWith('index')) sitemap.push({ path, priority: path === '/' ? '1.0' : path.split('/').filter(Boolean).length > 1 ? '0.6' : '0.8' });
}

// ---------- components ----------
const artStyle = (p) => p.image ? ` style="background:url('${p.image}') ${p.pos || 'center'}/cover no-repeat"` : '';
const specialCard = (s) => `<article class="card special">${s.image ? `<img src="${s.image}" alt="${esc(s.title)}" loading="lazy" width="526" height="526">` : ''}<div class="special-body"><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p>${s.expires ? `<p class="muted">Offer ends ${s.expires}.</p>` : ''}<a class="btn" href="/quote/">${esc(s.cta)}</a></div></article>`;
const photos = [
  ['/images/brand/ig-1.jpg', 'Premium crushed limestone for driveways, roads, pad sites, drainage and construction'],
  ['/images/brand/ig-3.jpg', 'New limestone pit in Fort Worth with 57 rock, 67 rock, flex base, base and oversize'],
  ['/images/brand/fb-grand-opening.jpg', 'Grand opening special at the Fort Worth pit, 3/4 inch and 1-1/2 inch limestone'],
  ['/images/brand/ig-2.jpg', 'The Rock Guy TX logo on crushed limestone'],
  ['/images/brand/fb-cover.jpg', 'River rock, white rock and crushed granite landscape stone']
];
const tile = (p) => `<a class="card tile t-${p.category}" href="/products/${p.slug}/">
  <span class="tile-art"${artStyle(p)} aria-hidden="true"></span>
  <span class="tile-body"><span class="tag">${catName(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><span class="more">View details →</span></span></a>`;

const faqBlock = (list, heading = 'Frequently asked questions') => `<section class="section"><div class="wrap narrow"><h2>${heading}</h2>
${list.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></section>`;

const ctaBand = `<section class="cta-band"><div class="wrap"><h2>Need material delivered?</h2><p>Tell us what you need and where. We will send a delivered price fast.</p><p><a class="btn btn-lg" href="/quote/">Request a Free Quote</a> <a class="btn btn-ghost btn-lg" href="tel:${site.phoneIntl}">Call ${site.phone}</a></p></div></section>`;

// ---------- home ----------
const homeFaqs = faqs.slice(0, 5);
layout({
  path: '/',
  title: 'Bulk Rock, Sand, Soil & Mulch Delivery in Dallas–Fort Worth, TX | The Rock Guy TX',
  desc: 'The Rock Guy TX sells bulk crushed limestone, gravel, sand, topsoil, fill dirt, mulch and compost with delivery across Texas, Arkansas and Oklahoma. Get a free quote today.',
  schema: [faqSchema(homeFaqs)],
  body: `
<section class="hero" style="--hero-img:url('/images/brand/fb-cover.jpg')">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">Dallas · Fort Worth · Texas · Arkansas · Oklahoma</p>
      <h1>Bulk rock, sand, soil &amp; mulch — delivered.</h1>
      <p class="lead">The Rock Guy TX supplies contractors, landscapers and homeowners with premium crushed limestone, gravel, fill, topsoil, mulch and compost at bulk pricing.</p>
      <p class="actions"><a class="btn btn-lg" href="/quote/">Get a Free Quote</a> <a class="btn btn-ghost btn-lg" href="tel:${site.phoneIntl}">Call ${site.phone}</a></p>
      <ul class="ticks"><li>Bulk pricing</li><li>High-quality material</li><li>DFW &amp; statewide delivery</li><li>Fort Worth pit now open</li></ul>
    </div>
    <aside class="quick-quote card" aria-labelledby="qq-h">
      <h2 id="qq-h">Quick quote</h2>
      <form name="quick-quote" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="quick-quote">
        <p class="hp"><label>Do not fill <input name="bot-field"></label></p>
        <label>Material
          <select name="material" required><option value="">Choose…</option>${products.map((p) => `<option>${esc(p.name)}</option>`).join('')}<option>Not sure</option></select></label>
        <label>Delivery ZIP or city <input name="location" required autocomplete="postal-code"></label>
        <label>Phone <input name="phone" type="tel" required autocomplete="tel"></label>
        <button class="btn btn-block" type="submit">Request pricing</button>
      </form>
    </aside>
  </div>
</section>

<section class="section"><div class="wrap">
  <h2>What we sell</h2>
  <p class="sub">Everything you need to build, grade, drain and landscape.</p>
  <div class="grid cat-grid">${categories.map((c) => `<a class="card cat t-${c.slug}" href="/products/#${c.slug}"><span class="tile-art" aria-hidden="true"></span><span class="tile-body"><h3>${c.name}</h3><p>${esc(c.blurb)}</p><span class="more">Browse →</span></span></a>`).join('')}</div>
</div></section>

${specials.length ? `<section class="section"><div class="wrap"><h2>Fresh from the yard</h2><p class="sub">Current specials and new arrivals.</p><div class="grid specials">${specials.filter((s) => s.image).slice(0, 2).map(specialCard).join('')}</div></div></section>` : ''}

<section class="section alt"><div class="wrap">
  <h2>Popular materials</h2>
  <div class="grid">${['crushed-limestone', 'flex-base', 'topsoil', 'fill-dirt', 'river-rock', 'bulk-mulch'].map((s) => tile(products.find((p) => p.slug === s))).join('')}</div>
</div></section>

<section class="section"><div class="wrap two">
  <div>
    <h2>Why contractors &amp; landscapers choose The Rock Guy</h2>
    <ul class="feature-list">
      <li><strong>Bulk pricing.</strong> Competitive per-ton and per-yard rates on every load.</li>
      <li><strong>Quality you can see.</strong> Clean, consistent, premium material.</li>
      <li><strong>Local and regional.</strong> Dallas yard, Fort Worth pit, deliveries into Arkansas and Oklahoma.</li>
      <li><strong>Straight answers.</strong> Real people, fast quotes, no runaround.</li>
    </ul>
  </div>
  <div class="card calc-teaser"><h3>How much do I need?</h3><p>Use our free calculator to estimate cubic yards and tons for any project.</p><a class="btn" href="/quote/#calculator">Open calculator</a></div>
</div></section>

<section class="section alt"><div class="wrap">
  <h2>Where we deliver</h2>
  <p class="sub">Serving the Dallas–Fort Worth metroplex, the rest of Texas, Arkansas and Oklahoma.</p>
  <ul class="chips">${areas.texas.map((a) => `<li><a href="/service-area/${a.slug}/">${a.name}, TX</a></li>`).join('')}${areas.regions.map((a) => `<li><a href="/service-area/${a.slug}/">${a.name}</a></li>`).join('')}</ul>
</div></section>

${faqBlock(homeFaqs)}
${ctaBand}`
});

// ---------- products ----------
layout({
  path: '/products/',
  title: 'Bulk Aggregate Products: Rock, Gravel, Sand, Soil & Mulch | The Rock Guy TX',
  desc: 'Browse crushed limestone, flex base, gravel, river rock, sand, topsoil, fill dirt, mulch and compost. Bulk pricing and delivery across Texas, Arkansas and Oklahoma.',
  trail: [['Home', '/'], ['Products', '/products/']],
  schema: [{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Bulk materials', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: url(`/products/${p.slug}/`), name: p.name })) }],
  body: `<section class="page-head"><div class="wrap"><h1>Bulk materials</h1><p class="lead">All materials are sold in bulk and delivered to your site. Pricing varies by quantity and location, so call or request a quote.</p></div></section>
${categories.map((c, i) => `<section class="section${i % 2 ? ' alt' : ''}" id="${c.slug}"><div class="wrap"><h2>${c.name}</h2><p class="sub">${esc(c.blurb)}</p><div class="grid">${products.filter((p) => p.category === c.slug).map(tile).join('')}</div></div></section>`).join('')}
${ctaBand}`
});

for (const p of products) {
  const related = products.filter((r) => r.category === p.category && r.slug !== p.slug).slice(0, 3);
  const pf = [
    { q: `What is ${p.name} used for?`, a: `${p.name} is commonly used for ${p.uses.join(', ').toLowerCase()}.` },
    { q: `How do I order ${p.name.toLowerCase()} in bulk?`, a: `Request a quote with your material, quantity and delivery address, or call ${site.phone}. We will confirm pricing and a delivery date.` },
    { q: `Do you deliver ${p.name.toLowerCase()} near me?`, a: `We deliver across the Dallas–Fort Worth area and surrounding Texas, plus Arkansas and Oklahoma for larger orders.` }
  ];
  layout({
    path: `/products/${p.slug}/`,
    title: `${p.name} — Bulk Delivery in Dallas–Fort Worth, TX | The Rock Guy TX`,
    desc: `${p.summary} Buy ${p.name.toLowerCase()} in bulk with delivery across Texas, Arkansas and Oklahoma. Request a free quote.`,
    trail: [['Home', '/'], ['Products', '/products/'], [p.name, `/products/${p.slug}/`]],
    ogType: 'product',
    schema: [
      { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, category: catName(p.category), brand: { '@type': 'Brand', name: site.name }, url: url(`/products/${p.slug}/`) },
      faqSchema(pf)
    ],
    body: `<section class="page-head"><div class="wrap two">
  <div><span class="tag">${catName(p.category)}</span><h1>${esc(p.name)}</h1>
  <p class="lead answer">${esc(p.summary)} Sold in bulk by The Rock Guy TX with delivery across Texas, Arkansas and Oklahoma.</p>
  <p class="actions"><a class="btn btn-lg" href="/quote/?material=${encodeURIComponent(p.name)}">Get a Quote</a> <a class="btn btn-ghost btn-lg" href="tel:${site.phoneIntl}">Call ${site.phone}</a></p></div>
  <div class="tile-art big t-${p.category}"${artStyle(p)} role="img" aria-label="${esc(p.name)}"></div>
</div></section>
<section class="section"><div class="wrap narrow">
  <h2>About ${esc(p.name)}</h2><p>${esc(p.description)}</p>
  <h2>Common uses</h2><ul class="feature-list">${p.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  <h2>Pricing &amp; delivery</h2><p>Price is based on quantity and delivery distance. Contact us for a delivered price and the next available delivery date.</p>
</div></section>
${faqBlock(pf)}
<section class="section alt"><div class="wrap"><h2>Related materials</h2><div class="grid">${related.map(tile).join('')}</div></div></section>
${ctaBand}`
  });
}

// ---------- service areas ----------
layout({
  path: '/service-area/',
  title: 'Service Area: Bulk Aggregate Delivery in DFW, Texas, Arkansas & Oklahoma | The Rock Guy TX',
  desc: 'The Rock Guy TX delivers bulk rock, sand, soil and mulch across Dallas–Fort Worth, Texas, Arkansas and Oklahoma. See the cities we serve.',
  trail: [['Home', '/'], ['Service Area', '/service-area/']],
  body: `<section class="page-head"><div class="wrap"><h1>Where we deliver</h1><p class="lead">Our Dallas yard and Fort Worth pit serve the whole DFW metroplex. Larger orders ship to the rest of Texas, Arkansas and Oklahoma.</p></div></section>
<section class="section"><div class="wrap"><h2>Texas cities</h2><ul class="chips big">${areas.texas.map((a) => `<li><a href="/service-area/${a.slug}/">${a.name}, TX</a></li>`).join('')}</ul>
<h2>Out-of-state delivery</h2><ul class="chips big">${areas.regions.map((a) => `<li><a href="/service-area/${a.slug}/">${a.name}</a></li>`).join('')}</ul>
<p>Don't see your city? Call ${site.phone}. We deliver across Texas.</p></div></section>${ctaBand}`
});

const areaPages = [...areas.texas.map((a) => ({ ...a, label: `${a.name}, ${a.state}`, isCity: true })), ...areas.regions.map((a) => ({ ...a, label: a.name, isCity: false }))];
for (const a of areaPages) {
  const af = [
    { q: `Do you deliver bulk rock and soil to ${a.label}?`, a: `Yes. The Rock Guy TX delivers crushed limestone, gravel, sand, topsoil, fill dirt, mulch and compost to ${a.label}. Request a quote with your address for a delivered price.` },
    { q: `How do I get a quote for delivery in ${a.name}?`, a: `Use the quote form or call ${site.phone}. Tell us the material, quantity and delivery address.` }
  ];
  layout({
    path: `/service-area/${a.slug}/`,
    title: `Bulk Rock, Sand, Soil & Mulch Delivery in ${a.label} | The Rock Guy TX`,
    desc: `Need bulk gravel, crushed limestone, sand, topsoil or mulch in ${a.label}? The Rock Guy TX offers bulk pricing and delivery. Free quotes.`,
    trail: [['Home', '/'], ['Service Area', '/service-area/'], [a.label, `/service-area/${a.slug}/`]],
    schema: [{ '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Bulk aggregate delivery', provider: { '@id': url('/#business') }, areaServed: { '@type': a.isCity ? 'City' : 'State', name: a.label }, name: `Bulk material delivery in ${a.label}` }, faqSchema(af)],
    body: `<section class="page-head"><div class="wrap"><h1>Bulk material delivery in ${esc(a.label)}</h1>
<p class="lead answer">The Rock Guy TX delivers bulk rock, sand, soil, mulch and compost to ${esc(a.label)}. ${esc(a.note)}</p>
<p class="actions"><a class="btn btn-lg" href="/quote/?location=${encodeURIComponent(a.name)}">Get a ${esc(a.name)} Quote</a> <a class="btn btn-ghost btn-lg" href="tel:${site.phoneIntl}">Call ${site.phone}</a></p></div></section>
<section class="section"><div class="wrap"><h2>Materials available for delivery to ${esc(a.name)}</h2><div class="grid">${products.slice(0, 6).map(tile).join('')}</div><p><a href="/products/">See all materials →</a></p></div></section>
${a.near ? `<section class="section alt"><div class="wrap narrow"><h2>Also serving nearby</h2><p>${a.near.map(esc).join(', ')} and surrounding communities.</p></div></section>` : ''}
${faqBlock(af, `${a.name} delivery questions`)}${ctaBand}`
  });
}

// ---------- quote ----------
layout({
  path: '/quote/',
  title: 'Request a Free Bulk Material Quote | The Rock Guy TX',
  desc: 'Request a free quote for bulk rock, sand, soil, mulch or compost. Tell us the material, quantity and delivery location and we will respond fast.',
  trail: [['Home', '/'], ['Request a Quote', '/quote/']],
  body: `<section class="page-head"><div class="wrap"><h1>Request a free quote</h1><p class="lead">Tell us what you need. We will reply with a delivered price. Prefer to talk? Call <a href="tel:${site.phoneIntl}">${site.phone}</a>.</p></div></section>
<section class="section"><div class="wrap two top">
  <form class="card form" id="quote-form" name="quote" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="quote">
    <p class="hp"><label>Do not fill <input name="bot-field"></label></p>
    <fieldset><legend>Material</legend>
      <label>Material <select name="material" id="material" required><option value="">Choose…</option>${categories.map((c) => `<optgroup label="${c.name}">${products.filter((p) => p.category === c.slug).map((p) => `<option>${esc(p.name)}</option>`).join('')}</optgroup>`).join('')}<option>Not sure — need advice</option></select></label>
      <div class="row"><label>Quantity <input name="quantity" type="number" min="0" step="any" inputmode="decimal" required></label>
      <label>Unit <select name="unit"><option>Tons</option><option>Cubic yards</option><option>Loads</option><option>Not sure</option></select></label></div>
      <label>Project type <select name="project"><option>Driveway / road</option><option>Pad site / construction</option><option>Landscaping</option><option>Drainage</option><option>Fill / grading</option><option>Other</option></select></label>
    </fieldset>
    <fieldset><legend>Delivery</legend>
      <label>Delivery address or city + ZIP <input name="location" id="location" required autocomplete="street-address"></label>
      <label>Preferred delivery date <input name="date" type="date"></label>
    </fieldset>
    <fieldset><legend>Your info</legend>
      <label>Name <input name="name" required autocomplete="name"></label>
      <label>Company (optional) <input name="company" autocomplete="organization"></label>
      <div class="row"><label>Phone <input name="phone" type="tel" required autocomplete="tel"></label>
      <label>Email <input name="email" type="email" required autocomplete="email"></label></div>
      <label>Notes <textarea name="notes" rows="4" placeholder="Access, truck size limits, timing, anything else…"></textarea></label>
    </fieldset>
    <button class="btn btn-lg btn-block" type="submit">Send my quote request</button>
    <p class="muted">We only use your info to prepare your quote.</p>
  </form>
  <aside>
    <div class="card" id="calculator"><h2>Quantity calculator</h2>
      <form id="calc" onsubmit="return false">
        <div class="row3"><label>Length (ft) <input id="c-l" type="number" min="0" step="any" inputmode="decimal"></label><label>Width (ft) <input id="c-w" type="number" min="0" step="any" inputmode="decimal"></label><label>Depth (in) <input id="c-d" type="number" min="0" step="any" inputmode="decimal"></label></div>
        <label>Material density <select id="c-density"><option value="1.4">Crushed rock / gravel (~1.4 tons/yd³)</option><option value="1.3">Sand (~1.3 tons/yd³)</option><option value="1.1">Soil / fill dirt (~1.1 tons/yd³)</option><option value="0.4">Mulch / compost (~0.4 tons/yd³)</option></select></label>
        <p class="result" id="calc-out" aria-live="polite">Enter dimensions to estimate.</p>
        <button class="btn btn-ghost btn-block" type="button" id="calc-use">Use in quote form</button>
        <p class="muted">Estimates only. Add 5–10% for compaction and waste.</p>
      </form></div>
    <div class="card"><h3>Prefer to call or email?</h3><p><a href="tel:${site.phoneIntl}">${site.phone}</a><br><a href="mailto:${site.email}">${site.email}</a></p></div>
  </aside>
</div></section>`
});

// ---------- thank you ----------
layout({ path: '/thank-you/', title: 'Thank you | The Rock Guy TX', desc: 'Your request was received.', robots: 'noindex,follow', body: `<section class="page-head"><div class="wrap narrow"><h1>Thanks — we got it.</h1><p class="lead">A team member will contact you shortly with your quote. Need it sooner? Call <a href="tel:${site.phoneIntl}">${site.phone}</a>.</p><p><a class="btn" href="/">Back to home</a></p></div></section>` });

// ---------- about ----------
layout({
  path: '/about/',
  title: 'About The Rock Guy TX | Dallas Bulk Aggregate Supplier',
  desc: 'The Rock Guy TX is a Dallas-based supplier of bulk rock, sand, soil, mulch and compost serving contractors, landscapers and homeowners in Texas, Arkansas and Oklahoma.',
  trail: [['Home', '/'], ['About', '/about/']],
  schema: [{ '@context': 'https://schema.org', '@type': 'AboutPage', url: url('/about/'), about: { '@id': url('/#business') } }],
  body: `<section class="page-head"><div class="wrap"><h1>About The Rock Guy TX</h1><p class="lead answer">The Rock Guy TX is a Dallas-based bulk aggregate supplier serving contractors, landscapers and homeowners across Texas, Arkansas and Oklahoma.</p></div></section>
<section class="section"><div class="wrap narrow">
<h2>What we do</h2><p>We supply bulk crushed limestone, gravel, sand, topsoil, fill dirt, pit run, mulch and compost, and deliver it where you need it. Our Dallas yard is on E Levee St, and our Fort Worth pit is now open.</p>
<h2>Our promise</h2><ul class="feature-list"><li>Bulk pricing you can count on</li><li>High-quality, consistent material</li><li>Clear communication from quote to delivery</li></ul>
<h2>Find us</h2><address>${esc(fullAddr)}<br>Phone: <a href="tel:${site.phoneIntl}">${site.phone}</a><br>Email: <a href="mailto:${site.email}">${site.email}</a></address>
</div></section>${ctaBand}`
});

// ---------- specials ----------
layout({
  path: '/specials/',
  title: 'Current Specials & Grand Opening Deals | The Rock Guy TX',
  desc: 'See current specials on bulk rock, sand, soil and mulch from The Rock Guy TX, including Fort Worth pit grand-opening pricing.',
  trail: [['Home', '/'], ['Specials', '/specials/']],
  body: `<section class="page-head"><div class="wrap"><h1>Specials</h1><p class="lead">Current deals on bulk material. Call for the latest pricing.</p></div></section>
<section class="section"><div class="wrap"><div class="grid specials">${specials.map(specialCard).join('')}</div></div></section>`
});

// ---------- gallery ----------
layout({
  path: '/gallery/',
  title: 'Photo Gallery: Rock, Sand, Soil & Mulch | The Rock Guy TX',
  desc: 'Photos of bulk materials, yard stock and deliveries from The Rock Guy TX.',
  trail: [['Home', '/'], ['Gallery', '/gallery/']],
  body: `<section class="page-head"><div class="wrap"><h1>Gallery</h1><p class="lead">A look at the materials we stock. Follow us on <a href="${site.social.instagram}" target="_blank" rel="noopener">Instagram</a> and <a href="${site.social.facebook}" target="_blank" rel="noopener">Facebook</a> for new arrivals and specials.</p></div></section>
<section class="section"><div class="wrap"><div class="grid gallery" id="gallery">${photos.map((p) => `<figure class="card"><a href="${p[0]}"><img src="${p[0]}" alt="${esc(p[1])}" loading="lazy"></a><figcaption>${esc(p[1])}</figcaption></figure>`).join('')}</div></div></section>${ctaBand}`
});

// ---------- faq ----------
layout({
  path: '/faq/',
  title: 'FAQ: Bulk Aggregate Delivery in Texas | The Rock Guy TX',
  desc: 'Answers about ordering bulk rock, sand, soil and mulch, delivery areas, how much material you need, and more.',
  trail: [['Home', '/'], ['FAQ', '/faq/']],
  schema: [faqSchema(faqs)],
  body: `<section class="page-head"><div class="wrap"><h1>Frequently asked questions</h1></div></section>${faqBlock(faqs, 'Ordering &amp; delivery')}${ctaBand}`
});

// ---------- contact ----------
layout({
  path: '/contact/',
  title: 'Contact The Rock Guy TX | Dallas, TX | 817-454-5779',
  desc: `Contact The Rock Guy TX at ${site.phone} or ${site.email}. ${fullAddr}.`,
  trail: [['Home', '/'], ['Contact', '/contact/']],
  schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', url: url('/contact/'), about: { '@id': url('/#business') } }],
  body: `<section class="page-head"><div class="wrap"><h1>Contact us</h1></div></section>
<section class="section"><div class="wrap two top">
<div><h2>Reach us</h2><address><strong>Phone:</strong> <a href="tel:${site.phoneIntl}">${site.phone}</a><br><strong>Email:</strong> <a href="mailto:${site.email}">${site.email}</a><br><strong>Address:</strong> ${esc(fullAddr)}<br><strong>Hours:</strong> ${esc(site.hours)}</address>
<p><a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}" target="_blank" rel="noopener">Get directions</a></p></div>
<form class="card form" name="contact" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="contact"><p class="hp"><label>Do not fill <input name="bot-field"></label></p>
<label>Name <input name="name" required></label><label>Email <input name="email" type="email" required></label><label>Phone <input name="phone" type="tel"></label><label>Message <textarea name="message" rows="5" required></textarea></label><button class="btn btn-block" type="submit">Send message</button></form>
</div></section>`
});

// ---------- 404 ----------
layout({ path: '/404.html', title: 'Page not found | The Rock Guy TX', desc: 'Page not found.', robots: 'noindex,follow', body: `<section class="page-head"><div class="wrap narrow"><h1>Page not found</h1><p class="lead">That page moved or never existed.</p><p><a class="btn" href="/">Home</a> <a class="btn btn-ghost" href="/products/">Products</a></p></div></section>` });

// ---------- sitemap, robots, llms ----------
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((s) => `  <url><loc>${url(s.path)}</loc><lastmod>${today}</lastmod><priority>${s.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /thank-you/\n\n# AI answer engines are welcome\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);
writeFileSync(join(OUT, 'llms.txt'), `# ${site.name}

> ${site.tagline} Based in Dallas, TX, serving Texas, Arkansas and Oklahoma.

Phone: ${site.phone}
Email: ${site.email}
Address: ${fullAddr}

## Key pages
- [Products](${url('/products/')}): ${products.map((p) => p.name).join(', ')}
- [Request a quote](${url('/quote/')}): material, quantity, delivery location
- [Service area](${url('/service-area/')}): ${areas.texas.map((a) => a.name).join(', ')}, Arkansas, Oklahoma
- [FAQ](${url('/faq/')})
- [Specials](${url('/specials/')})
`);
console.log(`Built ${sitemap.length} indexable pages -> ${OUT}/`);
