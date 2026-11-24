// Publication issues the API sets on each product (src/modules/catalog in the API)
export const PUBLICATION_ISSUES = [
  'not_in_source',
  'inactive',
  'not_catalog_supplier',
  'no_photo',
  'no_price',
  'price_outdated',
  'duplicate',
  'name_incomplete',
  'no_rubro',
  'outside_batch',
] as const;
export type PublicationIssue = (typeof PUBLICATION_ISSUES)[number];

export type PublicationStatus = 'published' | 'pending';

// Result of one catalogue evaluation
export type EvaluationSummary = {
  published: number;
  pending: number;
  newlyPublished: number;
  newlyPending: number;
  issues: Record<PublicationIssue, number>;
};

// GET /api/catalog/summary
export type CatalogSummary = {
  published: number;
  pending: number;
  issues: Record<PublicationIssue, number>;
  lastCheckedAt: string | null;
};
