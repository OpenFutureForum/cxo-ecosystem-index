# CXO Ecosystem Index v0.8.5

## Priority Profile Enrichment II

This release researches the recalculated 50-record P1 queue from v0.8.4 and adds official-source history, headquarters, operating locations, products, services, industries, and evidence-linked semantic classifications.

### Results

- Reviewed all 50 queued profiles against first-party organization, product, location, history, legal, investor-relations, and report pages.
- Added 78 canonical sources and 529 source-linked facts, bringing the dataset to 400 canonical sources and 3,107 facts.
- Added 49 evidence-linked semantic classification records; Indian Hills Advisors remains unclassified while its identity and current operations are unresolved.
- Raised the batch's average completeness from 49.7 to 88.3.
- Moved 45 of the 50 profiles to the 80-point maintenance tier.
- Increased dataset-wide average completeness from 44.1 to 54.0.

### Evidence guardrails

Five records remain in the research queue. AirMDR, Axari Technologies, Findem, and Harden retain specific history or location gaps that their current official pages do not substantiate. Indian Hills Advisors remains marked `needs verification`; no current service, founding, headquarters, geography, industry, or semantic claims were added.

### Architecture

The data loader now composes enrichment and classification layers instead of allowing a later batch to replace earlier researched fields and sources. This preserves prior evidence when an organization appears in multiple research releases.
