import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {load,root} from '../scripts/lib.mjs';
import {buildIntelligence} from '../scripts/intelligence.mjs';
import {buildKnowledgeGraph,buildSourceRegistry} from '../scripts/governance.mjs';

const {entities}=await load();
const byId=new Map(entities.map(entity=>[entity.id,entity]));

test('completed acquisitions and integrations are sourced graph edges',async()=>{
 const relationships=JSON.parse(await fs.readFile(path.join(root,'data/relationships/relationships.json'),'utf8'));
 const graph=buildKnowledgeGraph(entities,relationships,buildSourceRegistry(entities));
 const brex=graph.relationships.find(edge=>edge.id==='rel_brex_acquired_by_capital_one');
 assert.equal(brex.object_entity_id,'ent_capital_one');
 assert.equal(brex.valid_from,'2026-04-07');
 assert.ok(graph.relationships.some(edge=>edge.id==='rel_bill_integrates_with_rillet'));
 for(const edge of graph.relationships.filter(edge=>edge.derived_reciprocal))assert.ok(edge.source_relationship_id);
});

test('future SVB rebrand remains announced rather than current',()=>{
 const svb=byId.get('ent_silicon_valley_bank');
 assert.equal(svb.name,'Silicon Valley Bank');
 const future=svb.facts.find(fact=>fact.field==='announced_future_name');
 assert.ok(Date.parse(future.valid_from)>Date.parse('2026-08-11'));
 assert.equal(svb.facts.find(fact=>fact.field==='current_display_name').value,'Silicon Valley Bank');
});

test('downloadable cohorts exactly match analytical map IDs',async()=>{
 const intelligence=buildIntelligence(entities);
 for(const id of ['cfo-technology','ai-security','executive-communities','executive-search','technology-law-firms','banking-capital']){
  const map=intelligence.market_maps.find(item=>item.id===id);
  const cohort=JSON.parse(await fs.readFile(path.join(root,'docs/data/cohorts',`${id}.json`),'utf8'));
  assert.deepEqual(cohort.entity_ids,map.entity_ids);
  assert.equal(cohort.entities.length,map.total_entities);
 }
});

test('market maps, comparisons and metric denominators use canonical IDs',()=>{
 const intelligence=buildIntelligence(entities);const ids=new Set(byId.keys());
 for(const map of intelligence.market_maps)for(const id of map.entity_ids)assert.ok(ids.has(id));
 for(const comparison of intelligence.comparisons)for(const id of comparison.entity_ids)assert.ok(ids.has(id));
 for(const benchmark of intelligence.benchmarks)for(const metric of benchmark.metrics||[]){assert.ok(metric.numerator<=metric.denominator);assert.equal(metric.known_count+metric.unknown_count,metric.cohort_entity_ids.length);}
});
