const base=(process.env.BASE_URL||'https://openfutureforum.github.io/cxo-ecosystem-index/').replace(/\/?$/,'/');
const manifest=await fetch(`${base}data/build-manifest.json`,{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error(`build manifest: HTTP ${response.status}`);return response.json();});
const checks=[
 ['',html=>html.includes(`Dataset v${manifest.dataset_version}`)&&html.includes(`<strong>${manifest.organizations}</strong><span>Organizations</span>`)&&html.includes(`<strong>${manifest.sourced_facts}</strong><span>Sourced facts</span>`) ],
 ['data.html',html=>html.includes(`>${manifest.schema_version}</dd>`)&&html.includes('data/knowledge-graph.json')&&html.includes('data/build-manifest.json')],
 ['methodology.html'],['sitemap.xml'],['robots.txt',text=>text.includes(`${base}sitemap.xml`)],
 ['data/latest.json',text=>JSON.parse(text).dataset_version===manifest.dataset_version],
 ['data/knowledge-graph.json'],['data/entities.json'],['data/facts.json'],['data/sources.json'],['data/relationships.json'],
 ['entities/ramp.html'],['providers/cfo-technology.html'],['cfo-ecosystem.html'],['intelligence/cfo-technology.html'],['intelligence/compare-cfo-spend-platforms.html'],['intelligence/ai-capability.html']
];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
for(const [endpoint,validate] of checks){let failure;for(let attempt=1;attempt<=6;attempt++){try{const response=await fetch(`${base}${endpoint}`,{cache:'no-store',headers:{'cache-control':'no-cache'}});if(!response.ok)throw new Error(`HTTP ${response.status}`);const text=await response.text();if(validate&&!validate(text))throw new Error('content mismatch');failure=null;break;}catch(error){failure=error;if(attempt<6)await wait(5000);}}if(failure)throw new Error(`${endpoint||'homepage'}: ${failure.message}`);}
console.log(`Verified ${checks.length+1} live endpoints for dataset ${manifest.dataset_version} at commit ${manifest.build_commit.slice(0,12)}.`);
