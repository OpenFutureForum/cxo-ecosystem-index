import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {load,root} from '../scripts/lib.mjs';
import {buildCompleteness} from '../scripts/governance.mjs';
import {DATASET_VERSION,CALCULATED_AT} from '../scripts/intelligence.mjs';

const {entities}=await load();
const standard=JSON.parse(await fs.readFile(path.join(root,'data/governance/completeness-standard.json'),'utf8'));

test('completeness standard is neutral, weighted to 100, and covers every entity',()=>{
 assert.equal(standard.criteria.reduce((sum,criterion)=>sum+criterion.weight,0),100);
 assert.match(standard.scoring_note,/not the quality, size, reputation, or suitability/i);
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);
 assert.equal(result.entities.length,entities.length);
 assert.ok(result.entities.every(record=>record.score>=0&&record.score<=100));
 assert.deepEqual(new Set(result.entities.map(record=>record.entity_id)),new Set(entities.map(entity=>entity.id)));
 assert.equal(result.field_coverage.length,standard.criteria.length);
});

test('completeness queue prioritizes research depth without ranking organizations',()=>{
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);
 assert.ok(result.summary.research_priority_counts.P1>0);
 assert.ok(result.entities.some(record=>record.missing_criteria.includes('headquarters')));
 assert.ok(result.entities.some(record=>record.missing_criteria.includes('founded_year')));
 const off=result.entities.find(record=>record.entity_id==='ent_open_future_forum');
 assert.ok(off.score>=60);
 assert.ok(off.source_count>=3);
});

test('the first P1 enrichment batch adds depth without inventing unresolved facts',async()=>{
 const batch=JSON.parse(await fs.readFile(path.join(root,'data/enrichments-p1.json'),'utf8'));
 assert.equal(batch.length,50);
 const ids=new Set(batch.map(record=>record.entity_id));
 assert.equal(ids.size,50);
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);
 const records=result.entities.filter(record=>ids.has(record.entity_id));
 assert.equal(records.length,50);
 assert.ok(records.every(record=>record.source_count>=3));
 assert.ok(records.filter(record=>record.score>=60).length>=49);
 assert.ok(records.reduce((sum,record)=>sum+record.score,0)/records.length>=60);
 const indianHills=entities.find(entity=>entity.id==='ent_indian_hills_advisors');
 assert.equal(indianHills.verification_status,'needs verification');
 assert.deepEqual(indianHills.services,[]);
 assert.match(indianHills.relationship_notes,/parked-domain/i);
 const wti=entities.find(entity=>entity.id==='ent_western_technology_investment');
 assert.equal(wti.website,'https://www.westerntech.com/');
 assert.ok(wti.services.includes('venture debt'));
});

test('the second 50-profile batch is complete, layered, and evidence-conservative',async()=>{
 const [batch,manifest,classifications]=await Promise.all([
  fs.readFile(path.join(root,'data/enrichments-p2.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/governance/research-batch-v0.8.5.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/classifications-p2.json'),'utf8').then(JSON.parse)
 ]);
 assert.equal(batch.length,50);
 assert.equal(new Set(batch.map(record=>record.entity_id)).size,50);
 assert.deepEqual(new Set(batch.map(record=>record.entity_id)),new Set(manifest.entity_ids));
 assert.equal(classifications.length,49);
 assert.ok(classifications.every(record=>record.evidence?.length&&record.evidence.every(item=>item.supports?.length)));
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);
 const ids=new Set(manifest.entity_ids);const records=result.entities.filter(record=>ids.has(record.entity_id));
 const average=Number((records.reduce((sum,record)=>sum+record.score,0)/records.length).toFixed(1));
 assert.equal(records.length,50);
 assert.ok(average>=88);
 assert.ok(records.filter(record=>record.score>=80).length>=manifest.advanced_to_maintenance);
 assert.equal(manifest.before_average_score,49.7);
 assert.ok(manifest.after_average_score-manifest.before_average_score>=35);
 const indianHills=entities.find(entity=>entity.id==='ent_indian_hills_advisors');
 assert.equal(indianHills.verification_status,'needs verification');
 assert.deepEqual(indianHills.services,[]);
 assert.equal(indianHills.founded_year,undefined);
 assert.equal(indianHills.headquarters,undefined);
 const bmo=entities.find(entity=>entity.id==='ent_bmo');
 assert.ok(bmo.sources.some(source=>source.id==='src_bmo_technology_2026'));
 assert.ok(bmo.sources.some(source=>source.id==='src_bmo_about_2026'));
 assert.ok(bmo.industries.includes('Technology'));
});

test('the v0.9.0 priority batch improves decision-use fields without inventing geography',async()=>{
 const [batch,manifest,classifications]=await Promise.all([
  fs.readFile(path.join(root,'data/enrichments-p3.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/governance/research-batch-v0.9.0.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/classifications-p3.json'),'utf8').then(JSON.parse)
 ]);
 assert.equal(new Set(batch.map(record=>record.entity_id)).size,52);
 assert.equal(manifest.entity_ids.length,50);
 assert.ok(classifications.length>=40);
 assert.ok(classifications.every(record=>record.evidence?.length&&record.evidence.every(item=>item.supports?.length)));
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);const ids=new Set(manifest.entity_ids);const records=result.entities.filter(record=>ids.has(record.entity_id));
 const average=Number((records.reduce((sum,record)=>sum+record.score,0)/records.length).toFixed(1));
 assert.ok(average>=manifest.after_average_score);
 assert.ok(records.filter(record=>record.score>=80).length>=manifest.advanced_to_maintenance);
 assert.ok(manifest.after_average_score>manifest.before_average_score);
 assert.ok(entities.every(entity=>entity.geography_status==='verified'||entity.geographies.length===0));
 assert.ok(entities.filter(entity=>entity.geography_status==='unknown').length>100);
 for(const id of ['ent_indian_hills_advisors','ent_chameleon_ventures','ent_paygentic'])assert.equal(entities.find(entity=>entity.id===id).geography_status,'unknown');
});

