import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {load,root} from '../scripts/lib.mjs';
import {buildKnowledgeGraph,buildSourceRegistry} from '../scripts/governance.mjs';

const {entities}=await load();
const relationships=JSON.parse(await fs.readFile(path.join(root,'data/relationships/relationships.json'),'utf8'));

test('canonical sources and graph references are deterministic',()=>{
 const sources=buildSourceRegistry(entities);
 assert.ok(sources.length>=204);
 assert.equal(new Set(sources.map(source=>source.url)).size,sources.length);
 const graph=buildKnowledgeGraph(entities,relationships,sources);
 assert.equal(graph.sourced_relationship_count,relationships.length);
 assert.equal(graph.sourced_relationship_count,47);
 assert.equal(graph.derived_reciprocal_count,47);
 assert.equal(graph.relationships.filter(edge=>edge.derived_reciprocal).length,47);
 assert.equal(relationships.filter(edge=>edge.as_of_date==='2026-08-12').length>=18,true);
});

test('quantitative facts and derived metrics retain audit traces',async()=>{
 const altair=entities.find(entity=>entity.id==='ent_altair_capital');
 const money=altair.facts.find(fact=>fact.field==='assets_under_management');
 assert.equal(typeof money.value,'number');
 assert.equal(money.currency,'USD');
 assert.ok(money.as_of_date);
 const intelligence=JSON.parse(await fs.readFile(path.join(root,'docs/data/intelligence.json'),'utf8'));
 for(const benchmark of intelligence.benchmarks)for(const metric of benchmark.metrics||[]){
  assert.ok(metric.numerator<=metric.denominator);
  assert.equal(metric.numerator_entity_ids.length,metric.numerator);
  assert.equal(metric.unknown_entity_ids.length,metric.unknown_count);
  assert.ok(Array.isArray(metric.excluded_entity_ids));
 }
});

test('governance exports are published',async()=>{
 for(const file of ['sources.json','facts.json','relationships.json','knowledge-graph.json','search-index.json'])await fs.access(path.join(root,'docs/data',file));
 const graph=JSON.parse(await fs.readFile(path.join(root,'docs/data/knowledge-graph.json'),'utf8'));
 assert.equal(graph.dataset_version,'0.9.7');
 assert.equal(graph.schema_version,'3.2.0');
});
