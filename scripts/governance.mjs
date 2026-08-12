export const SCHEMA_VERSION='3.2.0';
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
 return {schema_version:RELATIONSHIP_SCHEMA_VERSION,dataset_version:'0.9.6',generated_at:'2026-08-12',sourced_relationship_count:relationships.length,derived_reciprocal_count:reciprocal.length,relationships:[...relationships,...reciprocal]};
}

export function factDisplay(fact){
 if(typeof fact.value==='number'&&fact.currency)return new Intl.NumberFormat('en-US',{style:'currency',currency:fact.currency,maximumFractionDigits:0}).format(fact.value)+(fact.qualifier?` (${fact.qualifier})`:'');
 if(fact.minimum!=null||fact.maximum!=null){const format=value=>fact.currency?new Intl.NumberFormat('en-US',{style:'currency',currency:fact.currency,maximumFractionDigits:0}).format(value):String(value);return `${fact.minimum!=null?format(fact.minimum):'Unknown'}–${fact.maximum!=null?format(fact.maximum):'Unknown'}`;}
 if(typeof fact.value==='number'&&fact.operator)return `${fact.operator} ${fact.value}`;
 return String(fact.value??'Unknown');
}

export function sourceQuality(entities,sources){const primary=sources.filter(source=>source.primary_source);const facts=entities.flatMap(entity=>entity.facts);const primaryIds=new Set(primary.flatMap(source=>[source.id,...source.alias_source_ids]));const primaryFacts=facts.filter(fact=>fact.source_ids.some(id=>primaryIds.has(id)));return {schema_version:SOURCE_SCHEMA_VERSION,total_sources:sources.length,primary_sources:primary.length,primary_source_percentage:sources.length?Number((primary.length/sources.length).toFixed(4)):0,total_sourced_facts:facts.length,facts_supported_by_primary_sources:primaryFacts.length,primary_fact_percentage:facts.length?Number((primaryFacts.length/facts.length).toFixed(4)):0,average_sources_per_entity:entities.length?Number((sources.reduce((n,s)=>n+s.supported_entity_ids.length,0)/entities.length).toFixed(2)):0,facts_per_source:sources.length?Number((facts.length/sources.length).toFixed(2)):0,entities_entirely_secondary:entities.filter(entity=>!entity.sources.some(source=>PRIMARY_CLASSES.has(source.source_class))).map(entity=>entity.id)};}

const COMPLETENESS_SCHEMA_VERSION='1.0.0';
const populated=value=>Array.isArray(value)?value.length>0:value!==null&&value!==undefined&&value!=='';
const supportedFields=entity=>new Set([...(entity.sources||[]).flatMap(source=>source.supports||[]),...(entity.facts||[]).map(fact=>fact.field)]);
const semanticFields=['community_formats','event_formats','intelligence_types','resource_types','executive_needs','topics','audiences'];

const completenessChecks={
 identity:(entity,fields)=>populated(entity.name)&&populated(entity.description)&&populated(entity.website)&&fields.has('description'),
 classification:(entity,fields)=>populated(entity.primary_category)&&populated(entity.categories)&&(fields.has('primary_category')||fields.has('categories')),
 executive_relevance:(entity,fields)=>populated(entity.cxo_roles)&&fields.has('cxo_roles'),
 inclusion_basis:entity=>populated(entity.inclusion_basis),
 founded_year:(entity,fields)=>Number.isFinite(entity.founded_year)&&fields.has('founded_year'),
 headquarters:(entity,fields)=>populated(entity.headquarters)&&fields.has('headquarters'),
 operating_geography:(entity,fields)=>populated(entity.geographies)&&(fields.has('geographies')||fields.has('operating_geographies')||fields.has('geographic_scope')),
 offerings:(entity,fields)=>['products','services','programs','capabilities'].some(field=>populated(entity[field])&&fields.has(field)),
 industries:(entity,fields)=>populated(entity.industries)&&fields.has('industries'),
 semantic_profile:entity=>semanticFields.some(field=>populated(entity[field])&&(entity.classification_evidence||[]).some(evidence=>(evidence.supports||[]).includes(field))),
 source_breadth:entity=>new Set((entity.sources||[]).map(source=>source.url)).size>=3,
 fact_depth:entity=>(entity.facts||[]).length>=10,
 freshness:(entity,fields,calculatedAt)=>{const verified=Date.parse(entity.last_verified);return fields.size>0&&Number.isFinite(verified)&&Date.parse(calculatedAt)-verified<=365*86400000;}
};

