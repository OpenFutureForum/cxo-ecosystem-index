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
