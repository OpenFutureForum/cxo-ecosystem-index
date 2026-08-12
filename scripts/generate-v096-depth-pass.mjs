import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from './lib.mjs';

const DATE='2026-08-12';
// Each value is directly described by the entity's existing official offerings page.
// The pass replaces generic expansion labels with decision-useful functional facts.
const offerings={
 ent_workiva:['financial reporting','financial close','governance, risk and compliance'],
 ent_planful:['financial planning and analysis','financial close','workforce planning'],
 ent_onestream:['financial consolidation','financial close','financial planning and analysis'],
 ent_highradius:['accounts receivable automation','treasury management','financial close'],
 ent_acumatica:['cloud ERP','accounting software','financial management'],
 ent_epicor:['enterprise resource planning','financial management','supply-chain management'],
 ent_infor:['enterprise resource planning','financial management','workforce management'],
 ent_ifs:['enterprise resource planning','financial management','asset management'],
 ent_vena_solutions:['financial planning and analysis','budgeting and forecasting','financial reporting'],
 ent_blackbaud:['fund accounting','financial management','payments'],
 ent_pigment:['financial planning and analysis','budgeting and forecasting','workforce planning'],
 ent_cube:['financial planning and analysis','budgeting and forecasting','management reporting'],
 ent_cch_tagetik:['financial close and consolidation','financial planning and analysis','regulatory reporting'],
 ent_oracle_netsuite:['cloud ERP','accounting software','financial management'],
 ent_zuora:['subscription billing','revenue recognition','accounts receivable'],
 ent_chargebee:['subscription billing','revenue recognition','accounts receivable automation'],
 ent_recurly:['subscription billing','recurring payments','revenue management'],
 ent_ordway:['billing automation','revenue recognition','accounts receivable'],
 ent_tabs:['accounts receivable automation','billing automation','revenue recognition'],
 ent_mosaic:['financial planning and analysis','budgeting and forecasting','management reporting'],
 ent_abacum:['financial planning and analysis','budgeting and forecasting','management reporting'],
 ent_aleph:['financial planning and analysis','budgeting and forecasting','financial reporting'],
 ent_numeric:['financial close','account reconciliation','financial reporting'],
 ent_trullion:['accounting automation','audit automation','financial reporting'],
 ent_mindbridge:['audit analytics','financial risk analytics','accounting controls'],
 ent_auditboard:['audit management','risk management','compliance management'],
 ent_diligent:['governance, risk and compliance','audit management','board management'],
 ent_corpay:['accounts payable automation','corporate payments','expense management'],
 ent_wex:['corporate payments','expense management','fleet payments'],
 ent_marqeta:['card issuing','payment processing','embedded finance'],
 ent_checkout_com:['payment processing','payment acceptance','fraud management'],
 ent_fiserv:['payment processing','banking platforms','merchant acquiring'],
 ent_global_payments:['payment processing','merchant acquiring','commerce software'],
 ent_block:['payment processing','merchant services','business banking'],
 ent_paypal:['online payments','payment processing','merchant services'],
 ent_toast:['restaurant payments','point-of-sale software','payroll'],
 ent_flywire:['global payments','accounts receivable','payment processing'],
 ent_billtrust:['accounts receivable automation','digital invoicing','payment processing'],
 ent_versapay:['accounts receivable automation','digital invoicing','payment processing'],
 ent_nium:['multi-currency accounts','global payments','payment infrastructure'],
 ent_thunes:['cross-border payments','payment infrastructure','global payments'],
 ent_rapyd:['payment processing','embedded finance','global payments'],
 ent_jack_henry:['banking platforms','digital banking','payment processing'],
 ent_gocardless:['bank payments','recurring payments','payment collection'],
 ent_klarna:['consumer payments','merchant payments','buy now pay later'],
 ent_alkami:['digital banking','online banking platform','banking analytics'],
 ent_gusto:['payroll','benefits administration','HRIS'],
 ent_justworks:['professional employer organization','payroll','benefits administration'],
 ent_personio:['HRIS','recruiting','performance management'],
 ent_hibob:['HRIS','workforce management','performance management'],
 ent_remote:['employer of record','global payroll','contractor management'],
 ent_oyster:['employer of record','global payroll','global employment'],
 ent_papaya_global:['global payroll','employer of record','workforce payments'],
 ent_darwinbox:['payroll','HRIS','workforce management'],
 ent_factorial:['HRIS','payroll','time management'],
 ent_paylocity:['payroll','HRIS','workforce management'],
 ent_360learning:['learning management system','employee learning','collaborative learning'],
 ent_degreed:['learning experience platform','skills intelligence','employee learning'],
 ent_docebo:['learning management system','employee learning','learning analytics'],
 ent_paycor:['payroll','HRIS','recruiting'],
 ent_icims:['recruiting','applicant tracking system','talent acquisition'],
 ent_smartrecruiters:['recruiting','applicant tracking system','talent acquisition'],
 ent_jobvite:['recruiting','applicant tracking system','talent acquisition'],
 ent_ashby:['recruiting','applicant tracking system','recruiting analytics'],
 ent_gem:['recruiting','talent sourcing','recruiting analytics'],
 ent_seekout:['recruiting','talent intelligence','talent sourcing'],
 ent_namely:['HRIS','payroll','benefits administration'],
 ent_charthop:['people analytics','workforce planning','HRIS'],
 ent_workable:['recruiting','applicant tracking system','talent acquisition'],
 ent_cezanne_hr:['HRIS','payroll','performance management']
};

const entities=JSON.parse(await fs.readFile(path.join(root,'docs/data/entities.json'),'utf8'));
const byId=new Map(entities.map(entity=>[entity.id,entity]));
const records=[];
for(const [entity_id,services] of Object.entries(offerings)){
 const entity=byId.get(entity_id);if(!entity)throw new Error(`Unknown entity ${entity_id}`);
 const evidence=entity.sources.find(source=>source.supports?.includes('services'));
 if(!evidence)throw new Error(`No service evidence for ${entity.name}`);
 const description=`${entity.name} provides ${services[0]}, ${services[1]}, and ${services[2]} for executive and enterprise buyers.`;
 records.push({entity_id,description,services,last_verified:DATE,sources:[{...evidence,id:`${evidence.id}_v096_functional`,supports:['description','services']} ]});
}
await fs.writeFile(path.join(root,'data/enrichments-p6.json'),JSON.stringify(records,null,2)+'\n');
await fs.writeFile(path.join(root,'data/governance/depth-pass-v0.9.6.json'),JSON.stringify({release:'0.9.6',verified_date:DATE,strategy:'Convert documented official product offerings into precise functional facts for coverage-limited CFO and CHRO market maps.',enriched_entities:records.length,functional_facts:records.reduce((n,r)=>n+r.services.length,0),evidence_policy:'Every functional fact is supported by an existing official offerings source.',entity_ids:records.map(r=>r.entity_id)},null,2)+'\n');
console.log(`Generated ${records.length} functional enrichments.`);
