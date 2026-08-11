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
- Current Release Manifest: `/data/latest.json`, for programmatic discovery, debugging, provenance, and external consumers rather than search-engine recrawl signaling
- Deterministic release fingerprint: SHA-256 over dataset version, schema version, build commit, organization count, sourced-fact count, and canonical-source count
- Sitemap `lastmod`: dependency-derived and omitted when a trustworthy meaningful date is unavailable

## Priority corrections

- Kept one conventional `/sitemap.xml`; no sitemap index, ping endpoint, or claimed Search Console submission was added.
- Removed default `index,follow` robots metadata while retaining clean canonicals and ordinary crawl behavior.
- Added a fingerprinted search-index asset alongside the stable compatibility endpoint.
- Strengthened `DataCatalog`, `Dataset`, and `DataDownload` metadata across core exports and analytical cohorts.
- Added a no-JavaScript static crawl graph from the homepage with representative entity, provider, intelligence, comparison, quality, and data-page assertions.
- Added a generated Search Console handoff with 15 clean priority URLs and explicit `not submitted` status.
- Changed post-deploy verification to compare the production fingerprint with the deployment artifact and fail on mismatch.

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

- 25 tests
- Internal links checked across 279 HTML pages
- Canonical validation: passed
- Orphan-page validation: passed
- Sitemap validation: passed
- Stale-output validation: passed
- Content-hashed asset validation: passed
- Post-deploy endpoint and content verification: included in the Pages workflow
