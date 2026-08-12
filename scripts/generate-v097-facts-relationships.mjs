import fs from 'node:fs/promises';
import path from 'node:path';
import {root,slug} from './lib.mjs';

const DATE='2026-08-12';
const facts=[
 ['ent_tanium','Tanium','Q28222607',2007,'Emeryville, California, United States'],
 ['ent_trend_micro','Trend Micro','Q700974',1988,'Shinjuku, Tokyo, Japan'],
 ['ent_qualys','Qualys','Q7268802',1999,'Foster City, California, United States'],
 ['ent_barracuda_networks','Barracuda Networks','Q4863194',2003,null],
 ['ent_malwarebytes','Malwarebytes','Q1783235',2006,null],
 ['ent_mimecast','Mimecast','Q16997846',2003,'London, United Kingdom'],
 ['ent_axonius','Axonius','Q134100736',2017,'Tel Aviv, Israel'],
 ['ent_illumio','Illumio','Q19881127',2013,'Sunnyvale, California, United States'],
 ['ent_orca_security','Orca Security','Q108836932',2019,'Tel Aviv, Israel'],
 ['ent_forcepoint','Forcepoint','Q1934027',1994,'San Diego, California, United States'],
 ['ent_sonicwall','SonicWall','Q616855',1991,'Milpitas, California, United States'],
 ['ent_cato_networks','Cato Networks','Q55647697',2015,'Tel Aviv, Israel'],
 ['ent_claroty','Claroty','Q109986619',2015,null],
 ['ent_bigid','BigID','Q106946293',2016,'New York City, New York, United States'],
 ['ent_recorded_future','Recorded Future','Q7302875',2008,'Somerville, Massachusetts, United States'],
 ['ent_entrust','Entrust','Q5380812',null,'Shakopee, Minnesota, United States'],
 ['ent_anthropic','Anthropic','Q116758847',2021,'San Francisco, California, United States'],
 ['ent_cohere','Cohere','Q110363143',2019,'Toronto, Ontario, Canada'],
 ['ent_mistral_ai','Mistral AI','Q119718658',2023,'Paris, France'],
 ['ent_hugging_face','Hugging Face','Q108943604',2016,'Brooklyn, New York, United States'],
 ['ent_cerebras','Cerebras','Q66604886',2016,'San Francisco, California, United States'],
 ['ent_groq','Groq','Q126050137',2016,'Mountain View, California, United States'],
 ['ent_together_ai','Together AI','Q124071418',null,'San Francisco, California, United States'],
 ['ent_akamai','Akamai','Q415598',1998,'Cambridge, Massachusetts, United States']
];
const enrichments=facts.map(([entity_id,name,qid,founded_year,headquarters])=>{
 const sourceId=`src_${slug(name)}_wikidata_v097`;const supports=[...(founded_year?['founded_year']:[]),...(headquarters?['headquarters']:[])];
 const item={entity_id,...(founded_year?{founded_year}:{}),...(headquarters?{headquarters}:{}),last_verified:DATE,sources:[{id:sourceId,url:`https://www.wikidata.org/wiki/${qid}`,title:`${name} structured entity record`,publisher:'Wikidata',source_class:'structured knowledge base',accessed_date:DATE,supports}]};
 item.facts=supports.map(field=>({id:`fact_${slug(name)}_${field}_v097`,field,value:field==='founded_year'?founded_year:headquarters,source_ids:[sourceId],as_of_date:DATE,last_verified:DATE,verification_status:'verified'}));return item;
});
await fs.writeFile(path.join(root,'data/enrichments-p7.json'),JSON.stringify(enrichments,null,2)+'\n');

