// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from "vitest";
import {
  parseBusFrame,
  pruneForeignPageMembers,
  resolveMessageRoomId,
  validateGlobalEvent,
  validateHeartbeat,
  validateStateEvent,
  type BusMessage,
} from "./use-tasks-events.validate";

const frame = (data: unknown) => JSON.stringify({ type: "message", data });

describe("parseBusFrame", () => {
  test("ignores invalid json, non-strings and non-objects", () => {
    expect(parseBusFrame("{not json")).toBeNull();
    expect(parseBusFrame(undefined)).toBeNull();
    expect(parseBusFrame("42")).toBeNull();
    expect(parseBusFrame("null")).toBeNull();
    expect(parseBusFrame(frame("text"))).toBeNull();
    expect(parseBusFrame(frame([1]))).toBeNull();
  });

  test("requires a string type", () => {
    expect(parseBusFrame(frame({}))).toBeNull();
    expect(parseBusFrame(frame({ type: 3 }))).toBeNull();
  });

  test("unwraps room bus frames and keeps global frames as-is", () => {
    expect(parseBusFrame(frame({ type: "a" }))).toEqual({ type: "a" });
    expect(parseBusFrame(JSON.stringify({ type: "a" }), false)).toEqual({
      type: "a",
    });
  });
});

describe("validateStateEvent", () => {
  const room = "room1";

  test("emits valid room events for the current room", () => {
    const message: BusMessage = {
      type: "roomUpdated",
      roomId: room,
      payload: { roomId: room },
    };
    expect(validateStateEvent(message, room)).toEqual({ roomId: room });
  });

  test("emits valid page events for the current room", () => {
    for (const type of ["pageCreated", "pageUpdated", "pageThumbnailUpdated"]) {
      const payload = { roomId: room, pageId: "p1" };
      expect(validateStateEvent({ type, roomId: room, payload }, room)).toEqual(
        payload,
      );
    }
  });

  test("resolves pageDeleted room via goToPage.roomId", () => {
    const payload = {
      pageId: "p1",
      goToPage: { roomId: room, pageId: "p0", index: 0 },
    };
    expect(validateStateEvent({ type: "pageDeleted", payload }, room)).toEqual(
      payload,
    );
  });

  test("ignores foreign room events", () => {
    const message: BusMessage = {
      type: "roomDeleted",
      roomId: "other",
      payload: { roomId: "other" },
    };
    expect(validateStateEvent(message, room)).toBeNull();
    expect(
      validateStateEvent(
        {
          type: "pageDeleted",
          roomId: "other",
          payload: {
            pageId: "p1",
            goToPage: { roomId: "other", pageId: "p0" },
          },
        },
        room,
      ),
    ).toBeNull();
  });

  test("ignores events without resolvable or with conflicting room id", () => {
    expect(
      validateStateEvent(
        { type: "pageUpdated", payload: { pageId: "p1" } },
        room,
      ),
    ).toBeNull();
    expect(
      validateStateEvent(
        {
          type: "pageUpdated",
          roomId: room,
          payload: { roomId: "other", pageId: "p1" },
        },
        room,
      ),
    ).toBeNull();
    expect(
      validateStateEvent(
        { type: "roomUpdated", roomId: 7, payload: { roomId: room } },
        room,
      ),
    ).toBeNull();
  });

  test("ignores malformed payloads and unknown types", () => {
    expect(
      validateStateEvent({ type: "roomUpdated", roomId: room }, room),
    ).toBeNull();
    expect(
      validateStateEvent(
        { type: "roomUpdated", roomId: room, payload: "x" },
        room,
      ),
    ).toBeNull();
    expect(
      validateStateEvent(
        { type: "pageCreated", roomId: room, payload: { roomId: room } },
        room,
      ),
    ).toBeNull();
    expect(
      validateStateEvent(
        {
          type: "pageDeleted",
          roomId: room,
          payload: { pageId: "p1", goToPage: null },
        },
        room,
      ),
    ).toBeNull();
    expect(
      validateStateEvent(
        { type: "comment", roomId: room, payload: { roomId: room } },
        room,
      ),
    ).toBeNull();
  });

  test("ignores everything when current room is unknown", () => {
    expect(
      validateStateEvent(
        { type: "roomUpdated", roomId: room, payload: { roomId: room } },
        undefined,
      ),
    ).toBeNull();
  });
});

describe("resolveMessageRoomId", () => {
  test("falls back to payload.roomId", () => {
    expect(resolveMessageRoomId({ type: "x", payload: { roomId: "r" } })).toBe(
      "r",
    );
  });
});

describe("validateGlobalEvent", () => {
  test("accepts well-formed events without room matching", () => {
    expect(
      validateGlobalEvent({ type: "roomUpdated", payload: { roomId: "any" } }),
    ).toEqual({ roomId: "any" });
    expect(
      validateGlobalEvent({
        type: "pageDeleted",
        payload: { pageId: "p", goToPage: { roomId: "r", pageId: "q" } },
      }),
    ).not.toBeNull();
  });

  test("ignores malformed or unknown events", () => {
    expect(validateGlobalEvent({ type: "roomUpdated" })).toBeNull();
    expect(
      validateGlobalEvent({ type: "roomUpdated", payload: { roomId: 1 } }),
    ).toBeNull();
    expect(
      validateGlobalEvent({
        type: "pageUpdated",
        payload: { roomId: "r", pageId: "p" },
      }),
    ).toBeNull();
  });
});

describe("validateHeartbeat", () => {
  const base = {
    type: "client.heartbeat",
    roomId: "room1",
    pageId: "p1",
    clientId: "c1",
  };

  test("accepts valid heartbeat for current room", () => {
    expect(validateHeartbeat(base, "room1")).toEqual({
      roomId: "room1",
      pageId: "p1",
      clientId: "c1",
    });
  });

  test("ignores foreign room and invalid fields", () => {
    expect(validateHeartbeat({ ...base, roomId: "other" }, "room1")).toBeNull();
    expect(validateHeartbeat({ ...base, pageId: 1 }, "room1")).toBeNull();
    expect(validateHeartbeat({ ...base, clientId: "" }, "room1")).toBeNull();
    expect(validateHeartbeat({ type: "client.heartbeat" }, "room1")).toBeNull();
    expect(validateHeartbeat(base, undefined)).toBeNull();
  });
});

describe("pruneForeignPageMembers", () => {
  test("keeps only current room entries", () => {
    const members: Record<string, number> = {
      "room1.p1": 1,
      "room1.p2": 2,
      "other.p1": 3,
      junk: 4,
    };
    pruneForeignPageMembers(members, "room1");
    expect(Object.keys(members).sort()).toEqual(["room1.p1", "room1.p2"]);
  });
});
