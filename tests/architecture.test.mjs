import test from 'node:test';import assert from 'node:assert/strict';import {load,stats} from '../scripts/lib.mjs';
const {entities,taxonomy}=await load();
test('seed proves multiple dimensions',()=>{const s=stats(entities);assert.ok(s.entities>=10);assert.ok(s.provider_categories>=8);assert.ok(s.cxo_functions>=8);assert.ok(s.geographies>=6)});
test('every record has evidence and inclusion basis',()=>{for(const e of entities){assert.ok(e.sources.length);assert.ok(e.inclusion_basis.length);assert.ok(e.sources.every(s=>s.supports.length))}});
test('taxonomy has required executive roles',()=>{for(const r of ['CEO','CFO','CMO','CISO','CIO','CTO','COO','CHRO','CLO','General Counsel','Board'])assert.ok(taxonomy.cxo_roles.includes(r))});
