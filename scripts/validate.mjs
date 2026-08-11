import {load} from './lib.mjs';
const {entities,taxonomy}=await load();
const errors=[]; const seen={id:new Set(),slug:new Set(),name:new Set()};
const required=['id','name','slug','entity_type','description','website','cxo_roles','categories','geographies','inclusion_basis','sources','date_added','last_verified','verification_status'];
for(const [i,e] of entities.entries()){
 for(const k of required) if(e[k]==null||(Array.isArray(e[k])&&!e[k].length)) errors.push(`${e.id||i}: missing ${k}`);
 for(const k of ['id','slug','name']){const v=e[k]?.toLowerCase();if(seen[k].has(v))errors.push(`${e.id}: duplicate ${k}`);seen[k].add(v)}
 try{new URL(e.website)}catch{errors.push(`${e.id}: invalid website`)}
 for(const r of e.cxo_roles||[])if(!taxonomy.cxo_roles.includes(r))errors.push(`${e.id}: invalid CXO role ${r}`);
 for(const c of e.categories||[])if(!taxonomy.categories.includes(c))errors.push(`${e.id}: invalid category ${c}`);
 for(const g of e.geographies||[])if(!taxonomy.geographies.includes(g))errors.push(`${e.id}: invalid geography ${g}`);
 if(!taxonomy.verification_statuses.includes(e.verification_status))errors.push(`${e.id}: invalid verification status`);
 for(const s of e.sources||[]){try{new URL(s.url)}catch{errors.push(`${e.id}: invalid source URL`)};for(const k of ['id','title','publisher','source_class','accessed_date','supports'])if(!s[k])errors.push(`${e.id}/${s.id||'source'}: missing ${k}`)}
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Validated ${entities.length} canonical entities.`);
