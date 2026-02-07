// Metrics Overview types based on API schema

export type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type MetricsOverview = {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  lastSuccessfulImportAt: string | null;
  dateRange: DateRange | null;
};

export type MetricsOverviewResponse = {
  data: MetricsOverview;
};

export type MetricsParams = {
  startDate?: string;
  endDate?: string;
};
