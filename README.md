# CXO Ecosystem Index

Open-source intelligence on the companies, communities, capital providers, advisors, technology platforms, and institutions serving the C-suite.

[Live index](https://openfutureforum.github.io/cxo-ecosystem-index/) · [Data downloads](https://openfutureforum.github.io/cxo-ecosystem-index/data.html) · [Methodology](https://openfutureforum.github.io/cxo-ecosystem-index/methodology.html)

<!-- DATASET_STATUS_START -->
## Current dataset

| Measure | Current value |
|---|---:|
| Release | 0.9.5 |
| Entity schema | 3.2.0 |
| Canonical organizations | 500 |
| Sourced facts | 8,338 |
| Canonical sources | 1,496 |
| Sourced relationships | 29 |
| Derived reciprocal relationships | 29 |
| Derived metrics | 80 |
| Tests | 43 |
<!-- DATASET_STATUS_END -->

The build validates canonical records and evidence, generates the sourced knowledge graph and reproducible intelligence, produces CSV/JSON downloads, and renders the static site in `docs/`.

## Deployment source of truth

Production has one deployment path:

```text
main branch
→ .github/workflows/pages.yml
→ npm run check
→ generated docs/ artifact
→ GitHub Pages
```

GitHub Pages uses the workflow deployment mode. The Actions-built `docs/` artifact—not a second Pages branch or query-string URL—is the production source. Generated files are committed for repository inspection, while the workflow rebuilds and validates them from canonical source data before every deployment.

## Data and intelligence

- `data/entities/`: canonical entity records
- `data/enrichments.json`: reviewed source-backed fact depth
- `data/taxonomy/`: controlled classifications
- `data/taxonomy/role-mappings.json`: normalized CXO, private-equity, VC, and CVC semantic lenses
- `data/definitions/`: stable terminology
- `data/relationships/`: sourced relationship records
- `data/governance/completeness-standard.json`: neutral 100-point record-depth standard and bounded research-queue policy
- `data/guides/`: primary-source-backed CFO, CISO, CEO, CHRO, and board decision resources
- `data/exports/`: generated entities, facts, sources, organization and semantic relationships, knowledge graph, taxonomy, role mappings, search index, cohorts, market maps, comparisons, and benchmarks
- `scripts/`: deterministic generation, governance, discovery auditing, and live deployment verification

## What the Index Maps

The CXO Ecosystem Index maps organizations across several independent dimensions:

- executive roles and additional audiences served
- provider type
- ongoing community and membership format
- time-bounded event format
- research and intelligence type
- framework or decision-resource type
- executive need or outcome supported
- leadership priority or topic addressed
- industry and geography

These dimensions separate what an organization is from whom it serves, what it offers, what it publishes, and which documented needs or topics it addresses. Every entity exposes one primary provider category; other provider categories and capabilities remain separate. Multi-category organizations retain one canonical record. Missing values remain unknown rather than being inferred.

The current dataset also publishes evidence-linked semantic edges such as `serves_role`, `offers_event_format`, `publishes_intelligence`, `supports_need`, and `addresses_topic`. Role and audience mappings describe relevant controlled vocabulary; they are not claims that every organization in a cohort offers every mapped format or outcome.

Every organization also receives a public profile-completeness result. The score measures research depth in the Index—not organizational quality or rank—and converts missing evidence into a P1, P2, P3, or maintenance research workflow. Complete results are published as JSON and CSV.

Decision tools and benchmarks require at least 60% evidence coverage for headline placement, answer-engine structured data, and sitemap inclusion. Lower-coverage analyses remain available as transparent research coverage and retain their unknown counts, but are not presented as decision-ready answers.

## Local verification

```bash
npm run check
python3 -m http.server 8080 --directory docs
```

For a deployed release:

```bash
BASE_URL=https://openfutureforum.github.io/cxo-ecosystem-index/ npm run verify:live
```

See [METHODOLOGY.md](METHODOLOGY.md), [CONTRIBUTING.md](CONTRIBUTING.md), [EDITORIAL-INDEPENDENCE.md](EDITORIAL-INDEPENDENCE.md), and [CITATION.cff](CITATION.cff).
