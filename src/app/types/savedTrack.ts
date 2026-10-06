import type { TrackType } from "./track";

export interface SavedTrack {
  id: string;

  trackId: string;
  trackName: string;

  trackImageUrl?: string;

  location?: string;
  province?: string;
  country?: string;

  trackType?: TrackType;

  savedAt: string;
}