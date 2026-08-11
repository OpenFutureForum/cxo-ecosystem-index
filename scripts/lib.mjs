import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const readJSON=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
export const write=async(p,v)=>{const f=path.join(root,p);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,v)};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const entityId=name=>`ent_${slug(name).replaceAll('-','_')}`;
const expandRecord=(item,batchDate)=>({
 id:item.id||entityId(item.name),name:item.name,slug:item.slug||slug(item.name),entity_type:item.entity_type||'Organization',description:item.description,website:item.website,
 cxo_roles:item.cxo_roles,categories:item.categories,industries:item.industries||[],geographies:item.geographies||['United States'],
 aliases:item.aliases||[],parent_company:item.parent_company||null,relationship_notes:item.relationship_notes||null,editorial_priority:item.priority||null,
 inclusion_basis:[item.inclusion_basis||`${item.name} is included as an evidence-backed provider or ecosystem organization relevant to the listed executive functions.`],
 sources:[{id:`src_${slug(item.name)}_official`,url:item.source_url||item.website,title:item.source_title||`${item.name} official website`,publisher:item.name,source_class:item.source_class||'official organization',accessed_date:batchDate,supports:['identity','description','website','categories','cxo_roles']}],
 date_added:batchDate,last_verified:batchDate,verification_status:item.verification_status||'verified'
});
export async function load(){
 const dir=path.join(root,'data/entities');
 const files=(await fs.readdir(dir)).filter(x=>x.endsWith('.json')).sort();
 const batches=await Promise.all(files.map(x=>readJSON(`data/entities/${x}`)));
 const expansionDir=path.join(root,'data/expansions');
 let expansions=[];try{const expansionFiles=(await fs.readdir(expansionDir)).filter(x=>x.endsWith('.json')).sort();for(const file of expansionFiles){const manifest=await readJSON(`data/expansions/${file}`);expansions.push(...manifest.entities.filter(item=>item.status==='added').map(item=>expandRecord(item,manifest.verified_date)));}}catch(error){if(error.code!=='ENOENT')throw error;}
 const classifications=await readJSON('data/classifications.json');
 const byEntity=new Map(classifications.map(x=>[x.entity_id,x]));
 const entities=[...batches.flat(),...expansions].map(entity=>{
  const {entity_id:ignored,evidence=[],...extra}=byEntity.get(entity.id)||{};
  return {...entity,provider_types:entity.categories.map(slug),community_formats:[],event_formats:[],intelligence_types:[],resource_types:[],executive_needs:[],topics:[],audiences:[],...extra,classification_evidence:evidence};
 });
 return {entities,taxonomy:await readJSON('data/taxonomy/core.json'),semantic:await readJSON('data/taxonomy/semantic.json'),definitions:await readJSON('data/definitions/core.json'),classifications};
}
export function stats(entities){
 const all=k=>new Set(entities.flatMap(e=>e[k]||[])).size;
 const sourceCount=entities.reduce((n,e)=>n+(e.sources?.length||0),0);
 return {generated_at:new Date().toISOString(),entities:entities.length,sourced_facts:entities.reduce((n,e)=>n+(e.sources||[]).reduce((m,s)=>m+(s.supports?.length||0),0),0),sources:sourceCount,verified_entities:entities.filter(e=>e.verification_status==='verified').length,cxo_functions:all('cxo_roles'),provider_categories:all('categories'),geographies:all('geographies'),industries:all('industries'),primary_source_coverage:entities.length?Math.round(100*entities.filter(e=>(e.sources||[]).some(s=>['official company','official organization','government','regulatory','investor relations'].includes(s.source_class))).length/entities.length):0};
}
