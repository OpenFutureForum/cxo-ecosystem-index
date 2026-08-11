import {load,readJSON} from './lib.mjs';
import {buildSourceRegistry,buildKnowledgeGraph,SUPPORTED_CURRENCIES} from './governance.mjs';
await readJSON('data/entity.schema.json');
await readJSON('data/intelligence.schema.json');
await readJSON('data/source.schema.json');
await readJSON('data/relationship.schema.json');
const {entities,taxonomy,semantic,classifications}=await load();
const relationships=await readJSON('data/relationships/relationships.json');
const errors=[];
const seen={id:new Set(),slug:new Set(),name:new Set()};
const websites=new Set(), aliases=new Map();
const required=['id','name','slug','entity_type','description','website','cxo_roles','categories','geographies','inclusion_basis','sources','date_added','last_verified','verification_status'];
const dimensions=['community_formats','event_formats','intelligence_types','resource_types','executive_needs','topics','audiences'];
const vocab={};
for(const dimension of dimensions){
 vocab[dimension]=new Set();
 const labels=new Set();
 for(const term of semantic[dimension]||[]){
  if(vocab[dimension].has(term.id))errors.push(`taxonomy: duplicate ${dimension} ID ${term.id}`);
  if(labels.has(term.label.toLowerCase()))errors.push(`taxonomy: duplicate ${dimension} label ${term.label}`);
  if(!term.definition)errors.push(`taxonomy: missing definition for ${dimension}/${term.id}`);
  vocab[dimension].add(term.id);labels.add(term.label.toLowerCase());
 }
}
for(const [index,entity] of entities.entries()){
 for(const key of required)if(entity[key]==null||(Array.isArray(entity[key])&&!entity[key].length))errors.push(`${entity.id||index}: missing ${key}`);
 for(const key of ['id','slug','name']){const value=entity[key]?.toLowerCase();if(seen[key].has(value))errors.push(`${entity.id}: duplicate ${key}`);seen[key].add(value)}
 try{new URL(entity.website)}catch{errors.push(`${entity.id}: invalid website`)}
 const website=entity.website?.replace(/\/$/,'').toLowerCase();if(websites.has(website))errors.push(`${entity.id}: duplicate website ${website}`);websites.add(website);
 for(const alias of [entity.name,...(entity.aliases||[])]){const key=alias.toLowerCase();if(aliases.has(key)&&aliases.get(key)!==entity.id)errors.push(`${entity.id}: duplicate name/alias ${alias}`);aliases.set(key,entity.id)}
 for(const role of entity.cxo_roles||[])if(!taxonomy.cxo_roles.includes(role))errors.push(`${entity.id}: invalid CXO role ${role}`);
 for(const category of entity.categories||[])if(!taxonomy.categories.includes(category))errors.push(`${entity.id}: invalid category ${category}`);
 for(const geography of entity.geographies||[])if(!taxonomy.geographies.includes(geography))errors.push(`${entity.id}: invalid geography ${geography}`);
 if(!taxonomy.verification_statuses.includes(entity.verification_status))errors.push(`${entity.id}: invalid verification status`);
 for(const source of entity.sources||[]){try{new URL(source.url)}catch{errors.push(`${entity.id}: invalid source URL`)};for(const key of ['id','title','publisher','source_class','accessed_date','supports'])if(!source[key])errors.push(`${entity.id}/${source.id||'source'}: missing ${key}`)}
 const sourceIds=new Set((entity.sources||[]).map(source=>source.id));
 for(const fact of entity.facts||[]){
  for(const sourceId of fact.source_ids||[])if(!sourceIds.has(sourceId))errors.push(`${entity.id}/${fact.id}: unknown source ${sourceId}`);
  if(fact.currency&&!SUPPORTED_CURRENCIES.has(fact.currency))errors.push(`${entity.id}/${fact.id}: unsupported currency ${fact.currency}`);
  if(fact.minimum!=null&&fact.maximum!=null&&fact.minimum>fact.maximum)errors.push(`${entity.id}/${fact.id}: minimum exceeds maximum`);
  if(fact.field.match(/assets|funding|price|revenue|valuation/i)&&typeof fact.value==='number'&&!fact.currency)errors.push(`${entity.id}/${fact.id}: monetary value needs currency`);
  for(const field of ['as_of_date','valid_from','valid_to','last_verified'])if(fact[field]&&Number.isNaN(Date.parse(fact[field])))errors.push(`${entity.id}/${fact.id}: invalid ${field}`);
  if(fact.valid_from&&fact.valid_to&&fact.valid_from>fact.valid_to)errors.push(`${entity.id}/${fact.id}: invalid validity interval`);
 }
 for(const dimension of dimensions)for(const id of entity[dimension]||[])if(!vocab[dimension].has(id))errors.push(`${entity.id}: unknown ${dimension} term ${id}`);
 if(dimensions.some(d=>(entity[d]||[]).length)&&!(entity.classification_evidence||[]).length)errors.push(`${entity.id}: semantic classifications require evidence`);
 for(const evidence of entity.classification_evidence||[]){try{new URL(evidence.url)}catch{errors.push(`${entity.id}: invalid classification evidence URL`)};if(!evidence.supports?.length)errors.push(`${entity.id}: classification evidence missing supports`);for(const field of evidence.supports||[])if(!dimensions.includes(field))errors.push(`${entity.id}: evidence supports unknown field ${field}`)}
}
const entityIds=new Set(entities.map(e=>e.id));
const sources=buildSourceRegistry(entities);
if(new Set(sources.map(source=>source.url)).size!==sources.length)errors.push('sources: duplicate canonical URL');
try{buildKnowledgeGraph(entities,relationships,sources)}catch(error){errors.push(`relationships: ${error.message}`)}
const classifiedIds=new Set();
for(const record of classifications){if(classifiedIds.has(record.entity_id))errors.push(`classifications: duplicate entity ${record.entity_id}`);classifiedIds.add(record.entity_id);if(!entityIds.has(record.entity_id))errors.push(`classifications: orphan entity ${record.entity_id}`)}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Validated ${entities.length} canonical entities, ${sources.length} canonical sources, ${relationships.length} sourced relationships, ${classifications.length} semantic classification records, and ${dimensions.reduce((n,d)=>n+semantic[d].length,0)} controlled terms.`);
