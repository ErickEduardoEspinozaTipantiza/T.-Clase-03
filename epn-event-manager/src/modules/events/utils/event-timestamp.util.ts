import { MergedEventRecord } from '../domain/event.types';

export function attachTableMetadata<T extends object>(
  record: T,
  tableName: string,
  timestampField: keyof T & string,
): MergedEventRecord {
  const recordAsMap = record as Record<string, unknown>;
  const timestampValue = recordAsMap[timestampField];

  return {
    ...recordAsMap,
    _table: tableName,
    _timestamp: typeof timestampValue === 'string' ? timestampValue : '',
  };
}

export function sortEventsByTimestamp(
  events: MergedEventRecord[],
): MergedEventRecord[] {
  return [...events].sort((firstEvent, secondEvent) =>
    firstEvent._timestamp.localeCompare(secondEvent._timestamp),
  );
}
