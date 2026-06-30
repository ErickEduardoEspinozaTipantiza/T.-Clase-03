import {
  EventAction,
  isSupportedEventAction,
  normalizeEventAction,
} from './event-action.enum';

describe('event-action.enum', () => {
  it('debe normalizar acciones undefined a string vacío', () => {
    expect(normalizeEventAction(undefined)).toBe('');
  });

  it('debe normalizar acciones a mayúsculas', () => {
    expect(normalizeEventAction('create')).toBe('CREATE');
  });

  it('debe reconocer acciones soportadas', () => {
    expect(isSupportedEventAction(EventAction.CREATE)).toBe(true);
    expect(isSupportedEventAction('INVALID')).toBe(false);
  });
});
