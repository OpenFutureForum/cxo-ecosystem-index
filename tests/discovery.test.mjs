import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from '../scripts/lib.mjs';

const docs=path.join(root,'docs');
const base='https://openfutureforum.github.io/cxo-ecosystem-index/';
const manifest=JSON.parse(await fs.readFile(path.join(docs,'data/build-manifest.json'),'utf8'));
const home=await fs.readFile(path.join(docs,'index.html'),'utf8');
const dataPage=await fs.readFile(path.join(docs,'data.html'),'utf8');
const publisherPage=await fs.readFile(path.join(docs,'publisher.html'),'utf8');
const offProfile=await fs.readFile(path.join(docs,'entities/open-future-forum.html'),'utf8');
const sitemap=await fs.readFile(path.join(docs,'sitemap.xml'),'utf8');

test('homepage, Data page and freshness endpoints match the build manifest',async()=>{
 assert.ok(home.includes(`Dataset v${manifest.dataset_version}`));
 assert.ok(home.includes(`<strong>${manifest.organizations}</strong><span>Organizations</span>`));
 assert.ok(home.includes(`<strong>${manifest.sourced_facts}</strong><span>Sourced facts</span>`));
 assert.ok(home.includes(`<strong>${manifest.canonical_sources}</strong><span>Canonical sources</span>`));
 for(const value of [manifest.organizations,manifest.sourced_facts,manifest.canonical_sources])assert.ok(dataPage.includes(`<strong>${value}</strong>`));
 const latest=JSON.parse(await fs.readFile(path.join(docs,'data/latest.json'),'utf8'));
 assert.equal(latest.dataset_version,manifest.dataset_version);assert.equal(latest.build_commit,manifest.build_commit);assert.equal(latest.release_fingerprint,manifest.release_fingerprint);
 assert.ok(home.includes(manifest.release_fingerprint));assert.ok(dataPage.includes(manifest.release_fingerprint));
});

test('canonical homepage is clean and filter state cannot become canonical',()=>{
 assert.ok(home.includes(`<link rel="canonical" href="${base}">`));
 assert.ok(!home.match(/<link rel="canonical"[^>]*[?&](?:v|utm_|role|location)=/));
 assert.ok(!home.includes('<meta name="robots" content="index,follow">'));
});

test('sitemap contains unique clean canonical URLs and only meaningful lastmod values',()=>{
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
 const lastmods=[...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match=>match[1]);
 assert.equal(new Set(urls).size,urls.length);assert.ok(lastmods.length>0);assert.ok(lastmods.length<urls.length);
 assert.ok(urls.every(url=>!url.includes('?')));assert.ok(!urls.some(url=>url.includes('/data/quality/')));
 assert.ok(lastmods.every(value=>/^\d{4}-\d{2}-\d{2}$/.test(value)));
});

test('static HTML uses content-hashed assets and exposes primary discovery links',()=>{
 assert.match(home,/assets\/style\.[a-f0-9]{10}\.css/);assert.match(home,/assets\/app\.[a-f0-9]{10}\.js/);
 for(const href of ['cxo-ecosystems.html','providers/','intelligence/','data.html','methodology.html','data-quality.html','intelligence/cfo-technology.html','intelligence/compare-cfo-spend-platforms.html'])assert.ok(home.includes(`href="${href}`),`homepage missing ${href}`);
});

test('publisher identity is explicit, linked and machine-readable without changing taxonomy',()=>{
 for(const page of [home,dataPage,publisherPage,offProfile]){
  assert.ok(page.includes('publisher.html#organization'));
  assert.ok(page.includes('Open Future Forum'));
 }
 assert.ok(home.includes('Published by <a href="publisher.html">Open Future Forum</a>'));
 assert.ok(publisherPage.includes('Publisher status does not affect'));
 assert.ok(publisherPage.includes('https://openfutureforum.com/research/executive-ai-leverage-report'));
 assert.ok(publisherPage.includes('FAQPage'));
 assert.ok(sitemap.includes(`${base}publisher.html`));
});

test('Open Future Forum answer profile preserves neutral primary classification',()=>{
 assert.ok(offProfile.includes('<h2>Open Future Forum is an executive community</h2>'));
 assert.ok(offProfile.includes('<dt>Primary provider category</dt><dd>Executive Communities</dd>'));
 assert.ok(offProfile.includes('Research is a secondary capability')||offProfile.includes('Original operator research is an evidence-backed secondary capability'));
 assert.ok(offProfile.includes('https://github.com/OpenFutureForum'));
 assert.ok(offProfile.includes('FAQPage'));
 assert.ok(!offProfile.includes('Research Firms'));
});

test('README status block matches generated metrics',async()=>{
 const readme=await fs.readFile(path.join(root,'README.md'),'utf8');
 for(const value of [manifest.dataset_version,manifest.schema_version,manifest.organizations.toLocaleString('en-US'),manifest.sourced_facts.toLocaleString('en-US'),manifest.canonical_sources.toLocaleString('en-US')])assert.ok(readme.includes(`| ${value} |`),`README missing ${value}`);
 assert.ok(readme.includes('.github/workflows/pages.yml'));
});

test('robots and Data authority hub expose current canonical resources',async()=>{
 const robots=await fs.readFile(path.join(docs,'robots.txt'),'utf8');assert.ok(robots.includes('Allow: /'));assert.ok(robots.includes(`${base}sitemap.xml`));
 for(const resource of ['entities.json','entities.csv','facts.json','sources.json','completeness.json','completeness.csv','completeness.schema.json','relationships.json','semantic-relationships.json','semantic-relationship.schema.json','knowledge-graph.json','taxonomy.json','taxonomy-aliases.json','role-mappings.json','definitions.json','intelligence.json','benchmarks.json','market-maps.json','build-manifest.json','latest.json'])assert.ok(dataPage.includes(`data/${resource}`),`Data page missing ${resource}`);
 assert.match(dataPage,/data\/search-index\.[a-f0-9]{10}\.json/);
 for(const property of ['DataCatalog','Dataset','DataDownload','includedInDataCatalog','isBasedOn','sameAs'])assert.ok(dataPage.includes(`\"${property}\"`),`Data structured data missing ${property}`);
 assert.ok(dataPage.includes('CITATION.cff'));
 const roleMappings=JSON.parse(await fs.readFile(path.join(docs,'data/role-mappings.json'),'utf8'));
 assert.equal(roleMappings.dataset_version,manifest.dataset_version);
});

test('Search Console handoff is explicit and does not claim submission',async()=>{
 const handoff=JSON.parse(await fs.readFile(path.join(docs,'reports/search-console-handoff.json'),'utf8'));
 assert.equal(handoff.submission_status,'not submitted');assert.equal(handoff.priority_urls.length,18);
 assert.equal(handoff.sitemap_url,`${base}sitemap.xml`);assert.ok(handoff.priority_urls.every(url=>!url.includes('?')));
});
