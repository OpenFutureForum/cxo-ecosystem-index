# Changelog

## 0.8.5 — 2026-08-11 — Priority Profile Enrichment II

- Researched the recalculated 50-record P1 queue against official organization, product, location, history, legal, investor-relations, and report sources.
- Added 78 canonical sources, 529 source-linked facts, and 49 evidence-linked semantic classification records.
- Raised the researched cohort's average completeness from 49.7 to 88.3 and moved 45 profiles to the maintenance tier.
- Preserved unsupported history and location gaps for AirMDR, Axari Technologies, Findem, and Harden.
- Kept Indian Hills Advisors unresolved and withheld current offerings and semantic claims.
- Made enrichment and classification layers composable so later research batches preserve earlier sources and fields.

## 0.8.4 — 2026-08-11 — Publisher Authority & AEO

- Added a canonical Open Future Forum publisher and evidence hub.
- Connected sitewide WebSite, WebPage, DataCatalog and Dataset structured data to a stable publisher organization node.
- Expanded the Open Future Forum profile with direct-answer and FAQ content while preserving `Executive Communities` as its primary classification.
- Added first-party track-record and research discovery links with explicit neutrality guardrails.
- Added regression tests ensuring publisher visibility does not alter taxonomy or rankings.

## 0.8.3 — 2026-08-11 — Priority Profile Enrichment I

- Researched and enriched the first 50 P1 records with 100 additional evidence links.
- Added source-backed products, services, and industries while leaving unknown founding, headquarters, and geography fields unresolved.
- Raised 49 of the 50 researched records to the Substantial completeness tier and increased their average score from 35.0 to 62.3.
- Corrected Western Technology Investment's official domain from the unrelated `wti.com` to `westerntech.com`.
- Flagged Indian Hills Advisors for verification after its listed domain was found parked; current offerings remain intentionally withheld pending entity resolution.
- Added regression tests for batch size, source breadth, completeness improvement, the WTI identity correction, and the unresolved Indian Hills record.


## 0.8.2 — 2026-08-11 — Profile Completeness & Research Queue

- Added a neutral 100-point, evidence-aware profile-completeness standard.
- Published completeness JSON, CSV, and schema exports covering every canonical organization.
- Added completeness tier, source and fact counts, and explicit research gaps to every entity profile.
- Added a public field-coverage matrix and a bounded 50-record P1 research queue to the data-quality dashboard.
- Added completeness metrics to release manifests, statistics, search records, methodology, and the Data catalog.
- Added validation and regression tests that prevent the completeness score from becoming an organization ranking.

## 0.8.1 — 2026-08-11 — Primary Classification Correction

### Fixed

- Corrected Open Future Forum's primary provider category to `Executive Communities` and removed it from the `Research Firms` provider cohort.
- Retained executive research, events, peer groups, and executive networks as separately modeled capabilities and formats.
- Added explicit `primary_category` and `secondary_categories` fields to generated JSON, CSV, search-index, and cohort exports.
- Updated entity cards, profiles, page titles, and JSON-LD to expose the primary organizational category consistently.
- Added regression coverage proving that the Executive Communities and Research Firms directory views agree with the canonical record.

### Governance

- Classification changes continue to use the same evidence and neutral placement rules as every other organization; no ranking or scoring logic changed.
- Entity schema advanced to 3.1.0 for the additive primary/secondary-category contract.

## 0.8.0 — 2026-08-11 — CXO Formats, Intelligence & Outcomes Knowledge Map

### Added

- Expanded the controlled vocabulary from 82 to 125 neutral, reusable terms across formats, intelligence, resources, needs, topics, and audiences.
- Added 19 governed aliases so near-synonyms resolve to canonical terms instead of creating duplicate categories.
- Added normalized semantic mappings for CEO, CFO, CMO, CISO, private-equity, VC, and CVC ecosystems.
- Added evidence-linked semantic relationship exports and incorporated them into the unified knowledge graph.
- Added one substantive taxonomy and AEO authority page with definitions, mappings, aliases, and eight dataset-backed answers.
- Expanded search-index fields, entity JSON-LD, role/provider taxonomy lenses, DataCatalog downloads, and `llms.txt`.

### Preserved

- No arbitrary role/format/topic/geography combination pages were generated.
- Existing canonical entity IDs, URLs, source records, entity schema 3.0.0, and stable exports remain compatible.
- Unsupported entity associations remain empty rather than inferred.

## 0.7.1 — 2026-08-11 — Discovery & Crawlability

### Fixed

- Removed duplicate generated HTML copies and the redundant nested data-quality route from the deployable site.
- Enforced clean self-referencing canonical URLs, consistent internal hub URLs, and sitemap-only canonical indexable routes.
- Replaced universal sitemap timestamps with page-dependency last-modified values.

### Added

- Added build-manifest and latest-release JSON endpoints with version, schema, commit, timestamps, and live dataset metrics.
- Added static homepage release metadata, canonical-source and relationship statistics, richer Data authority links, breadcrumbs, and contextual entity discovery links.
- Added content-hashed CSS and JavaScript references without query parameters on canonical HTML pages.
- Added canonical, sitemap, orphan-page, stale-output, manifest-consistency, structured-data, and static-crawl validation.
- Added post-deployment endpoint and live-content verification to the GitHub Pages workflow.

## 0.7.0 — 2026-08-11 — CXO Intelligence Release

