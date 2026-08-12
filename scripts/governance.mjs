export const SCHEMA_VERSION='3.1.0';
export const SOURCE_SCHEMA_VERSION='1.0.0';
export const RELATIONSHIP_SCHEMA_VERSION='1.0.0';
export const SUPPORTED_CURRENCIES=new Set(['USD','EUR','GBP','CAD','CHF','JPY','AUD','SGD']);
export const RELATIONSHIP_TYPES=new Set(['parent_of','subsidiary_of','has_division','division_of','acquired','acquired_by','funded_by','invested_in','integrates_with','partner_of','member_of','advised_by','sponsor_of']);
export const INVERSE_RELATIONSHIPS={parent_of:'subsidiary_of',subsidiary_of:'parent_of',has_division:'division_of',division_of:'has_division',acquired:'acquired_by',acquired_by:'acquired',funded_by:'invested_in',invested_in:'funded_by',integrates_with:'integrates_with',partner_of:'partner_of'};
const PRIMARY_CLASSES=new Set(['official company','official organization','government','regulatory','investor relations']);
const sourceType=value=>({'official company':'official-company','official organization':'official-company','government':'government','regulatory':'regulatory','investor relations':'investor-relations'}[value]||value?.replaceAll(' ','-')||'other');

export function buildSourceRegistry(entities){
 const byUrl=new Map();
 for(const entity of entities)for(const source of entity.sources||[]){const current=byUrl.get(source.url);if(current){current.supported_entity_ids=[...new Set([...current.supported_entity_ids,entity.id])];current.alias_source_ids=[...new Set([...current.alias_source_ids,source.id])];current.supports=[...new Set([...current.supports,...source.supports])];continue;}byUrl.set(source.url,{id:source.id,url:source.url,title:source.title,publisher:source.publisher,source_type:sourceType(source.source_class),published_date:source.published_date||null,accessed_date:source.accessed_date,primary_source:PRIMARY_CLASSES.has(source.source_class),supported_entity_ids:[entity.id],alias_source_ids:[source.id],supports:[...source.supports]});}
 return [...byUrl.values()].sort((a,b)=>a.id.localeCompare(b.id));
}

export function buildKnowledgeGraph(entities,relationships,sources){
 const ids=new Set(entities.map(entity=>entity.id));const sourceIds=new Set(sources.flatMap(source=>[source.id,...source.alias_source_ids]));const errors=[];
 for(const relation of relationships){if(!ids.has(relation.subject_entity_id))errors.push(`${relation.id}: unknown subject`);if(!ids.has(relation.object_entity_id))errors.push(`${relation.id}: unknown object`);if(!RELATIONSHIP_TYPES.has(relation.predicate))errors.push(`${relation.id}: unsupported predicate ${relation.predicate}`);for(const id of relation.source_ids||[])if(!sourceIds.has(id))errors.push(`${relation.id}: unknown source ${id}`);}
 if(errors.length)throw new Error(errors.join('\n'));
 const reciprocal=relationships.flatMap(relation=>{const inverse=INVERSE_RELATIONSHIPS[relation.predicate];return inverse?[{...relation,id:`${relation.id}__inverse`,subject_entity_id:relation.object_entity_id,predicate:inverse,object_entity_id:relation.subject_entity_id,derived_reciprocal:true,source_relationship_id:relation.id}]:[];});
 return {schema_version:RELATIONSHIP_SCHEMA_VERSION,dataset_version:'0.8.1',generated_at:'2026-08-11',sourced_relationship_count:relationships.length,derived_reciprocal_count:reciprocal.length,relationships:[...relationships,...reciprocal]};
}

export function factDisplay(fact){
 if(typeof fact.value==='number'&&fact.currency)return new Intl.NumberFormat('en-US',{style:'currency',currency:fact.currency,maximumFractionDigits:0}).format(fact.value)+(fact.qualifier?` (${fact.qualifier})`:'');
 if(fact.minimum!=null||fact.maximum!=null){const format=value=>fact.currency?new Intl.NumberFormat('en-US',{style:'currency',currency:fact.currency,maximumFractionDigits:0}).format(value):String(value);return `${fact.minimum!=null?format(fact.minimum):'Unknown'}–${fact.maximum!=null?format(fact.maximum):'Unknown'}`;}
 if(typeof fact.value==='number'&&fact.operator)return `${fact.operator} ${fact.value}`;
 return String(fact.value??'Unknown');
}

export function sourceQuality(entities,sources){const primary=sources.filter(source=>source.primary_source);const facts=entities.flatMap(entity=>entity.facts);const primaryIds=new Set(primary.flatMap(source=>[source.id,...source.alias_source_ids]));const primaryFacts=facts.filter(fact=>fact.source_ids.some(id=>primaryIds.has(id)));return {schema_version:SOURCE_SCHEMA_VERSION,total_sources:sources.length,primary_sources:primary.length,primary_source_percentage:sources.length?Number((primary.length/sources.length).toFixed(4)):0,total_sourced_facts:facts.length,facts_supported_by_primary_sources:primaryFacts.length,primary_fact_percentage:facts.length?Number((primaryFacts.length/facts.length).toFixed(4)):0,average_sources_per_entity:entities.length?Number((sources.reduce((n,s)=>n+s.supported_entity_ids.length,0)/entities.length).toFixed(2)):0,facts_per_source:sources.length?Number((facts.length/sources.length).toFixed(2)):0,entities_entirely_secondary:entities.filter(entity=>!entity.sources.some(source=>PRIMARY_CLASSES.has(source.source_class))).map(entity=>entity.id)};}
