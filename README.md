# CXO Ecosystem Index

Open-source intelligence on the companies, communities, capital providers, advisors, technology platforms, and institutions serving the C-suite.

The repository is the canonical data, methodology, and version-control layer. The generated GitHub Pages site is the public discovery layer.

## Principles

1. Data first. Intelligence second. Content third.
2. One canonical record per entity.
3. Important facts are traceable to evidence.
4. Unknown values are omitted, never invented.
5. Inclusion is editorial, neutral, and never sold.

## Local use

```bash
npm run check
python3 -m http.server 8080 --directory docs
```

The build validates canonical records, generates statistics and CSV/JSON exports, and renders the static site in `docs/`.

## Data model

- `data/entities/`: canonical entity records
- `data/taxonomy/`: controlled classifications
- `data/definitions/`: stable terminology
- `data/relationships/`: sourced entity relationships
- `data/exports/`: generated open datasets
- `scripts/`: validation and deterministic site generation

See [METHODOLOGY.md](METHODOLOGY.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [EDITORIAL-INDEPENDENCE.md](EDITORIAL-INDEPENDENCE.md).