export function buildCompleteness(entities,standard,datasetVersion,calculatedAt){
 const totalWeight=standard.criteria.reduce((sum,criterion)=>sum+criterion.weight,0);
 if(totalWeight!==100)throw new Error(`completeness standard weights total ${totalWeight}, expected 100`);
 const tierFor=score=>standard.tiers.find(tier=>score>=tier.minimum_score)||standard.tiers.at(-1);
 const records=entities.map(entity=>{
  const fields=supportedFields(entity);const results=standard.criteria.map(criterion=>{const check=completenessChecks[criterion.rule];if(!check)throw new Error(`unknown completeness rule ${criterion.rule}`);const complete=Boolean(check(entity,fields,calculatedAt));return {...criterion,complete};});
  const score=results.filter(result=>result.complete).reduce((sum,result)=>sum+result.weight,0);const tier=tierFor(score);
  return {entity_id:entity.id,name:entity.name,slug:entity.slug,primary_category:entity.primary_category,editorial_priority:entity.editorial_priority||null,score,tier:tier.id,tier_label:tier.label,completed_criteria:results.filter(result=>result.complete).map(result=>result.id),missing_criteria:results.filter(result=>!result.complete).map(result=>result.id),source_count:new Set((entity.sources||[]).map(source=>source.url)).size,fact_count:(entity.facts||[]).length,last_verified:entity.last_verified};
 });
 const editorialOrder={A:0,B:1,C:2};const incomplete=records.filter(record=>record.score<80).sort((a,b)=>(editorialOrder[a.editorial_priority]??3)-(editorialOrder[b.editorial_priority]??3)||a.score-b.score||a.fact_count-b.fact_count||a.name.localeCompare(b.name));
 const p1Limit=standard.research_queue?.priority_1_limit||50;const p2Limit=standard.research_queue?.priority_2_limit||50;
 incomplete.forEach((record,index)=>{record.research_priority=index<p1Limit?'P1':index<p1Limit+p2Limit?'P2':'P3'});for(const record of records.filter(record=>record.score>=80))record.research_priority='Maintain';
 const priorityOrder={P1:0,P2:1,P3:2,Maintain:3};records.sort((a,b)=>priorityOrder[a.research_priority]-priorityOrder[b.research_priority]||a.score-b.score||a.name.localeCompare(b.name));
 const scores=records.map(record=>record.score).sort((a,b)=>a-b);const tierCounts=Object.fromEntries(standard.tiers.map(tier=>[tier.id,records.filter(record=>record.tier===tier.id).length]));
 const fieldCoverage=standard.criteria.map(criterion=>{const known=records.filter(record=>record.completed_criteria.includes(criterion.id)).length;return {id:criterion.id,label:criterion.label,weight:criterion.weight,known_count:known,unknown_count:records.length-known,coverage:records.length?Number((known/records.length).toFixed(4)):0};});
 return {dataset_version:datasetVersion,schema_version:COMPLETENESS_SCHEMA_VERSION,calculated_at:calculatedAt,standard,summary:{total_entities:records.length,average_score:records.length?Number((records.reduce((sum,record)=>sum+record.score,0)/records.length).toFixed(1)):0,median_score:scores.length?scores[Math.floor(scores.length/2)]:0,tier_counts:tierCounts,research_priority_counts:Object.fromEntries(Object.keys(priorityOrder).map(priority=>[priority,records.filter(record=>record.research_priority===priority).length]))},field_coverage:fieldCoverage,entities:records};
}
