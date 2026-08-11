# CXO Ecosystem Index v0.7.1 Release Report

## Deployment architecture

- Source branch: `main`
- Deployment workflow: `.github/workflows/pages.yml`
- Build command: `npm run check`
- Published artifact: generated `docs/`
- Pages mode: GitHub Actions workflow
- Canonical production URL: <https://openfutureforum.github.io/cxo-ecosystem-index/>
- Pre-release deployed commit audited: `036816e34b5fc791df34f1b8137b27bed4a6a1bd`
- Release deployment commit: recorded dynamically in `/data/build-manifest.json`

## Discovery and canonicalization

- 279 indexable canonical HTML pages
- 279 sitemap URLs
- 0 query-string canonicals
- 0 duplicate or missing canonicals after remediation
- 0 orphan indexable pages
- 0 broken internal links
- 0 pages missing titles, descriptions, or structured data

The audit identified and fixed canonical-path mismatches for Wilson Sonsini and Stanford GSB, removed the redundant `/data/quality/` HTML route, and removed duplicate generated `… 2.html` and `… 3.html` copies. Original canonical pages were preserved.

## Freshness and provenance

- Dataset version: 0.7.1
- Entity schema version: 3.0.0
- Last dataset update: 2026-08-11
- Build commit: resolved from `GITHUB_SHA` for the deployed artifact
- Build manifest: `/data/build-manifest.json`
- Latest-release endpoint: `/data/latest.json`
- Sitemap `lastmod`: derived from entity verification dates, guide update dates, or current dataset dependencies

## Dataset consistency

- Canonical organizations: 194
- Sourced facts: 2,068
- Canonical sources: 222
- Verified entities: 192
- Sourced relationships: 3
- Derived reciprocal relationships: 3
- Derived metrics: 72

Homepage, Data page, README status block, build manifest, latest endpoint, and generated exports are checked against the same build values.

## Validation

- 24 tests
- Internal links checked across 279 HTML pages
- Canonical validation: passed
- Orphan-page validation: passed
- Sitemap validation: passed
- Stale-output validation: passed
- Content-hashed asset validation: passed
- Post-deploy endpoint and content verification: included in the Pages workflow
