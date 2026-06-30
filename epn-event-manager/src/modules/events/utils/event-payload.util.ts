import { CreateEventDto } from '../dto/create-event.dto';

export function serializeEventPayload(
  payload?: Record<string, unknown>,
): string {
  return JSON.stringify(payload ?? {});
}

export function buildCommonEventFields(
  dto: CreateEventDto,
  serializedPayload: string,
) {
  return {
    source: dto.source,
    entity: dto.entity,
    action: dto.action,
    title: dto.title,
    description: dto.description,
    payload: serializedPayload,
  };
}

export function getCurrentIsoTimestamp(): string {
  return new Date().toISOString();
}
