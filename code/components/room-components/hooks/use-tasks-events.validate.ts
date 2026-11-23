// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BusMessage = Record<string, any> & { type: string };

export const STATE_EVENT_TYPES = [
  "roomUpdated",
  "roomDeleted",
  "pageCreated",
  "pageUpdated",
  "pageThumbnailUpdated",
  "pageDeleted",
] as const;

export type StateEventType = (typeof STATE_EVENT_TYPES)[number];

export const GLOBAL_EVENT_TYPES = [
  ...STATE_EVENT_TYPES.filter(
    (type) => type !== "pageUpdated" && type !== "pageThumbnailUpdated",
  ),
  "roomThumbnailUpdated",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/**
 * Parses a raw websocket frame into a bus message.
 * Room bus frames wrap the message in `data` (unwrap = true), global bus
 * frames are the message itself (unwrap = false).
 */
export function parseBusFrame(raw: unknown, unwrap = true): BusMessage | null {
  if (typeof raw !== "string") return null;

  let frame: unknown;
  try {
    frame = JSON.parse(raw);
  } catch {
    return null;
  }

  const message = unwrap && isRecord(frame) ? frame.data : frame;

  if (!isRecord(message) || typeof message.type !== "string") return null;

  return message as BusMessage;
}

function validatePayload(
  type: string,
  payload: Record<string, unknown>,
): boolean {
  switch (type) {
    case "roomUpdated":
    case "roomDeleted":
    case "roomThumbnailUpdated":
      return isNonEmptyString(payload.roomId);
    case "pageCreated":
    case "pageUpdated":
    case "pageThumbnailUpdated":
      return (
        isNonEmptyString(payload.roomId) && isNonEmptyString(payload.pageId)
      );
    case "pageDeleted": {
      const goToPage = payload.goToPage;
      return (
        isNonEmptyString(payload.pageId) &&
        isRecord(goToPage) &&
        isNonEmptyString(goToPage.roomId) &&
        isNonEmptyString(goToPage.pageId)
      );
    }
    default:
      return false;
  }
}

/**
 * Collects every room id the message carries (message.roomId, payload.roomId,
 * payload.goToPage.roomId). Returns null if none is present, if any is not a
 * string, or if they disagree.
 */
export function resolveMessageRoomId(message: BusMessage): string | null {
  const payload = message.payload;
  const candidates: unknown[] = [message.roomId];

  if (isRecord(payload)) {
    candidates.push(payload.roomId);
    if (isRecord(payload.goToPage)) {
      candidates.push(payload.goToPage.roomId);
    }
  }

  const present = candidates.filter((value) => typeof value !== "undefined");

  if (present.length === 0) return null;
  if (!present.every(isNonEmptyString)) return null;
  if (new Set(present).size !== 1) return null;

  return present[0] as string;
}

export function isStateEventType(type: string): type is StateEventType {
  return (STATE_EVENT_TYPES as readonly string[]).includes(type);
}

/**
 * Validates a room bus state-changing event. Returns the payload to emit
 * or null if the event must be ignored.
 */
export function validateStateEvent(
  message: BusMessage,
  currentRoom: string | null | undefined,
): Record<string, unknown> | null {
  if (!isStateEventType(message.type)) return null;
  if (!isNonEmptyString(currentRoom)) return null;
  if (!isRecord(message.payload)) return null;
  if (!validatePayload(message.type, message.payload)) return null;

  const roomId = resolveMessageRoomId(message);
  if (roomId !== currentRoom) return null;

  return message.payload;
}

/**
 * Validates a global bus event (shape only, no room matching).
 */
export function validateGlobalEvent(
  message: BusMessage,
): Record<string, unknown> | null {
  if (!(GLOBAL_EVENT_TYPES as readonly string[]).includes(message.type)) {
    return null;
  }
  if (!isRecord(message.payload)) return null;
  if (!validatePayload(message.type, message.payload)) return null;

  return message.payload;
}

export type Heartbeat = { roomId: string; pageId: string; clientId: string };

export function validateHeartbeat(
  message: BusMessage,
  currentRoom: string | null | undefined,
): Heartbeat | null {
  if (!isNonEmptyString(currentRoom)) return null;
  if (
    !isNonEmptyString(message.roomId) ||
    !isNonEmptyString(message.pageId) ||
    !isNonEmptyString(message.clientId)
  ) {
    return null;
  }
  if (message.roomId !== currentRoom) return null;

  return {
    roomId: message.roomId,
    pageId: message.pageId,
    clientId: message.clientId,
  };
}

/**
 * Drops presence maps that do not belong to the current room.
 */
export function pruneForeignPageMembers<T>(
  pageMembers: Record<string, T>,
  currentRoom: string | null | undefined,
) {
  for (const key of Object.keys(pageMembers)) {
    if (!currentRoom || !key.startsWith(`${currentRoom}.`)) {
      delete pageMembers[key];
    }
  }
}
