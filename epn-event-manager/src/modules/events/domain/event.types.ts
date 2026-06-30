export interface EventStatsSummary {
  create: number;
  update: number;
  delete: number;
  query: number;
  total: number;
}

export interface MergedEventRecord {
  _table: string;
  _timestamp: string;
  [key: string]: unknown;
}

export interface EventRegistrationResult {
  ok: boolean;
}
