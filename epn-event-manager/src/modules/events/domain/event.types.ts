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

/**
 * Resultado de registrar un evento.
 * `correlationId` permite rastrear la petición en los logs del servidor.
 */
export interface EventRegistrationResult {
  ok: boolean;
  correlationId: string;
}

/**
 * Filtro opcional de rango de fechas para consultas de eventos.
 * Las fechas deben estar en formato ISO 8601 (ej. 2024-01-15T00:00:00Z).
 */
export interface DateRangeFilter {
  from?: string;
  to?: string;
}
