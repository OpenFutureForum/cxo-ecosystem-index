import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from './lib.mjs';

const docs=path.join(root,'docs');
const base='https://openfutureforum.github.io/cxo-ecosystem-index/';
const htmlFiles=[];
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())await walk(target);else if(entry.name.endsWith('.html'))htmlFiles.push(target);}}
await walk(docs);

const relative=file=>path.relative(docs,file).replaceAll(path.sep,'/');
const expectedCanonical=file=>{const rel=relative(file);if(rel==='index.html')return base;if(rel.endsWith('/index.html'))return `${base}${rel.slice(0,-10)}`;return `${base}${rel}`;};
const urlToFile=url=>{const pathname=new URL(url).pathname.replace('/cxo-ecosystem-index/','');return path.join(docs,pathname.endsWith('/')?`${pathname}index.html`:pathname||'index.html');};
const fileMap=new Map();
const errors=[];
const canonicalOwners=new Map();
let pagesMissingTitles=0,pagesMissingDescriptions=0,pagesMissingStructuredData=0,queryCanonicals=0;
for(const file of htmlFiles){
 const html=await fs.readFile(file,'utf8');fileMap.set(file,html);
 const canonicals=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(match=>match[1]);
 if(canonicals.length!==1)errors.push(`${relative(file)}: expected one canonical, found ${canonicals.length}`);
 else{
  const canonical=canonicals[0];
  if(canonical.includes('?')){queryCanonicals++;errors.push(`${relative(file)}: query-string canonical ${canonical}`);}
  if(canonical!==expectedCanonical(file))errors.push(`${relative(file)}: canonical ${canonical} does not match ${expectedCanonical(file)}`);
  if(canonicalOwners.has(canonical))errors.push(`${relative(file)}: duplicate canonical also used by ${canonicalOwners.get(canonical)}`);else canonicalOwners.set(canonical,relative(file));
 }
 if(!/<title>[^<]+<\/title>/.test(html)){pagesMissingTitles++;errors.push(`${relative(file)}: missing title`);}
 if(!/<meta name="description" content="[^"]+">/.test(html)){pagesMissingDescriptions++;errors.push(`${relative(file)}: missing description`);}
 if(!/<script type="application\/ld\+json">/.test(html)){pagesMissingStructuredData++;errors.push(`${relative(file)}: missing structured data`);}
 if(!/<meta name="robots" content="index,follow">/.test(html))errors.push(`${relative(file)}: missing explicit index,follow`);
}

