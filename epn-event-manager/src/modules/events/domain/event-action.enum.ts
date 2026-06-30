export enum EventAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  QUERY = 'QUERY',
}

export function normalizeEventAction(action: string | undefined): string {
  return (action ?? '').toUpperCase();
}

export function isSupportedEventAction(action: string): action is EventAction {
  return Object.values(EventAction).includes(action as EventAction);
}
