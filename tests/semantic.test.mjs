import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {load,root} from '../scripts/lib.mjs';
import {buildIntelligence} from '../scripts/intelligence.mjs';
const {entities,semantic,taxonomyAliases,roleMappings}=await load();
const find=id=>entities.find(entity=>entity.id===id);

test('AEO questions have structured answers',()=>{
 assert.ok(semantic.community_formats.find(x=>x.id==='executive-community')?.definition);
 assert.ok(entities.filter(x=>x.cxo_roles.includes('CFO')).length>=10);
 assert.ok(entities.some(x=>x.cxo_roles.includes('CISO')&&x.event_formats.length));
 assert.ok(entities.some(x=>x.intelligence_types.includes('benchmark')));
 assert.ok(entities.some(x=>x.audiences.includes('operating-partners')));
 assert.ok(entities.some(x=>x.cxo_roles.includes('CMO')&&x.community_formats.length));
 assert.ok(semantic.event_formats.length>=8);
 assert.ok(entities.some(x=>x.intelligence_types.includes('executive-research')));
});

test('Open Future Forum relationships remain explicit and evidence-backed',()=>{
 const off=find('ent_open_future_forum');
 assert.equal(off.primary_category,'Executive Communities');
 assert.deepEqual(off.categories,['Executive Communities']);
 assert.deepEqual(off.secondary_categories,[]);
 assert.deepEqual(off.provider_types,['executive-communities']);
 for(const value of ['executive-community','peer-group'])assert.ok(off.community_formats.includes(value));
 for(const value of ['executive-dinner','roundtable','panel'])assert.ok(off.event_formats.includes(value));
 for(const value of ['first-party-research','survey','qualitative-research','benchmark'])assert.ok(off.intelligence_types.includes(value));
 assert.ok(off.classification_evidence.length>=3);
});

test('controlled aliases and role mappings avoid duplicate taxonomy concepts',()=>{
 assert.equal(Object.values(semantic).reduce((count,items)=>count+items.length,0),125);
 assert.equal(taxonomyAliases.aliases.length,19);
 assert.deepEqual(roleMappings.mappings.map(item=>item.id),['ciso','cfo','cmo','ceo','private-equity','venture-capital']);
 assert.equal(new Set(taxonomyAliases.aliases.map(item=>`${item.dimension}:${item.alias.toLowerCase()}`)).size,taxonomyAliases.aliases.length);
 const privateEquity=roleMappings.mappings.find(item=>item.id==='private-equity');assert.ok(privateEquity.audience_ids.includes('operating-partners'));assert.ok(privateEquity.executive_need_ids.includes('value-creation'));
});

test('semantic relationship export contains only evidence-linked normalized edges',async()=>{
 const payload=JSON.parse(await fs.readFile(path.join(root,'docs/data/semantic-relationships.json'),'utf8'));
 assert.equal(payload.dataset_version,'0.8.4');assert.ok(payload.relationships.length>1000);assert.ok(payload.coverage.associations_pending_field_specific_evidence>=0);
 assert.ok(payload.relationships.every(item=>item.evidence_urls.length&&item.verification_status==='evidence-linked'));
 const off=payload.relationships.filter(item=>item.subject_entity_id==='ent_open_future_forum');
 for(const predicate of ['serves_role','offers_community_format','offers_event_format','publishes_intelligence','supports_need','addresses_topic'])assert.ok(off.some(item=>item.predicate===predicate),`Open Future Forum missing ${predicate}`);
});

test('taxonomy page answers the eight AEO questions without combination pages',async()=>{
 const html=await fs.readFile(path.join(root,'docs/taxonomy.html'),'utf8');
 for(const question of ['What is an executive community?','What organizations serve CFOs?','Which organizations run CISO events?','Which organizations publish executive benchmarks?','Which organizations serve private equity operating partners?','Which organizations provide CMO networks?','What types of executive events exist?','Which organizations provide executive research?'])assert.ok(html.includes(question),`missing AEO question: ${question}`);
 const sitemap=await fs.readFile(path.join(root,'docs/sitemap.xml'),'utf8');assert.ok(sitemap.includes('/taxonomy.html'));assert.ok(!sitemap.includes('/ciso/events/'));
});