const sitemap=await fs.readFile(path.join(docs,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
const sitemapLastmods=[...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match=>match[1]);
if(new Set(sitemapUrls).size!==sitemapUrls.length)errors.push('sitemap: duplicate URLs');
if(sitemapLastmods.length!==sitemapUrls.length)errors.push('sitemap: every URL must have one lastmod');
for(const value of sitemapLastmods)if(!/^\d{4}-\d{2}-\d{2}$/.test(value))errors.push(`sitemap: invalid lastmod ${value}`);
const sitemapSet=new Set(sitemapUrls);
for(const url of sitemapUrls){try{await fs.access(urlToFile(url));}catch{errors.push(`sitemap: missing target ${url}`);}}
for(const canonical of canonicalOwners.keys())if(!sitemapSet.has(canonical))errors.push(`indexable canonical missing from sitemap: ${canonical}`);
for(const url of sitemapUrls)if(!canonicalOwners.has(url))errors.push(`sitemap URL has no matching canonical page: ${url}`);

const graph=new Map();
let brokenLinks=0;
for(const [file,html] of fileMap){const links=[];for(const match of html.matchAll(/href="([^"]+)"/g)){const href=match[1];if(/^(https?:|mailto:|#)/.test(href))continue;const clean=href.split(/[?#]/)[0];if(!clean)continue;let target=path.resolve(path.dirname(file),clean);try{const stat=await fs.stat(target);if(stat.isDirectory())target=path.join(target,'index.html');}catch{if(!path.extname(target))target=path.join(target,'index.html');}
  if(target.endsWith('.html')){try{await fs.access(target);links.push(target);}catch{brokenLinks++;errors.push(`${relative(file)}: broken HTML link ${href}`);}}
  else try{await fs.access(target);}catch{brokenLinks++;errors.push(`${relative(file)}: broken asset/data link ${href}`);}
 }graph.set(file,links);}
const reached=new Set();const queue=[path.join(docs,'index.html')];while(queue.length){const file=queue.shift();if(reached.has(file))continue;reached.add(file);for(const target of graph.get(file)||[])if(!reached.has(target))queue.push(target);}
const orphanPages=sitemapUrls.map(url=>urlToFile(url)).filter(file=>!reached.has(file)).map(relative);
for(const orphan of orphanPages)errors.push(`orphan indexable page: ${orphan}`);

const manifest=JSON.parse(await fs.readFile(path.join(docs,'data/build-manifest.json'),'utf8'));
const latest=JSON.parse(await fs.readFile(path.join(docs,'data/latest.json'),'utf8'));
const home=fileMap.get(path.join(docs,'index.html'));
const dataPage=fileMap.get(path.join(docs,'data.html'));
const visibleStat=(html,label)=>Number(html.match(new RegExp(`<strong>([0-9]+)<\\/strong><span>${label}<\\/span>`))?.[1]);
for(const [label,key] of [['Organizations','organizations'],['Sourced facts','sourced_facts'],['Canonical sources','canonical_sources']]){
 const homeValue=visibleStat(home,label);const dataValue=visibleStat(dataPage,label);if(homeValue!==manifest[key])errors.push(`homepage ${label} ${homeValue} != manifest ${manifest[key]}`);if(dataValue!==manifest[key])errors.push(`data page ${label} ${dataValue} != manifest ${manifest[key]}`);
}
if(!home.includes(`Dataset v${manifest.dataset_version}`))errors.push('homepage dataset version does not match manifest');
if(!home.includes(`Schema ${manifest.schema_version}`))errors.push('homepage schema version does not match manifest');
if(latest.dataset_version!==manifest.dataset_version||latest.schema_version!==manifest.schema_version||latest.build_commit!==manifest.build_commit)errors.push('latest endpoint does not match build manifest');

const historicalPages=new Set(['v050-report.html','reconciliation-report.html']);let staleVersionStrings=0;
for(const [file,html] of fileMap){if(historicalPages.has(relative(file)))continue;for(const pattern of [/dataset version 0\.7\.0/gi,/Dataset 0\.7\.0/g,/1,380\s*<\/strong><span>Sourced facts/gi,/1380\s*<\/strong><span>Sourced facts/gi]){const matches=html.match(pattern)||[];staleVersionStrings+=matches.length;}}
if(staleVersionStrings)errors.push(`current HTML contains ${staleVersionStrings} stale release references`);
for(const [file,html] of fileMap)for(const match of html.matchAll(/(?:href|src)="([^"]*(?:style|app)\.[^"]+)"/g)){const ref=match[1].split(/[?#]/)[0];if(!/\.(?:[a-f0-9]{10})\.(?:css|js)$/.test(ref))errors.push(`${relative(file)}: unversioned or obsolete asset ${match[1]}`);}

const readme=await fs.readFile(path.join(root,'README.md'),'utf8');
for(const value of [manifest.dataset_version,manifest.schema_version,manifest.organizations.toLocaleString('en-US'),manifest.sourced_facts.toLocaleString('en-US'),manifest.canonical_sources.toLocaleString('en-US')])if(!readme.includes(`| ${value} |`))errors.push(`README status block missing ${value}`);

const report={dataset_version:manifest.dataset_version,schema_version:manifest.schema_version,deployment_commit:manifest.build_commit,generated_at:manifest.generated_at,indexable_pages:sitemapUrls.length,sitemap_urls:sitemapUrls.length,pages_with_meaningful_lastmod:sitemapLastmods.length,orphan_pages:orphanPages,canonical_errors:errors.filter(error=>error.includes('canonical')).length,query_string_canonicals:queryCanonicals,noindex_pages:0,broken_links:brokenLinks,pages_missing_titles:pagesMissingTitles,pages_missing_descriptions:pagesMissingDescriptions,pages_missing_structured_data:pagesMissingStructuredData,stale_version_strings:staleVersionStrings};
await fs.mkdir(path.join(docs,'reports'),{recursive:true});await fs.writeFile(path.join(docs,'reports/discovery-audit.json'),JSON.stringify(report,null,2)+'\n');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Discovery audit passed: ${sitemapUrls.length} indexable pages, 0 canonical errors, 0 orphans, 0 broken links.`);
