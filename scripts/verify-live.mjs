import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from './lib.mjs';

const base=(process.env.BASE_URL||'https://openfutureforum.github.io/cxo-ecosystem-index/').replace(/\/?$/,'/');
const expectedPath=path.resolve(root,process.env.EXPECTED_MANIFEST||'docs/data/build-manifest.json');
const expected=JSON.parse(await fs.readFile(expectedPath,'utf8'));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const fetchText=async endpoint=>{const response=await fetch(`${base}${endpoint}`,{cache:'no-store',headers:{'cache-control':'no-cache'}});if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text();};

let liveManifest;
for(let attempt=1;attempt<=12;attempt++){
 try{
  liveManifest=JSON.parse(await fetchText('data/build-manifest.json'));
  if(liveManifest.release_fingerprint!==expected.release_fingerprint)throw new Error(`release fingerprint ${liveManifest.release_fingerprint} != deployed artifact ${expected.release_fingerprint}`);
  break;
 }catch(error){if(attempt===12)throw new Error(`build manifest: ${error.message}`);await wait(5000);}
}

const checks=[
 ['',html=>html.includes(`Dataset v${expected.dataset_version}`)&&html.includes(`<strong>${expected.organizations}</strong><span>Organizations</span>`)&&html.includes(`<strong>${expected.sourced_facts}</strong><span>Sourced facts</span>`)&&html.includes(expected.release_fingerprint)&&html.includes(`<link rel="canonical" href="${base}">`)],
 ['data.html',html=>html.includes(`>${expected.schema_version}</dd>`)&&html.includes(expected.release_fingerprint)&&html.includes(`<strong>${expected.semantic_relationships}</strong><span>Semantic relationships</span>`)&&html.includes('data/knowledge-graph.json')&&html.includes('Current Release Manifest')&&/data\/search-index\.[a-f0-9]{10}\.json/.test(html)],
 ['taxonomy.html',html=>html.includes('CXO formats, intelligence and outcomes taxonomy')&&html.includes('What is an executive community?')&&html.includes('data/semantic-relationships.json')],
 ['methodology.html',html=>html.includes(`<link rel="canonical" href="${base}methodology.html">`)],
 ['sitemap.xml',xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].every(match=>!match[1].includes('?'))&&xml.includes(`<loc>${base}</loc>`)&&!xml.includes('<sitemapindex')],
 ['robots.txt',text=>text.split('\n').filter(line=>line.startsWith('Sitemap:')).length===1&&text.includes(`${base}sitemap.xml`)],
 ['data/latest.json',text=>{const value=JSON.parse(text);return value.kind==='Current Release Manifest'&&value.release_fingerprint===expected.release_fingerprint;}],
 ['data/knowledge-graph.json'],['data/entities.json'],['data/facts.json'],['data/sources.json'],['data/relationships.json'],['data/semantic-relationships.json',text=>{const value=JSON.parse(text);return value.relationships.length===expected.semantic_relationships&&value.relationships.every(item=>item.evidence_urls.length);} ],['data/role-mappings.json',text=>JSON.parse(text).dataset_version===expected.dataset_version],
 ['entities/ramp.html',html=>html.includes(`<link rel="canonical" href="${base}entities/ramp.html">`)&&html.includes('<h1>Ramp</h1>')],
 ['providers/cfo-technology.html',html=>html.includes('CFO Technology')],['cfo-ecosystem.html',html=>html.includes('CFO Ecosystem')],
 ['intelligence/cfo-technology.html',html=>html.includes('<b>Dataset snapshot:</b>')&&html.includes('Category distribution')],
 ['intelligence/compare-cfo-spend-platforms.html',html=>html.includes('CFO Spend &amp; Finance Platforms')&&html.includes('<table>')],
 ['intelligence/ai-capability.html',html=>html.includes('AI Capability')],
 ['reports/search-console-handoff.json',text=>JSON.parse(text).submission_status==='not submitted']
];
for(const [endpoint,validate] of checks){let failure;for(let attempt=1;attempt<=6;attempt++){try{const text=await fetchText(endpoint);if(validate&&!validate(text))throw new Error('content mismatch');failure=null;break;}catch(error){failure=error;if(attempt<6)await wait(5000);}}if(failure)throw new Error(`${endpoint||'homepage'}: ${failure.message}`);}
console.log(`Verified ${checks.length+1} clean live endpoints for dataset ${expected.dataset_version}; production fingerprint matches ${expected.release_fingerprint}.`);
