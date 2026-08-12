# Methodology

## Scope

The CXO Ecosystem Index maps organizations that provide documented professional, financial, technological, educational, research, advisory, or community value to senior executives.

## Inclusion

A published entity must have a stable ID, canonical name, type, official website, primary category, concise factual description, relevant CXO classification, geography, inclusion basis, at least one reliable source, verification status, date added, and last verified date.

Submissions do not guarantee inclusion. Sponsorship, advertising, event participation, or any other commercial relationship does not affect inclusion or editorial treatment.

## Sources

Preference order: regulatory and government sources; official company and investor-relations pages; official announcements; reputable media and respected databases. Each source states which fields it supports. Time-sensitive facts require an as-of date.

## Indexes and rankings

Indexes are broad factual collections. Rankings are rare and require published scoring, sources, dates, sample size, limitations, and conflict disclosures. This release contains no rankings.

## Indexability

Entity, CXO, substantial provider/format, taxonomy, methodology, intelligence, and dataset pages are canonical. Arbitrary filter combinations remain application state and are excluded from the sitemap. New landing pages require stable intent, sufficient evidence, and distinct dataset-derived value.

## Semantic classifications

Entities may be classified across roles, provider types, community formats, event formats, intelligence types, resources, executive needs, topics, audiences, and geographies. Classifications use controlled terms with stable IDs and neutral definitions. Similar phrases map to one canonical term unless a durable functional distinction exists.

Multi-category organizations retain one canonical entity record. Every record exposes one primary provider category representing its principal organizational activity. Other material provider categories are secondary. Capabilities such as events, peer groups, research, and publishing remain in their appropriate semantic dimensions and do not displace the primary organizational identity. A classification is assigned only when official organization, event, research, regulatory, government, or reputable third-party evidence shows that it represents a genuine offering, audience, or focus. A passing keyword mention is insufficient.

Community formats describe ongoing structures. Event formats describe time-bounded gatherings. Research types distinguish empirical first-party work from editorial commentary.

Every controlled term has a stable ID, neutral label, and concise definition. Near-synonyms resolve through `data/taxonomy/aliases.json`; they do not create duplicate categories. Role and audience mappings in `data/taxonomy/role-mappings.json` connect executive or investment audiences to relevant vocabulary without asserting that every organization in the audience cohort has every mapped association.

Generated semantic relationships make entity classifications explicit as evidence-linked edges. Organization-to-organization relationships remain a separate relationship class. This prevents a taxonomy association such as `offers_event_format → executive-dinner` from being confused with a corporate relationship such as an acquisition or integration.

## Page generation

The site publishes canonical entity, role, substantial provider, substantial format, intelligence, industry, taxonomy, methodology, and data pages. A taxonomy page is substantive because it contains definitions, aliases, mappings, query answers, and machine-readable links. Arbitrary role/format/topic/geography intersections remain filters and are not added to the sitemap.

## Versioning

Dataset versions identify a published data release. Entity-schema versions change only for entity-record contract changes. Taxonomy changes and aliases are recorded in `data/taxonomy/changelog.json`. Generated manifests expose the deployment commit and deterministic release fingerprint.

## Freshness

Stable facts are reviewed when credible corrections arise. Volatile facts are stored with `as_of_date` and prioritized for periodic review. Git history and releases preserve change history.
