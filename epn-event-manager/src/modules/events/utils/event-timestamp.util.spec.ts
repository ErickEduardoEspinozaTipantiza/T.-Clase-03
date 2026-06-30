import {
  attachTableMetadata,
  sortEventsByTimestamp,
} from './event-timestamp.util';

describe('event-timestamp.util', () => {
  it('debe adjuntar metadatos de tabla y timestamp', () => {
    const record = { id: 1, recorded_at: '2026-06-01T00:00:00.000Z' };

    const result = attachTableMetadata(record, 'create_events', 'recorded_at');

    expect(result._table).toBe('create_events');
    expect(result._timestamp).toBe('2026-06-01T00:00:00.000Z');
  });

  it('debe usar string vacío si el timestamp no es string', () => {
    const record = { id: 1, recorded_at: 123 };

    const result = attachTableMetadata(record, 'create_events', 'recorded_at');

    expect(result._timestamp).toBe('');
  });

  it('debe ordenar eventos por timestamp ascendente', () => {
    const events = [
      { _table: 'a', _timestamp: '2026-06-03T00:00:00.000Z' },
      { _table: 'b', _timestamp: '2026-06-01T00:00:00.000Z' },
    ];

    const sorted = sortEventsByTimestamp(events);

    expect(sorted[0]._timestamp).toBe('2026-06-01T00:00:00.000Z');
  });
});
