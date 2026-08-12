# CXO Ecosystem Index v0.9.0

## Relationship and Decision Intelligence Release

This release turns the Index from a mostly entity-and-taxonomy directory into a more honest decision-intelligence system. It corrects geography semantics, researches the next priority cohort, expands source-backed organization relationships, and publishes five reproducible decision tools.

### Results

- 194 canonical organizations.
- 3,262 source-linked facts from 439 canonical sources.
- 27 sourced organization relationships plus 27 explicitly derived reciprocal edges.
- 1,917 evidence-linked semantic relationships.
- Five new decision tools covering CFO/private-equity providers, executive-community formats, AI governance and security, venture-backed technology advisors, and Silicon Valley/London operating overlap.
- The researched 50-profile cohort increased from 56.5 to 75.0 average completeness; 9 profiles moved to the maintenance tier.

### Geography correction

The previous expansion loader assigned `United States` when a supplied record did not contain geography data. That default could make an unsupported location appear verified and flow into filters, cohorts, structured data, and the knowledge graph.

Version 0.9.0 removes the default. `geographies` can now be empty, and every generated entity receives `geography_status: verified` only when a source supports `geographies`, `operating_geographies`, or `geographic_scope`; otherwise it receives `geography_status: unknown`. Geographic cohorts now use verified operating-market values only.

### Evidence guardrails

Chameleon Ventures and Paygentic retain their existing identity records but did not receive unsupported offering or location claims. Indian Hills Advisors remains marked `needs verification`. Decision tools disclose their known and unknown populations and do not interpret missing evidence as absence or suitability.

### Architecture

- Entity schema: 3.2.0.
- Derived intelligence schema: 1.3.0.
- New composable `enrichments-p3.json` and `classifications-p3.json` layers.
- New `decision-tools.json` export and five indexable direct-answer pages.
- Relationship records reference source IDs that resolve through the canonical source registry.
