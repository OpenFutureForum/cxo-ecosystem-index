# CXO Ecosystem Index v0.8.1 Release Report

## Purpose

This patch corrects Open Future Forum's organizational classification without changing ranking, scoring, inclusion, or commercial-neutrality rules.

## Root cause

The canonical entity record stored both `Executive Communities` and `Research Firms` in the same `categories` array. The build converted every array value into equal provider-filter and directory membership. Because the schema did not expose primary versus secondary category semantics, a documented research capability was rendered as a peer organizational identity.

## Correction

- `primary_category`: `Executive Communities`
- `categories`: `Executive Communities`
- research retained through `intelligence_types`, including executive research, first-party research, surveys, qualitative research, benchmarks, and reports
- events, peer groups, executive forums, executive boards, and networks retained in their existing controlled dimensions

Generated profiles, cards, filters, directories, JSON, CSV, search indexes, cohorts, and JSON-LD now expose the corrected placement. Open Future Forum remains discoverable through Executive Communities and executive-research capability views, but is no longer listed as a Research Firms provider.

## Neutrality

No ranking or scoring methodology changed. The correction applies the same evidence-backed primary-category rule used across the dataset.