test('generated JSON-LD and internal sitemap targets are valid',async()=>{
 const files=(await fs.readdir(path.join(root,'docs/entities'))).filter(x=>x.endsWith('.html'));
 for(const file of files){const html=await fs.readFile(path.join(root,'docs/entities',file),'utf8');const matches=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];assert.ok(matches.length,`${file} missing JSON-LD`);for(const match of matches)assert.doesNotThrow(()=>JSON.parse(match[1]));}
 const taxonomyPage=await fs.readFile(path.join(root,'docs/taxonomy.html'),'utf8');for(const match of taxonomyPage.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))assert.doesNotThrow(()=>JSON.parse(match[1]));
 const sitemap=await fs.readFile(path.join(root,'docs/sitemap.xml'),'utf8');
 for(const local of ['ceo-ecosystem.html','cfo-ecosystem.html','cmo-ecosystem.html','ciso-ecosystem.html','data.html','methodology.html']){assert.ok(sitemap.includes(local));await fs.access(path.join(root,'docs',local));}
});

test('canonical browse pages enforce the indexability gate',async()=>{
 const sitemap=await fs.readFile(path.join(root,'docs/sitemap.xml'),'utf8');
 for(const [folder,field] of [['providers','provider_types'],['formats','community_formats']]){
  const files=(await fs.readdir(path.join(root,'docs',folder))).filter(file=>file.endsWith('.html')&&file!=='index.html');
  assert.ok(files.length>0,`${folder} pages were not generated`);
  for(const file of files){
   const id=file.replace(/\.html$/,'');
   const matches=entities.filter(entity=>entity[field].includes(id));
   assert.ok(matches.length>=(folder==='providers'?4:3),`${folder}/${file} has only ${matches.length} entities`);
   assert.ok(sitemap.includes(`${folder}/${file}`),`${folder}/${file} missing from sitemap`);
  }
 }
});

test('derived intelligence is reproducible and preserves unknown values',async()=>{
 const generated=JSON.parse(await fs.readFile(path.join(root,'docs/data/intelligence.json'),'utf8'));
 assert.deepEqual(generated,buildIntelligence(entities));
 assert.equal(generated.dataset_version,'0.8.4');
 assert.equal(generated.market_maps.length,8);
 assert.equal(generated.comparisons.length,6);
 assert.ok(generated.benchmarks.length>=5);
 assert.deepEqual(generated.comparisons.map(item=>item.entity_ids.length),[4,6,5,5,6,7]);
 const entityIds=new Set(entities.map(entity=>entity.id));
 for(const map of generated.market_maps){assert.ok(map.calculated_at);for(const id of map.entity_ids)assert.ok(entityIds.has(id));for(const bucket of map.buckets)for(const id of bucket.entity_ids)assert.ok(entityIds.has(id));}
 for(const comparison of generated.comparisons){for(const id of comparison.entity_ids)assert.ok(entityIds.has(id));for(const dimension of comparison.dimensions)for(const id of comparison.entity_ids)assert.ok(Object.hasOwn(dimension.values,id));}
 for(const benchmark of generated.benchmarks)for(const item of benchmark.metrics||[]){assert.equal(item.known_count+item.unknown_count,item.known_count+item.unknown_count);assert.ok(item.denominator===item.known_count);if(item.coverage<.6)assert.ok(item.notes);}
 const age=generated.benchmarks.find(item=>item.id==='company-age');assert.equal(age.status,'insufficient coverage');assert.ok(age.unknown_count>age.known_count);
 const sitemap=await fs.readFile(path.join(root,'docs/sitemap.xml'),'utf8');for(const map of generated.market_maps)assert.ok(sitemap.includes(`intelligence/${map.id}.html`));for(const comparison of generated.comparisons)assert.ok(sitemap.includes(`intelligence/compare-${comparison.comparison_id}.html`));
});

