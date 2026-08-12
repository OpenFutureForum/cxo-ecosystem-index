import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const readJSON=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
export const write=async(p,v)=>{const f=path.join(root,p);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,v)};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const entityId=name=>`ent_${slug(name).replaceAll('-','_')}`;
const mergeUnique=(left=[],right=[])=>[...new Set([...left,...right])];
const mergeSources=(left=[],right=[])=>{const byId=new Map();for(const source of [...left,...right]){const current=byId.get(source.id);byId.set(source.id,current?{...current,...source,supports:mergeUnique(current.supports,source.supports)}:source);}return [...byId.values()];};
const mergeLayer=(left,right,arrayFields)=>{const merged={...left,...right};for(const field of arrayFields)if(Array.isArray(left?.[field])||Array.isArray(right?.[field]))merged[field]=mergeUnique(left?.[field],right?.[field]);if(arrayFields.includes('sources')&&(Array.isArray(left?.sources)||Array.isArray(right?.sources)))merged.sources=mergeSources(left?.sources,right?.sources);return merged;};
const expandRecord=(item,batchDate)=>({
 id:item.id||entityId(item.name),name:item.name,slug:item.slug||slug(item.name),entity_type:item.entity_type||'Organization',description:item.description,website:item.website,
 cxo_roles:item.cxo_roles,categories:item.categories,industries:item.industries||[],geographies:item.geographies||[],
 aliases:item.aliases||[],parent_company:item.parent_company||null,relationship_notes:item.relationship_notes||null,editorial_priority:item.priority||null,facts:item.facts||[],
 inclusion_basis:[item.inclusion_basis||`${item.name} is included as an evidence-backed provider or ecosystem organization relevant to the listed executive functions.`],
 sources:[{id:`src_${slug(item.name)}_official`,url:item.source_url||item.website,title:item.source_title||`${item.name} official website`,publisher:item.name,source_class:item.source_class||'official organization',accessed_date:batchDate,supports:['identity','description','website','categories','cxo_roles',...(item.aliases?.length?['aliases']:[]),...(item.parent_company?['parent_company']:[]),...(item.relationship_notes?['relationship_notes']:[])]}],
 date_added:batchDate,last_verified:batchDate,verification_status:item.verification_status||'verified'
});
export async function load(){
 const dir=path.join(root,'data/entities');
 const files=(await fs.readdir(dir)).filter(x=>x.endsWith('.json')).sort();
 const batches=await Promise.all(files.map(x=>readJSON(`data/entities/${x}`)));
 const expansionDir=path.join(root,'data/expansions');
 let expansions=[];try{const expansionFiles=(await fs.readdir(expansionDir)).filter(x=>x.endsWith('.json')).sort();for(const file of expansionFiles){const manifest=await readJSON(`data/expansions/${file}`);expansions.push(...manifest.entities.filter(item=>item.status==='added').map(item=>expandRecord(item,manifest.verified_date)));}}catch(error){if(error.code!=='ENOENT')throw error;}
 let enrichments=[];for(const file of ['data/enrichments.json','data/enrichments-p1.json','data/enrichments-p2.json','data/enrichments-p3.json','data/enrichments-p4.json','data/enrichments-p5.json']){try{enrichments.push(...await readJSON(file))}catch(error){if(error.code!=='ENOENT')throw error;}}const enrichmentById=new Map();for(const item of enrichments)enrichmentById.set(item.entity_id,mergeLayer(enrichmentById.get(item.entity_id),item,['services','products','programs','capabilities','industries','geographies','sources']));
 let classifications=[];for(const file of ['data/classifications.json','data/classifications-p2.json','data/classifications-p3.json','data/classifications-p4.json','data/classifications-p5.json','data/classifications-p6.json']){try{classifications.push(...await readJSON(file))}catch(error){if(error.code!=='ENOENT')throw error;}}const byEntity=new Map();for(const item of classifications)byEntity.set(item.entity_id,mergeLayer(byEntity.get(item.entity_id),item,['community_formats','event_formats','intelligence_types','resource_types','executive_needs','topics','audiences','evidence']));classifications=[...byEntity.values()];
 const enrichedRecords=[...batches.flat(),...expansions].map(entity=>{const addition=enrichmentById.get(entity.id);if(!addition)return entity;const {entity_id:ignored,sources=[],...fields}=addition;return {...entity,...fields,services:[...new Set([...(entity.services||[]),...(fields.services||[])])],products:[...new Set([...(entity.products||[]),...(fields.products||[])])],sources:[...(entity.sources||[]),...sources]};});
 const entities=enrichedRecords.map(entity=>{
  const {entity_id:ignored,evidence=[],...extra}=byEntity.get(entity.id)||{};
  const primaryCategory=entity.primary_category||entity.categories[0];
  const supported=new Set((entity.sources||[]).flatMap(source=>source.supports||[]));
  const geographyVerified=['geographies','operating_geographies','geographic_scope'].some(field=>supported.has(field));
  const merged={...entity,geographies:geographyVerified?(entity.geographies||[]):[],geography_status:geographyVerified?'verified':'unknown',primary_category:primaryCategory,secondary_categories:entity.categories.filter(category=>category!==primaryCategory),provider_types:entity.categories.map(slug),community_formats:[],event_formats:[],intelligence_types:[],resource_types:[],executive_needs:[],topics:[],audiences:[],...extra,classification_evidence:evidence};
  const facts=new Map((merged.facts||[]).map(fact=>[`${fact.field}:${fact.value}`,fact]));
  for(const source of merged.sources||[])for(const field of source.supports||[]){const raw=field==='identity'?merged.name:merged[field];const values=Array.isArray(raw)?raw:raw==null?[]:[raw];for(const value of values){if(typeof value==='object')continue;const key=`${field}:${value}`;const existing=facts.get(key);if(existing)existing.source_ids.push(source.id);else facts.set(key,{id:`fact_${slug(merged.name)}_${slug(field)}_${slug(value).slice(0,48)}`,field,value,source_ids:[source.id],last_verified:merged.last_verified});}}
  return {...merged,facts:[...facts.values()]};
 });
 return {entities,taxonomy:await readJSON('data/taxonomy/core.json'),semantic:await readJSON('data/taxonomy/semantic.json'),taxonomyAliases:await readJSON('data/taxonomy/aliases.json'),roleMappings:await readJSON('data/taxonomy/role-mappings.json'),definitions:await readJSON('data/definitions/core.json'),classifications};
}
export function stats(entities){
 const all=k=>new Set(entities.flatMap(e=>e[k]||[])).size;
 const sourceCount=entities.reduce((n,e)=>n+(e.sources?.length||0),0);
 const sourcedFacts=entities.reduce((n,e)=>n+(e.facts?.length||0),0);const verifiedRecent=entities.filter(e=>Date.parse(e.last_verified)>=Date.now()-365*24*60*60*1000).length;const primary=entities.filter(e=>(e.sources||[]).some(s=>['official company','official organization','government','regulatory','investor relations'].includes(s.source_class))).length;
 return {generated_at:new Date().toISOString(),entities:entities.length,sourced_facts:sourcedFacts,facts_per_entity:entities.length?Number((sourcedFacts/entities.length).toFixed(1)):0,sources:sourceCount,average_sources_per_entity:entities.length?Number((sourceCount/entities.length).toFixed(1)):0,verified_entities:entities.filter(e=>e.verification_status==='verified').length,verified_within_12_months:verifiedRecent,volatile_facts_with_as_of_date:entities.reduce((n,e)=>n+(e.facts||[]).filter(f=>f.as_of_date).length,0),records_with_inclusion_basis:entities.filter(e=>e.inclusion_basis?.length).length,relationship_records:entities.filter(e=>e.parent_company||e.relationship_notes).length,cxo_functions:all('cxo_roles'),provider_categories:all('categories'),geographies:all('geographies'),industries:all('industries'),primary_source_coverage:entities.length?Math.round(100*primary/entities.length):0};
}
