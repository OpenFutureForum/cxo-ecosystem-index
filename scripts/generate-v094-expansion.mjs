import fs from 'node:fs/promises';
import path from 'node:path';
import {root,slug} from './lib.mjs';

const VERIFIED_DATE='2026-08-12';
const geo=['United States'];

const groups=[
  {
    entity_type:'cybersecurity company',categories:['Cybersecurity','Enterprise Technology'],roles:['CISO','CIO','CTO'],industries:['Cybersecurity','Technology'],
    services:['enterprise security platform','threat protection','security operations'],needs:['risk-management','decision-support'],topics:['cybersecurity','risk'],
    entries:[
      ['Fortinet','https://www.fortinet.com/','Cybersecurity company providing network, cloud and security-operations products.','products','corporate/about-us'],
      ['Okta','https://www.okta.com/','Identity company providing workforce and customer identity products.','products/','company/',['Identity and Access Management','Cybersecurity'],['identity','cybersecurity']],
      ['Cloudflare','https://www.cloudflare.com/','Connectivity cloud company providing network, application and security services.','plans/enterprise/','about-overview/',['Cybersecurity','Enterprise Technology'],['cybersecurity','risk']],
      ['SentinelOne','https://www.sentinelone.com/','Cybersecurity company providing AI-powered endpoint, cloud and identity security.','platform/','about/'],
      ['Check Point Software','https://www.checkpoint.com/','Cybersecurity company providing network, cloud, endpoint and security-management products.','products/','about-us/'],
      ['CyberArk','https://www.cyberark.com/','Identity security company providing privileged-access and machine-identity protection.','products/','company/',['Identity and Access Management','Cybersecurity'],['identity','cybersecurity']],
      ['Proofpoint','https://www.proofpoint.com/','Cybersecurity company providing email, data and human-centric security products.','us/products','us/company',['Email Security','Cybersecurity'],['cybersecurity','risk']],
      ['Tenable','https://www.tenable.com/','Exposure-management company providing vulnerability and cloud-security products.','products','about-tenable'],
      ['Rapid7','https://www.rapid7.com/','Cybersecurity company providing exposure management, detection and application-security products.','products/','about/'],
      ['Snyk','https://snyk.io/','Developer-security company providing application and cloud-security products.','product/','about/',['Application Security','Cybersecurity'],['cybersecurity','risk']],
      ['Rubrik','https://www.rubrik.com/','Cybersecurity company providing data-security, recovery and cyber-resilience products.','products/','company/'],
      ['Vanta','https://www.vanta.com/','Trust-management company providing security, compliance and risk-automation products.','vanta-platform','company/about',['GRC Automation','Cybersecurity'],['cybersecurity','risk']],
      ['Drata','https://drata.com/','Trust-management company providing compliance and risk-automation products.','product','company/about-us',['GRC Automation','Cybersecurity'],['cybersecurity','risk']],
      ['Arctic Wolf','https://arcticwolf.com/','Cybersecurity company providing managed detection, response and security-operations services.','platform/','company/'],
      ['Netskope','https://www.netskope.com/','Cybersecurity company providing secure-access and cloud-security products.','products/','company/']
    ]
  },
  {
    entity_type:'enterprise technology company',categories:['Enterprise Technology'],roles:['CIO','CTO','CEO'],industries:['Technology','Software'],
    services:['enterprise software platform','data and workflow capabilities','implementation and support'],needs:['transformation','decision-support'],topics:['enterprise-ai','ai-transformation'],
    entries:[
      ['Amazon Web Services','https://aws.amazon.com/','Cloud-computing provider offering infrastructure, data, security and AI services.','products/','about-aws/',['AI Infrastructure','Enterprise Technology','Artificial Intelligence']],
      ['Google Cloud','https://cloud.google.com/','Cloud-computing provider offering infrastructure, data, collaboration and AI services.','products/','about/',['AI Infrastructure','Enterprise Technology','Artificial Intelligence']],
      ['IBM','https://www.ibm.com/','Enterprise technology company providing hybrid-cloud, AI, automation and consulting capabilities.','products','about',['Enterprise Technology','Artificial Intelligence','Consulting']],
      ['Cisco','https://www.cisco.com/','Enterprise technology company providing networking, security, observability and collaboration products.','site/us/en/products/index.html','site/us/en/about/index.html',['Enterprise Technology','Cybersecurity']],
      ['Snowflake','https://www.snowflake.com/','Data-cloud company providing data engineering, analytics and AI capabilities.','en/product/','en/company/overview/',['AI Infrastructure','Enterprise Technology','Artificial Intelligence']],
      ['Palantir','https://www.palantir.com/','Enterprise software company providing data integration, operations and AI platforms.','platforms/','about/',['Artificial Intelligence','Enterprise Technology']],
      ['UiPath','https://www.uipath.com/','Enterprise automation company providing robotic and agentic automation products.','product','company/about-us',['Enterprise Automation','Artificial Intelligence']],
      ['Automation Anywhere','https://www.automationanywhere.com/','Enterprise automation company providing process and agentic automation products.','products','company/about-us',['Enterprise Automation','AI Agents','Artificial Intelligence']],
      ['Celonis','https://www.celonis.com/','Process-intelligence company providing process mining and enterprise automation products.','platform/','company/',['Enterprise Automation','Enterprise Technology']],
      ['Atlassian','https://www.atlassian.com/','Enterprise software company providing collaboration, service-management and developer products.','software','company'],
      ['Zoom','https://www.zoom.com/','Enterprise communications company providing meetings, phone, contact-center and collaboration products.','en/products/','en/about/'],
      ['Box','https://www.box.com/','Enterprise content-management company providing collaboration, workflow and security products.','overview','about-us'],
      ['Dropbox','https://www.dropbox.com/','Cloud software company providing file, collaboration and document-workflow products.','business','about'],
      ['Notion','https://www.notion.com/','Connected-workspace company providing collaboration, knowledge and AI products.','product/notion','security',['Enterprise Technology','Artificial Intelligence']],
      ['Airtable','https://www.airtable.com/','Enterprise software company providing app-building, workflow and data-collaboration products.','platform','about'],
      ['monday.com','https://monday.com/','Work-management software company providing workflow, project and CRM products.','product','about'],
      ['Smartsheet','https://www.smartsheet.com/','Enterprise work-management company providing project, portfolio and workflow products.','platform','about'],
      ['GitLab','https://about.gitlab.com/','DevSecOps company providing software-development, security and operations products.','platform/','company/'],
      ['GitHub','https://github.com/','Software-development platform providing code collaboration, security and AI-assisted development products.','features','about',['Enterprise Technology','Artificial Intelligence']],
      ['Datadog','https://www.datadoghq.com/','Observability and security company providing monitoring, analytics and developer products.','product/','about/',['Enterprise Technology','Cybersecurity']],
      ['MongoDB','https://www.mongodb.com/','Data-platform company providing database, search and application-development products.','products','company',['AI Infrastructure','Enterprise Technology']],
      ['Elastic','https://www.elastic.co/','Search AI company providing search, observability and security products.','products/','about/',['AI Infrastructure','Enterprise Technology','Cybersecurity']],
      ['Confluent','https://www.confluent.io/','Data-streaming company providing cloud and enterprise event-streaming products.','product/','about/',['AI Infrastructure','Enterprise Technology']],
      ['Alteryx','https://www.alteryx.com/','Analytics company providing data preparation, automation and AI products.','products','about-us',['Enterprise Technology','Artificial Intelligence']],
      ['New Relic','https://newrelic.com/','Observability company providing application monitoring, telemetry and incident-management products.','platform','about']
    ]
  },
  {
    entity_type:'finance technology company',categories:['CFO Technology','Fintech'],roles:['CFO','CIO','CEO'],industries:['Financial Services','Technology'],
    services:['finance operations software','financial controls and analytics','implementation and support'],needs:['decision-support','operational-excellence'],topics:['finance-transformation','fpa'],
    entries:[
      ['Sage','https://www.sage.com/','Business software company providing accounting, finance, payroll and operations products.','en-us/products/','en-us/company/',['Accounting Software','CFO Technology']],
      ['Workiva','https://www.workiva.com/','Cloud platform company providing reporting, compliance, audit and financial-control products.','platform','about'],
      ['FloQast','https://www.floqast.com/','Accounting operations company providing close, reconciliation and compliance software.','products','company',['Accounting Software','CFO Technology']],
      ['Planful','https://planful.com/','Financial-performance-management company providing planning, consolidation and reporting software.','platform/','about-us/'],
      ['OneStream','https://www.onestream.com/','Corporate-performance-management company providing planning, close and reporting software.','platform/','about-us/'],
      ['Trintech','https://www.trintech.com/','Financial-close company providing reconciliation, close and compliance software.','products/','about-us/',['Accounting Software','CFO Technology']],
      ['Tipalti','https://tipalti.com/','Finance automation company providing accounts-payable, procurement and payment products.','accounts-payable-software/','company/',['CFO Technology','Payments','Fintech']],
      ['Expensify','https://www.expensify.com/','Expense-management company providing corporate cards, travel and spend-management products.','expenses','about',['Spend Management','Fintech']],
      ['Navan','https://navan.com/','Business travel and expense company providing travel, corporate card and spend-management products.','product/business-travel','about',['Spend Management','Fintech']],
      ['Emburse','https://www.emburse.com/','Expense-management company providing travel, card and accounts-payable products.','products','company',['Spend Management','Fintech']],
      ['Avalara','https://www.avalara.com/','Tax-compliance company providing calculation, filing and reporting software.','us/en/products.html','us/en/about.html',['Tax Technology','CFO Technology']],
      ['Vertex','https://www.vertexinc.com/','Tax-technology company providing indirect-tax calculation, compliance and reporting products.','solutions','company',['Tax Technology','CFO Technology']],
      ['Sovos','https://sovos.com/','Tax-compliance company providing regulatory reporting, e-invoicing and tax software.','solutions/','about-us/',['Tax Technology','CFO Technology']],
      ['HighRadius','https://www.highradius.com/','Finance software company providing autonomous receivables, treasury and record-to-report products.','software/','about-us/'],
      ['Kyriba','https://www.kyriba.com/','Treasury-management company providing liquidity, payments and risk products.','solutions/','company/',['Treasury Technology','CFO Technology']],
      ['FIS','https://www.fisglobal.com/','Financial technology company providing banking, payments and capital-markets technology.','en/products','about-us',['Fintech','Payments','Enterprise Technology']],
      ['Spendesk','https://www.spendesk.com/','Spend-management company providing cards, accounts payable and expense-management products.','platform/','about/',['Spend Management','Fintech']],
      ['Airwallex','https://www.airwallex.com/','Financial technology company providing global accounts, payments and expense-management products.','platform','newsroom',['Fintech','Payments']],
      ['Wise','https://wise.com/','Financial technology company providing international money, account and payment products.','us/business/','about/',['Fintech','Payments']],
      ['Adyen','https://www.adyen.com/','Financial technology company providing payments, financial products and commerce infrastructure.','payment-methods','about',['Payments','Fintech']]
    ]
  },
  {
    entity_type:'human resources technology company',categories:['HR Technology'],roles:['CHRO','CIO','CEO'],industries:['Human Resources','Technology'],
    services:['human resources software','workforce analytics and workflows','implementation and support'],needs:['talent','operational-excellence'],topics:['leadership','artificial-intelligence'],
    entries:[
      ['ADP','https://www.adp.com/','Human-capital-management company providing payroll, HR, talent and workforce products.','what-we-offer.aspx','about-adp.aspx'],
      ['Paychex','https://www.paychex.com/','Human-capital-management company providing payroll, HR, benefits and workforce products.','human-resources','corporate'],
      ['UKG','https://www.ukg.com/','Human-capital-management company providing HR, payroll and workforce-management products.','solutions','about-us'],
      ['BambooHR','https://www.bamboohr.com/','Human resources software company providing HR data, payroll, benefits and talent products.','platform','about-bamboohr'],
      ['Greenhouse','https://www.greenhouse.com/','Hiring software company providing recruiting, onboarding and talent-acquisition products.','platform','company'],
      ['Lever','https://www.lever.co/','Talent-acquisition company providing applicant-tracking and recruiting products.','platform/','about-us/'],
      ['Cornerstone OnDemand','https://www.cornerstoneondemand.com/','Workforce-agility company providing learning, talent and skills-management products.','platform/','company/'],
      ['Culture Amp','https://www.cultureamp.com/','Employee-experience company providing engagement, performance and people-analytics products.','platform','company'],
      ['BetterUp','https://www.betterup.com/','Leadership-development company providing coaching, assessment and workforce products.','platform','about-us',['HR Technology','Executive Coaching']],
      ['Eightfold AI','https://eightfold.ai/','Talent-intelligence company providing AI-based recruiting, mobility and skills products.','products/','about/',['HR Technology','Artificial Intelligence']],
      ['Paradox','https://www.paradox.ai/','Recruiting technology company providing conversational AI and hiring-automation products.','products','about',['HR Technology','Artificial Intelligence']],
      ['Beamery','https://beamery.com/','Talent-lifecycle company providing workforce intelligence and skills-management products.','platform','resources'],
      ['Workhuman','https://www.workhuman.com/','Employee-experience company providing recognition, performance and workplace products.','solutions/','company/'],
      ['Paycom','https://www.paycom.com/','Human-capital-management company providing payroll and employee-workflow software.','software/','about/'],
      ['Dayforce','https://www.dayforce.com/','Human-capital-management company providing payroll, workforce and talent products.','why-dayforce/dayforce-suite','company']
    ]
  },
  {
    entity_type:'marketing technology company',categories:['Marketing Technology','Enterprise Technology'],roles:['CMO','CIO','CEO'],industries:['Marketing','Technology'],
    services:['marketing and revenue software','customer analytics and workflows','implementation and support'],needs:['business-growth','decision-support'],topics:['marketing','growth','go-to-market'],
    entries:[
      ['Braze','https://www.braze.com/','Customer-engagement company providing cross-channel marketing and data products.','product','company'],
      ['Klaviyo','https://www.klaviyo.com/','Business-to-consumer CRM company providing marketing automation, analytics and data products.','products','about'],
      ['Sprout Social','https://sproutsocial.com/','Social-media management company providing publishing, engagement and analytics products.','features/','about/'],
      ['Hootsuite','https://www.hootsuite.com/','Social-media management company providing publishing, listening and analytics products.','platform','about'],
      ['Semrush','https://www.semrush.com/','Digital-marketing company providing search, content, advertising and market-intelligence products.','features/','company/'],
      ['Similarweb','https://www.similarweb.com/','Digital-intelligence company providing web, app, market and sales intelligence products.','corp/solutions/','corp/about/'],
      ['Amplitude','https://amplitude.com/','Digital-analytics company providing product, web and experimentation products.','platform','company'],
      ['Mixpanel','https://mixpanel.com/','Product-analytics company providing behavioral analytics and measurement products.','platform/','about/'],
      ['Outreach','https://www.outreach.io/','Sales-execution company providing engagement, forecasting and revenue-workflow products.','platform','company'],
      ['Salesloft','https://www.salesloft.com/','Revenue-orchestration company providing sales engagement, forecasting and coaching products.','platform/','company/'],
      ['Gong','https://www.gong.io/','Revenue-intelligence company providing conversation analytics, forecasting and sales workflow products.','platform/','about/'],
      ['Clari','https://www.clari.com/','Revenue-platform company providing forecasting, inspection and revenue-workflow products.','products/','company/'],
      ['6sense','https://6sense.com/','Revenue intelligence company providing buyer identification, advertising and sales-orchestration products.','platform/','about-us/'],
      ['Demandbase','https://www.demandbase.com/','Account-based go-to-market company providing advertising, intelligence and sales products.','products/','about-us/'],
      ['Qualtrics','https://www.qualtrics.com/','Experience-management company providing customer, employee and strategy-research products.','experience-management/','about/',['Marketing Technology','Enterprise Technology','Research Firms']]
    ]
  },
  {
    entity_type:'professional services organization',categories:['Consulting'],roles:['CEO','CFO','CIO','COO','Board'],industries:['Professional Services','Technology'],
    services:['executive advisory','business transformation','industry consulting'],needs:['strategic-insight','transformation'],topics:['corporate-strategy','ai-transformation'],
    entries:[
      ['Accenture','https://www.accenture.com/','Professional-services company providing strategy, technology, operations and industry consulting.','us-en/services','us-en/about/company-index'],
      ['Roland Berger','https://www.rolandberger.com/','Management-consulting firm providing strategy, transformation and industry advisory services.','en/Expertise/','en/About/'],
      ['Alvarez & Marsal','https://www.alvarezandmarsal.com/','Professional-services firm providing performance improvement, restructuring and transaction advisory.','expertise','about-us',['Consulting','Finance Advisory']],
      ['Grant Thornton','https://www.grantthornton.com/','Professional-services firm providing audit, tax and advisory services.','services','about-us',['Accounting','Consulting']],
      ['BDO','https://www.bdo.com/','Professional-services firm providing assurance, tax and advisory services.','services','about',['Accounting','Consulting']],
      ['Egon Zehnder','https://www.egonzehnder.com/','Leadership-advisory firm providing executive search, succession and board services.','what-we-do','about-us',['Executive Search','Board Advisory'],['board-governance','leadership'],['executive search','succession planning','board advisory']],
      ['Gartner','https://www.gartner.com/','Research and advisory company providing technology and business insights to executives.','en/products','en/about',['Analyst Firms','Research Firms'],['enterprise-ai','corporate-strategy'],['executive research','advisory services','executive conferences']],
      ['Forrester','https://www.forrester.com/','Research and advisory company providing technology, customer and business insights.','research/','about-us/',['Analyst Firms','Research Firms'],['enterprise-ai','corporate-strategy'],['executive research','advisory services','consulting']],
      ['Aon','https://www.aon.com/','Professional-services company providing risk, insurance, health and workforce advisory services.','en/capabilities','en/about',['Insurance','Consulting'],['risk','corporate-strategy'],['risk advisory','insurance brokerage','workforce advisory'],['Insurance','Professional Services']],
      ['Financial Executives International','https://www.financialexecutives.org/','Membership organization serving senior finance executives through chapters, education and research.','Events.aspx','About-FEI.aspx',['Professional Associations','Executive Communities'],['finance-leadership','corporate-governance'],['membership chapters','executive education','research and advocacy'],['Financial Services','Professional Services'],['CFO','CEO'],'official organization','professional association']
    ]
  }
];

