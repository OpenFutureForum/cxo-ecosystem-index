import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const readJSON=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
export const write=async(p,v)=>{const f=path.join(root,p);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,v)};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export async function load(){return {entities:await readJSON('data/entities/seed.json'),taxonomy:await readJSON('data/taxonomy/core.json'),definitions:await readJSON('data/definitions/core.json')}}
export function stats(entities){
 const all=k=>new Set(entities.flatMap(e=>e[k]||[])).size;
 const sourceCount=entities.reduce((n,e)=>n+(e.sources?.length||0),0);
 return {generated_at:new Date().toISOString(),entities:entities.length,sourced_facts:entities.reduce((n,e)=>n+(e.sources||[]).reduce((m,s)=>m+(s.supports?.length||0),0),0),sources:sourceCount,verified_entities:entities.filter(e=>e.verification_status==='verified').length,cxo_functions:all('cxo_roles'),provider_categories:all('categories'),geographies:all('geographies'),industries:all('industries'),primary_source_coverage:entities.length?Math.round(100*entities.filter(e=>(e.sources||[]).some(s=>['official company','official organization','government','regulatory','investor relations'].includes(s.source_class))).length/entities.length):0};
}