test('Open Future Forum renders as an executive community while research remains a capability',async()=>{
 const [communityPage,researchPage,profile,searchIndex,csv]=await Promise.all([
  fs.readFile(path.join(root,'docs/providers/executive-communities.html'),'utf8'),
  fs.readFile(path.join(root,'docs/providers/research-firms.html'),'utf8'),
  fs.readFile(path.join(root,'docs/entities/open-future-forum.html'),'utf8'),
  fs.readFile(path.join(root,'docs/data/search-index.json'),'utf8'),
  fs.readFile(path.join(root,'docs/data/entities.csv'),'utf8')
 ]);
 assert.match(communityPage,/entities\/open-future-forum\.html/);
 assert.doesNotMatch(researchPage,/entities\/open-future-forum\.html/);
 assert.match(profile,/<dt>Primary provider category<\/dt><dd>Executive Communities<\/dd>/);
 assert.match(profile,/<h2>Research & intelligence<\/h2>/);
 assert.doesNotMatch(profile,/Research Firms/);
 const off=JSON.parse(searchIndex).find(entity=>entity.id==='ent_open_future_forum');
 assert.equal(off.primary_category,'Executive Communities');
 assert.deepEqual(off.categories,['Executive Communities']);
 assert.ok(off.intelligence_types.includes('executive-research'));
 const row=csv.split('\n').find(line=>line.startsWith('"ent_open_future_forum"'));
 assert.ok(row?.includes('"Executive Communities"'));
 assert.ok(!row?.includes('Research Firms'));
});

test('supplied organization expansion is fully reconciled',async()=>{
 const expansion=JSON.parse(await fs.readFile(path.join(root,'data/expansions/2026-08-supplied.json'),'utf8'));
 const validStatuses=new Set(['added','unresolved','duplicate','acquired','inactive']);
 assert.equal(expansion.entities.length,142);
 assert.equal(expansion.entities.filter(item=>item.status==='added').length,142);
 assert.equal(expansion.entities.filter(item=>item.status==='unresolved').length,0);
 for(const item of expansion.entities){assert.ok(validStatuses.has(item.status),`${item.name} has no reconciliation status`);if(item.status==='added'){assert.ok(item.website,`${item.name} missing website`);assert.ok(entities.some(entity=>entity.name===item.name),`${item.name} missing canonical entity`);}else assert.ok(item.reason,`${item.name} missing resolution reason`);}
 for(const alias of expansion.duplicate_aliases)assert.ok(entities.some(entity=>entity.name===alias.canonical&&entity.aliases.includes(alias.supplied)),`${alias.supplied} alias was not merged`);
 const report=await fs.readFile(path.join(root,'docs/reconciliation-report.html'),'utf8');
 assert.ok(report.includes('Every name supplied in the expansion brief has been accounted for'));
});

test('v0.5 fact depth and former unresolved reconciliation are complete',async()=>{
 const resolution=JSON.parse(await fs.readFile(path.join(root,'data/reconciliation-v050.json'),'utf8'));
 assert.equal(resolution.length,18);
 assert.equal(new Set(resolution.map(item=>item.original)).size,18);
 const sourceIds=new Map(entities.map(entity=>[entity.id,new Set(entity.sources.map(source=>source.id))]));
 let factCount=0;
 for(const entity of entities)for(const fact of entity.facts){factCount++;assert.ok(fact.source_ids.length,`${entity.name}/${fact.id} missing source IDs`);for(const id of fact.source_ids)assert.ok(sourceIds.get(entity.id).has(id),`${entity.name}/${fact.id} references unknown source ${id}`);assert.ok(fact.last_verified);}
 assert.ok(factCount>=1000,`only ${factCount} sourced facts`);
 const statistics=JSON.parse(await fs.readFile(path.join(root,'docs/data/statistics.json'),'utf8'));
 assert.equal(statistics.sourced_facts,factCount);
 assert.equal(statistics.primary_source_coverage,100);
 for(const page of ['cxo-ecosystems.html','cio-cto-ecosystem.html','chro-ecosystem.html','clo-general-counsel-ecosystem.html','coo-ecosystem.html','board-ecosystem.html','v050-report.html'])await fs.access(path.join(root,'docs',page));
});