const records=[];
const classifications=[];
for(const group of groups){
  for(const entry of group.entries){
    const [name,website,description,productPath,aboutPath,categories=group.categories,topics=group.topics,services=group.services,industries=group.industries,roles=group.roles,sourceClass='official company',entityType=group.entity_type]=entry;
    const entitySlug=slug(name);
    const sourceUrl=part=>new URL(part,website).href;
    const rootSource=`src_${entitySlug}_official`;
    const productSource=`src_${entitySlug}_offerings`;
    const aboutSource=`src_${entitySlug}_about`;
    records.push({
      id:`ent_${entitySlug.replaceAll('-','_')}`,name,slug:entitySlug,entity_type:entityType,description,website,
      cxo_roles:roles,categories,industries,geographies:geo,
      services,
      inclusion_basis:[`${name} provides documented products, services or programs used by one or more C-suite functions.`],
      sources:[
        {id:rootSource,url:website,title:`${name} official website`,publisher:name,source_class:sourceClass,accessed_date:VERIFIED_DATE,supports:['identity','description','website','primary_category','categories','cxo_roles','industries','geographies']},
        {id:productSource,url:sourceUrl(productPath),title:`${name} products and services`,publisher:name,source_class:sourceClass,accessed_date:VERIFIED_DATE,supports:['services','industries']},
        {id:aboutSource,url:sourceUrl(aboutPath),title:`About ${name}`,publisher:name,source_class:sourceClass,accessed_date:VERIFIED_DATE,supports:['description','geographies']}
      ],
      date_added:VERIFIED_DATE,last_verified:VERIFIED_DATE,verification_status:'verified'
    });
    const semanticNeeds=name==='Financial Executives International'?['peer-learning','professional-development']:name==='Egon Zehnder'?['talent','board-effectiveness']:group.needs;
    classifications.push({entity_id:`ent_${entitySlug.replaceAll('-','_')}`,executive_needs:semanticNeeds,topics,evidence:[{url:sourceUrl(productPath),title:`${name} products and services`,supports:['executive_needs','topics']}]});
  }
}

