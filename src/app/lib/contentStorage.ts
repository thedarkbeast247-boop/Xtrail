import type { Brand } from "../types/brand";
import type { Event as XTrailEvent } from "../types/event";
import type { Promotion } from "../types/promotion";
import type { Track } from "../types/track";

export const PHASE2_CONTENT_KEY =
  "xtrail_phase2_content";

export interface Phase2ContentState {
  version: 1;

  tracks: Track[];
  events: XTrailEvent[];
  brands: Brand[];
  promotions: Promotion[];
}

export function createEmptyPhase2Content(): Phase2ContentState {
  return {
    version: 1,

    tracks: [],
    events: [],
    brands: [],
    promotions: [],
  };
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function loadPhase2Content(): Phase2ContentState {
  try {
    const raw = localStorage.getItem(
      PHASE2_CONTENT_KEY
    );

    if (!raw) {
      return createEmptyPhase2Content();
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      throw new Error(
        "Stored Phase 2 content is not valid."
      );
    }

    return {
      version: 1,

      tracks: Array.isArray(parsed.tracks)
        ? (parsed.tracks as Track[])
        : [],

      events: Array.isArray(parsed.events)
        ? (parsed.events as XTrailEvent[])
        : [],

      brands: Array.isArray(parsed.brands)
        ? (parsed.brands as Brand[])
        : [],

      promotions: Array.isArray(parsed.promotions)
        ? (parsed.promotions as Promotion[])
        : [],
    };
  } catch (error) {
    console.error(
      "Failed to load Phase 2 content:",
      error
    );

    return createEmptyPhase2Content();
  }
}

export function savePhase2Content(
  content: Phase2ContentState
): void {
  try {
    localStorage.setItem(
      PHASE2_CONTENT_KEY,
      JSON.stringify(content)
    );
  } catch (error) {
    console.error(
      "Failed to save Phase 2 content:",
      error
    );
  }
}

export function clearPhase2Content(): void {
  try {
    localStorage.removeItem(
      PHASE2_CONTENT_KEY
    );
  } catch (error) {
    console.error(
      "Failed to clear Phase 2 content:",
      error
    );
  }
}