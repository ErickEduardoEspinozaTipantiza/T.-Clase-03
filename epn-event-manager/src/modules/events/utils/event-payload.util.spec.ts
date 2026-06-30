import {
  buildCommonEventFields,
  getCurrentIsoTimestamp,
  serializeEventPayload,
} from './event-payload.util';

describe('event-payload.util', () => {
  it('debe serializar payload vacío', () => {
    expect(serializeEventPayload(undefined)).toBe('{}');
  });

  it('debe construir campos comunes del evento', () => {
    const dto = {
      source: 'crud-a',
      entity: 'item',
      action: 'CREATE',
      title: 'Titulo',
      description: 'Desc',
    };

    const fields = buildCommonEventFields(dto, '{"id":1}');

    expect(fields.source).toBe('crud-a');
    expect(fields.payload).toBe('{"id":1}');
  });

  it('debe generar timestamp ISO', () => {
    expect(getCurrentIsoTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