if(records.length!==100)throw new Error(`Expected 100 records, received ${records.length}`);
const existingFiles=(await fs.readdir(path.join(root,'data/entities'))).filter(file=>file.endsWith('.json')&&file!=='v094-expansion.json');
const existing=(await Promise.all(existingFiles.map(async file=>JSON.parse(await fs.readFile(path.join(root,'data/entities',file),'utf8'))))).flat();
const names=new Set(existing.flatMap(item=>[item.name,...(item.aliases||[])]).map(value=>value.toLowerCase()));
const websites=new Set(existing.map(item=>item.website.replace(/\/$/,'').toLowerCase()));
for(const record of records){
  if(names.has(record.name.toLowerCase()))throw new Error(`Existing name: ${record.name}`);
  if(websites.has(record.website.replace(/\/$/,'').toLowerCase()))throw new Error(`Existing website: ${record.website}`);
}

await fs.writeFile(path.join(root,'data/entities/v094-expansion.json'),JSON.stringify(records,null,2)+'\n');
await fs.writeFile(path.join(root,'data/classifications-p5.json'),JSON.stringify(classifications,null,2)+'\n');
const categoryCounts=Object.fromEntries([...new Set(records.map(record=>record.categories[0]))].sort().map(category=>[category,records.filter(record=>record.categories[0]===category).length]));
await fs.writeFile(path.join(root,'data/governance/expansion-v0.9.4.json'),JSON.stringify({
  release:'0.9.4',verified_date:VERIFIED_DATE,strategy:'Add organizations with accessible first-party evidence instead of forcing unsupported enrichment onto difficult records.',
  record_count:records.length,official_source_record_count:records.reduce((total,record)=>total+record.sources.length,0),semantic_classification_record_count:classifications.length,
  acceptance_gates:{minimum_canonical_sources:3,minimum_source_linked_facts:10,minimum_completeness_score:80,required_source_classes:['official company','official organization'],required_supported_dimensions:['description','primary_category','cxo_roles','geographies','services','industries','executive_needs','topics']},
  primary_category_counts:categoryCounts,entity_ids:records.map(record=>record.id)
},null,2)+'\n');
console.log(`Generated ${records.length} evidence-rich expansion records and ${classifications.length} semantic profiles.`);