test('the v0.9.2 priority batch increases first-party fact depth while preserving unknowns',async()=>{
 const [batch,manifest]=await Promise.all([
  fs.readFile(path.join(root,'data/enrichments-p4.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/governance/research-batch-v0.9.2.json'),'utf8').then(JSON.parse)
 ]);
 assert.equal(batch.length,manifest.improved_record_count);
 assert.equal(new Set(batch.map(record=>record.entity_id)).size,batch.length);
 assert.equal(batch.flatMap(record=>record.sources||[]).length,manifest.new_source_count);
 assert.equal(manifest.entity_ids.length,manifest.record_count);
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);const ids=new Set(manifest.entity_ids);const records=result.entities.filter(record=>ids.has(record.entity_id));
 const average=Number((records.reduce((sum,record)=>sum+record.score,0)/records.length).toFixed(1));
 assert.ok(average>=manifest.after_average_score);
 assert.ok(records.filter(record=>record.score>=80).length>=manifest.advanced_to_maintenance);
 assert.ok(manifest.after_average_score-manifest.before_average_score>=16);
 for(const id of ['ent_chameleon_ventures','ent_paygentic','ent_indian_hills_advisors']){const entity=entities.find(record=>record.id===id);assert.equal(entity.founded_year,undefined,`${id} unexpectedly gained founded_year`);assert.equal(entity.headquarters,undefined,`${id} unexpectedly gained headquarters`);}
 const atlas=entities.find(entity=>entity.id==='ent_atlas_cloud_ai');assert.equal(atlas.headquarters,'New York, New York, United States');assert.ok(atlas.products.includes('unified AI model API'));
 const cfgi=entities.find(entity=>entity.id==='ent_cfgi');assert.equal(cfgi.founded_year,2001);assert.equal(cfgi.headquarters,'Boston, Massachusetts, United States');
});

test('the v0.9.3 priority batch advances the current queue with first-party evidence',async()=>{
 const [batch,manifest,classifications]=await Promise.all([
  fs.readFile(path.join(root,'data/enrichments-p5.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/governance/research-batch-v0.9.3.json'),'utf8').then(JSON.parse),
  fs.readFile(path.join(root,'data/classifications-p4.json'),'utf8').then(JSON.parse)
 ]);
 assert.equal(batch.length,manifest.enrichment_record_count);
 assert.equal(classifications.length,manifest.classification_record_count);
 assert.equal(new Set(batch.map(record=>record.entity_id)).size,batch.length);
 assert.equal(batch.flatMap(record=>record.sources||[]).length,manifest.new_source_record_count);
 assert.ok(classifications.every(record=>record.evidence?.length&&record.evidence.every(item=>item.supports?.length)));
 assert.equal(manifest.entity_ids.length,manifest.record_count);
 const result=buildCompleteness(entities,standard,DATASET_VERSION,CALCULATED_AT);const ids=new Set(manifest.entity_ids);const records=result.entities.filter(record=>ids.has(record.entity_id));
 const average=Number((records.reduce((sum,record)=>sum+record.score,0)/records.length).toFixed(1));
 assert.equal(average,manifest.after_average_score);
 assert.equal(records.filter(record=>record.score>=80).length,manifest.advanced_to_maintenance);
 assert.ok(manifest.after_average_score-manifest.before_average_score>=29);
 for(const id of manifest.research_deferred){const entity=entities.find(record=>record.id===id);assert.equal(entity.founded_year,undefined,`${id} unexpectedly gained founded_year`);assert.equal(entity.headquarters,undefined,`${id} unexpectedly gained headquarters`);}
 const granica=entities.find(entity=>entity.id==='ent_granica');assert.equal(granica.founded_year,2019);assert.equal(granica.headquarters,'Mountain View, California, United States');
 const zenskar=entities.find(entity=>entity.id==='ent_zenskar');assert.equal(zenskar.founded_year,2022);assert.equal(zenskar.headquarters,'New York, New York, United States');
 const off=entities.find(entity=>entity.id==='ent_open_future_forum');assert.equal(off.primary_category,'Executive Communities');assert.ok(!off.categories.includes('Research Firms'));
});

test('generated completeness exports and public explanations agree',async()=>{
 const [json,csv,quality,profile,methodology]=await Promise.all([
  fs.readFile(path.join(root,'docs/data/completeness.json'),'utf8'),
  fs.readFile(path.join(root,'docs/data/completeness.csv'),'utf8'),
  fs.readFile(path.join(root,'docs/data-quality.html'),'utf8'),
  fs.readFile(path.join(root,'docs/entities/open-future-forum.html'),'utf8'),
  fs.readFile(path.join(root,'docs/methodology.html'),'utf8')
 ]);
 const payload=JSON.parse(json);
 assert.equal(payload.entities.length,entities.length);
 assert.equal(csv.trim().split('\n').length,entities.length+1);
 assert.match(quality,/Priority research queue/);
 assert.match(quality,/not ratings, rankings, endorsements/i);
 assert.match(profile,/RECORD COMPLETENESS/);
 assert.match(methodology,/not a rating, ranking, endorsement/i);
});
