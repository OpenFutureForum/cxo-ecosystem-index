import {load,readJSON} from './lib.mjs';
await readJSON('data/entity.schema.json');
await readJSON('data/intelligence.schema.json');
const {entities,taxonomy,semantic,classifications}=await load();
const errors=[];
const seen={id:new Set(),slug:new Set(),name:new Set()};
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
 for(const role of entity.cxo_roles||[])if(!taxonomy.cxo_roles.includes(role))errors.push(`${entity.id}: invalid CXO role ${role}`);
 for(const category of entity.categories||[])if(!taxonomy.categories.includes(category))errors.push(`${entity.id}: invalid category ${category}`);
 for(const geography of entity.geographies||[])if(!taxonomy.geographies.includes(geography))errors.push(`${entity.id}: invalid geography ${geography}`);
 if(!taxonomy.verification_statuses.includes(entity.verification_status))errors.push(`${entity.id}: invalid verification status`);
 for(const source of entity.sources||[]){try{new URL(source.url)}catch{errors.push(`${entity.id}: invalid source URL`)};for(const key of ['id','title','publisher','source_class','accessed_date','supports'])if(!source[key])errors.push(`${entity.id}/${source.id||'source'}: missing ${key}`)}
 for(const dimension of dimensions)for(const id of entity[dimension]||[])if(!vocab[dimension].has(id))errors.push(`${entity.id}: unknown ${dimension} term ${id}`);
 if(dimensions.some(d=>(entity[d]||[]).length)&&!(entity.classification_evidence||[]).length)errors.push(`${entity.id}: semantic classifications require evidence`);
 for(const evidence of entity.classification_evidence||[]){try{new URL(evidence.url)}catch{errors.push(`${entity.id}: invalid classification evidence URL`)};if(!evidence.supports?.length)errors.push(`${entity.id}: classification evidence missing supports`);for(const field of evidence.supports||[])if(!dimensions.includes(field))errors.push(`${entity.id}: evidence supports unknown field ${field}`)}
}
const entityIds=new Set(entities.map(e=>e.id));
const classifiedIds=new Set();
for(const record of classifications){if(classifiedIds.has(record.entity_id))errors.push(`classifications: duplicate entity ${record.entity_id}`);classifiedIds.add(record.entity_id);if(!entityIds.has(record.entity_id))errors.push(`classifications: orphan entity ${record.entity_id}`)}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Validated ${entities.length} canonical entities, ${classifications.length} semantic classification records, and ${dimensions.reduce((n,d)=>n+semantic[d].length,0)} controlled terms.`);