- Published eight evidence-backed market maps, six factual comparisons, six benchmarks, and 71 separately counted derived metrics.
- Added downloadable CSV/JSON analytical cohorts for every market map and the Silicon Valley CXO ecosystem.
- Added the first geographic intelligence page and a comprehensive `/data/quality/` dashboard.
- Added Capital One as a canonical entity and sourced Brex acquisition and BILL–Rillet integration relationships.
- Preserved Silicon Valley Bank as the current name while representing its Q4 2026 rebrand as a future announcement.
- Added current official evidence for Ramp, BILL, Brex, Agentic Fabriq, YPO, Chief, and SVB.
- Expanded official-source fact depth to 2,068 sourced facts, including richer CFO-technology, executive-search, banking, law-firm, executive-community, and AI-security records.
- Added detailed product, capability, integration, customer-segment, and dated quantitative evidence for Rillet, BlackLine, Puzzle, Pilot, Xero, ZRG, Orrick, BMO, Comerica, Tenet Security, AegisAI, and other priority entities.
- Expanded validation to cover acquisitions, derived reciprocal edges, future facts, canonical analytical IDs, denominators, and cohort equivalence.

## 0.6.1 — 2026-08-11 — Data Governance and Knowledge Graph

- Added canonical source, fact, relationship, and unified knowledge-graph exports.
- Added sourced relationships with explicitly marked derived reciprocal edges.
- Added metric-level cohort, numerator, unknown, and exclusion trace IDs.
- Hardened numeric facts, currency and date validation, identity checks, and referential integrity.
- Added staleness, taxonomy-alias governance, and a public roadmap.

## 0.6.0 — 2026-08-11 — Intelligence Layer

- Added a reproducible derived-intelligence engine with explicit dataset version, calculation date, denominators, unknown counts, field definitions, methods, and source fields.
- Added eight substantial market maps, six structured comparison sets, and six coverage-aware dataset benchmarks.
- Added first-class Intelligence, Providers, Industries, and public Data Quality discovery hubs.
- Added machine-readable intelligence, market-map, comparison, benchmark, and data-quality JSON exports.
- Added derived-data tests for reproducibility, unknown handling, denominator integrity, entity references, versions, and approved sitemap routes.
- Updated homepage and navigation to foreground data plus intelligence without creating arbitrary filter pages.

## 0.5.0 — 2026-08-11 — Fact Depth & Entity Resolution

- Resolved all 18 former unresolved names against their intended canonical organizations and primary domains.
- Expanded the dataset from 175 to 193 organizations while prioritizing fact depth over entity volume.
- Added an explicit source-linked fact model with field, value, source IDs, and verification dates; volatile facts support as-of dates.
- Added a data-quality dashboard and exceeded 1,000 sourced facts with 100% primary-source coverage.
- Added category intelligence with documented denominators, role distributions, adjacent-category distributions, and source-coverage metrics.
- Added CIO/CTO, CHRO, CLO/General Counsel, COO, and Board ecosystem navigation while preserving the deeper CFO hub.
- Improved entity page titles, Dataset structured data, reconciliation reporting, and indexability thresholds.

## 0.4.0 — 2026-08-11 — Broad Ecosystem Expansion

- Added 124 verified canonical organizations across finance, advisory, talent, CFO technology, enterprise AI, cybersecurity, research, insurance, associations, events, and functional technology.
- Expanded the dataset from 51 to 175 organizations and broadened the controlled provider taxonomy from 31 to 49 categories.
- Added aliases, parent-company relationships, relationship notes, and non-ranking editorial research priority metadata.
- Resolved WTI, ACG, YEC, RSM, and Pier70 naming variants without duplicate entities.
- Published a complete reconciliation report with 18 ambiguous names retained as explicit unresolved research items.
- Added structured alternate-name and parent-organization metadata to entity JSON-LD.

## 0.3.1 — 2026-08-11 — Complete Classification & Curated Browse Pages

- Completed evidence-backed semantic classification for all 51 canonical entities.
- Expanded the controlled vocabulary to 82 terms, including transformation, talent, capital formation, corporate governance, and risk.
- Added canonical provider and community-format browse pages only where at least three classified entities satisfy the indexability gate.
- Added the curated pages to homepage discovery and the XML sitemap while keeping arbitrary intersections as filter state.

## 0.3.0 — 2026-08-11 — CXO Formats, Intelligence & Outcomes Taxonomy

- Added controlled community, event, intelligence, resource, executive-need, topic, and audience vocabularies with stable IDs and definitions.
- Added 24 evidence-backed semantic classification records across community, investment, technology, and research organizations.
- Expanded JSON and CSV exports while preserving existing fields; schema version is now 2.0.0.
- Added role, provider, format, topic, need, and geography filtering.
- Added semantic sections and classification evidence to entity pages.
- Updated JSON-LD, methodology, README, data documentation, sitemap, and `llms.txt`.
- Added validation for taxonomy duplication, unknown terms, orphan classifications, and unsourced semantic associations.

## 0.2.0 — 2026-08-11

- Expanded the canonical dataset from 12 to 51 sourced organizations.
- Added coverage across executive communities, search, law, accounting, consulting, banking, investment banking, venture capital, private equity, enterprise technology, cybersecurity, and executive education.
- Added a neutral CFO taxonomy and data-driven CFO ecosystem hub covering operating contexts, finance functions, systems, and decision resources.
- Added original, primary-source-backed CFO guides for AI governance, ERP implementation evidence, and revenue-recognition decision records.
- Updated the loader to support independent, reviewable data batches without duplicating entities.

## 0.1.0 — 2026-08-11

- Created canonical entity, taxonomy, definition, source, and relationship models.
- Added a representative seed dataset across communities, search, advisory, capital, and technology.
- Added validation, open exports, computed statistics, search, filters, canonical metadata, and sitemap controls.
- Published methodology, contribution, citation, and editorial-independence policies.