const additions=[
 ['rel_databricks_integrates_with_hubspot','ent_databricks','integrates_with','ent_hubspot','src_databricks_connectors_2026','Databricks documents a managed HubSpot connector.'],
 ['rel_workday_partner_of_accenture','ent_workday','partner_of','ent_accenture','src_workday_partners_2026','Accenture is listed in the official Workday partner marketplace.'],
 ['rel_workday_partner_of_ibm','ent_workday','partner_of','ent_ibm','src_workday_partners_2026','IBM is listed in the official Workday partner marketplace.'],
 ['rel_nvidia_partner_of_aws','ent_nvidia','partner_of','ent_amazon_web_services','src_nvidia_industry_partners_2026','Amazon Web Services is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_google_cloud','ent_nvidia','partner_of','ent_google_cloud','src_nvidia_industry_partners_2026','Google Cloud is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_dell','ent_nvidia','partner_of','ent_dell_technologies','src_nvidia_industry_partners_2026','Dell Technologies is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_lenovo','ent_nvidia','partner_of','ent_lenovo','src_nvidia_industry_partners_2026','Lenovo is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_supermicro','ent_nvidia','partner_of','ent_supermicro','src_nvidia_industry_partners_2026','Supermicro is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_accenture','ent_nvidia','partner_of','ent_accenture','src_nvidia_industry_partners_2026','Accenture is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_capgemini','ent_nvidia','partner_of','ent_capgemini','src_nvidia_industry_partners_2026','Capgemini is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_deloitte','ent_nvidia','partner_of','ent_deloitte','src_nvidia_industry_partners_2026','Deloitte is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_nvidia_partner_of_ey','ent_nvidia','partner_of','ent_ey','src_nvidia_industry_partners_2026','EY is listed in NVIDIA’s official industrial partner ecosystem.'],
 ['rel_vmware_acquired_by_broadcom','ent_vmware','acquired_by','ent_broadcom','src_vmware_about','VMware is a Broadcom company following Broadcom’s completed acquisition.'],
 ['rel_hashicorp_acquired_by_ibm','ent_hashicorp','acquired_by','ent_ibm','src_hashicorp_about','HashiCorp is an IBM company following IBM’s completed acquisition.'],
 ['rel_red_hat_subsidiary_of_ibm','ent_red_hat','subsidiary_of','ent_ibm','src_red-hat_about','Red Hat operates as an IBM subsidiary.'],
 ['rel_github_subsidiary_of_microsoft','ent_github','subsidiary_of','ent_microsoft','src_github_about','GitHub is a Microsoft subsidiary.'],
 ['rel_netsuite_division_of_oracle','ent_oracle_netsuite','division_of','ent_oracle','src_oracle-netsuite_about','NetSuite operates as an Oracle business unit.'],
 ['rel_paycor_acquired_by_paychex','ent_paycor','acquired_by','ent_paychex','src_paycor_about','Paycor is a Paychex company following the completed acquisition.']
].map(([id,subject_entity_id,predicate,object_entity_id,sourceId,notes])=>({id,subject_entity_id,predicate,object_entity_id,status:'current',valid_from:null,valid_to:null,as_of_date:DATE,verification_status:'verified',confidence:'high',source_ids:[sourceId],notes}));
const relationshipPath=path.join(root,'data/relationships/relationships.json');const current=JSON.parse(await fs.readFile(relationshipPath,'utf8'));const ids=new Set(additions.map(item=>item.id));const merged=[...current.filter(item=>!ids.has(item.id)),...additions];await fs.writeFile(relationshipPath,JSON.stringify(merged,null,2)+'\n');
await fs.writeFile(path.join(root,'data/governance/depth-pass-v0.9.7.json'),JSON.stringify({release:'0.9.7',verified_date:DATE,fact_strategy:'Exact-name plus official-domain entity resolution against Wikidata; ambiguous matches excluded.',fact_depth_entities:enrichments.length,founded_years_added:enrichments.filter(x=>x.founded_year).length,headquarters_added:enrichments.filter(x=>x.headquarters).length,dated_facts_added:enrichments.flatMap(x=>x.facts).length,relationships_added:additions.length,relationship_types:Object.fromEntries(Object.entries(Object.groupBy(additions,x=>x.predicate)).map(([k,v])=>[k,v.length])),entity_ids:enrichments.map(x=>x.entity_id),relationship_ids:additions.map(x=>x.id)},null,2)+'\n');
console.log(`Generated ${enrichments.length} fact enrichments and ${additions.length} relationships.`);
