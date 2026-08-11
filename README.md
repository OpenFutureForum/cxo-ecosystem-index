# CXO Ecosystem Index

Open-source intelligence on the companies, communities, capital providers, advisors, technology platforms, and institutions serving the C-suite.

[Live index](https://openfutureforum.github.io/cxo-ecosystem-index/) · [Data downloads](https://openfutureforum.github.io/cxo-ecosystem-index/data.html) · [Methodology](https://openfutureforum.github.io/cxo-ecosystem-index/methodology.html)

<!-- DATASET_STATUS_START -->
## Current dataset

| Measure | Current value |
|---|---:|
| Release | 0.7.1 |
| Entity schema | 3.0.0 |
| Canonical organizations | 194 |
| Sourced facts | 2,068 |
| Canonical sources | 222 |
| Sourced relationships | 3 |
| Derived reciprocal relationships | 3 |
| Derived metrics | 72 |
| Tests | 24 |
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
- `data/definitions/`: stable terminology
- `data/relationships/`: sourced relationship records
- `data/exports/`: generated entities, facts, sources, relationships, knowledge graph, search index, cohorts, market maps, comparisons, and benchmarks
- `scripts/`: deterministic generation, governance, discovery auditing, and live deployment verification

The Index maps executive roles, provider types, communities, events, research, decision resources, executive needs, leadership topics, industries, and geographies. Multi-category organizations retain one canonical record. Missing values remain unknown rather than being inferred.

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
