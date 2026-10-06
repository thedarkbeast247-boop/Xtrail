import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Brand } from "../types/brand";
import type { Event as XTrailEvent } from "../types/event";
import type { Promotion } from "../types/promotion";
import type { Track } from "../types/track";

import {
  loadPhase2Content,
  savePhase2Content,
  type Phase2ContentState,
} from "../lib/contentStorage";

type CreateTrackInput = Omit<
  Track,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateTrackInput = Partial<
  Omit<
    Track,
    "id" | "createdAt" | "updatedAt"
  >
>;

type CreateEventInput = Omit<
  XTrailEvent,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateEventInput = Partial<
  Omit<
    XTrailEvent,
    "id" | "createdAt" | "updatedAt"
  >
>;

type CreateBrandInput = Omit<
  Brand,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateBrandInput = Partial<
  Omit<
    Brand,
    "id" | "createdAt" | "updatedAt"
  >
>;

type CreatePromotionInput = Omit<
  Promotion,
  "id" | "createdAt" | "updatedAt"
>;

type UpdatePromotionInput = Partial<
  Omit<
    Promotion,
    "id" | "createdAt" | "updatedAt"
  >
>;

interface Phase2ContentContextValue {
  content: Phase2ContentState;

  tracks: Track[];
  events: XTrailEvent[];
  brands: Brand[];
  promotions: Promotion[];

  addTrack: (
    input: CreateTrackInput
  ) => Track;

  updateTrack: (
    id: string,
    updates: UpdateTrackInput
  ) => void;

  deleteTrack: (
    id: string
  ) => void;

  addEvent: (
    input: CreateEventInput
  ) => XTrailEvent;

  updateEvent: (
    id: string,
    updates: UpdateEventInput
  ) => void;

  deleteEvent: (
    id: string
  ) => void;

  addBrand: (
    input: CreateBrandInput
  ) => Brand;

  updateBrand: (
    id: string,
    updates: UpdateBrandInput
  ) => void;

  deleteBrand: (
    id: string
  ) => void;

  addPromotion: (
    input: CreatePromotionInput
  ) => Promotion;

  updatePromotion: (
    id: string,
    updates: UpdatePromotionInput
  ) => void;

  deletePromotion: (
    id: string
  ) => void;

  getTrackById: (
    id: string
  ) => Track | undefined;

  getEventById: (
    id: string
  ) => XTrailEvent | undefined;

  getBrandById: (
    id: string
  ) => Brand | undefined;

  getPromotionById: (
    id: string
  ) => Promotion | undefined;

  getEventsForTrack: (
    trackId: string
  ) => XTrailEvent[];

  getEventsForTrail: (
    trailId: string
  ) => XTrailEvent[];

  getPromotionsForBrand: (
    brandId: string
  ) => Promotion[];

  getPromotionsForTrack: (
    trackId: string
  ) => Promotion[];

  getPromotionsForTrail: (
    trailId: string
  ) => Promotion[];

  getPromotionsForEvent: (
    eventId: string
  ) => Promotion[];
}

const Phase2ContentContext =
  createContext<
    Phase2ContentContextValue | undefined
  >(undefined);

export function Phase2ContentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [content, setContent] =
    useState<Phase2ContentState>(
      () => loadPhase2Content()
    );

  useEffect(() => {
    savePhase2Content(content);
  }, [content]);

  const value =
    useMemo<Phase2ContentContextValue>(() => {
      const addTrack = (
        input: CreateTrackInput
      ): Track => {
        const timestamp =
          new Date().toISOString();

        const track: Track = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        setContent((previous) => ({
          ...previous,
          tracks: [
            ...previous.tracks,
            track,
          ],
        }));

        return track;
      };

      const updateTrack = (
        id: string,
        updates: UpdateTrackInput
      ) => {
        setContent((previous) => ({
          ...previous,

          tracks: previous.tracks.map(
            (track) =>
              track.id === id
                ? {
                    ...track,
                    ...updates,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : track
          ),
        }));
      };

      const deleteTrack = (
        id: string
      ) => {
        setContent((previous) => ({
          ...previous,

          tracks: previous.tracks.filter(
            (track) => track.id !== id
          ),

          events: previous.events.map(
            (event) => ({
              ...event,
              trackIds:
                event.trackIds.filter(
                  (trackId) =>
                    trackId !== id
                ),
            })
          ),

          promotions:
            previous.promotions.map(
              (promotion) => ({
                ...promotion,
                trackIds:
                  promotion.trackIds.filter(
                    (trackId) =>
                      trackId !== id
                  ),
              })
            ),
        }));
      };

      const addEvent = (
        input: CreateEventInput
      ): XTrailEvent => {
        const timestamp =
          new Date().toISOString();

        const event: XTrailEvent = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        setContent((previous) => ({
          ...previous,
          events: [
            ...previous.events,
            event,
          ],
        }));

        return event;
      };

      const updateEvent = (
        id: string,
        updates: UpdateEventInput
      ) => {
        setContent((previous) => ({
          ...previous,

          events: previous.events.map(
            (event) =>
              event.id === id
                ? {
                    ...event,
                    ...updates,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : event
          ),
        }));
      };

      const deleteEvent = (
        id: string
      ) => {
        setContent((previous) => ({
          ...previous,

          events: previous.events.filter(
            (event) => event.id !== id
          ),

          promotions:
            previous.promotions.map(
              (promotion) => ({
                ...promotion,
                eventIds:
                  promotion.eventIds.filter(
                    (eventId) =>
                      eventId !== id
                  ),
              })
            ),
        }));
      };

      const addBrand = (
        input: CreateBrandInput
      ): Brand => {
        const timestamp =
          new Date().toISOString();

        const brand: Brand = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        setContent((previous) => ({
          ...previous,
          brands: [
            ...previous.brands,
            brand,
          ],
        }));

        return brand;
      };

      const updateBrand = (
        id: string,
        updates: UpdateBrandInput
      ) => {
        setContent((previous) => ({
          ...previous,

          brands: previous.brands.map(
            (brand) =>
              brand.id === id
                ? {
                    ...brand,
                    ...updates,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : brand
          ),
        }));
      };

      const deleteBrand = (
        id: string
      ) => {
        setContent((previous) => ({
          ...previous,

          brands: previous.brands.filter(
            (brand) => brand.id !== id
          ),

          events: previous.events.map(
            (event) => ({
              ...event,
              brandIds:
                event.brandIds.filter(
                  (brandId) =>
                    brandId !== id
                ),
            })
          ),

          promotions:
            previous.promotions.filter(
              (promotion) =>
                promotion.brandId !== id
            ),
        }));
      };

      const addPromotion = (
        input: CreatePromotionInput
      ): Promotion => {
        const timestamp =
          new Date().toISOString();

        const promotion: Promotion = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        setContent((previous) => ({
          ...previous,
          promotions: [
            ...previous.promotions,
            promotion,
          ],
        }));

        return promotion;
      };

      const updatePromotion = (
        id: string,
        updates: UpdatePromotionInput
      ) => {
        setContent((previous) => ({
          ...previous,

          promotions:
            previous.promotions.map(
              (promotion) =>
                promotion.id === id
                  ? {
                      ...promotion,
                      ...updates,
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : promotion
            ),
        }));
      };

      const deletePromotion = (
        id: string
      ) => {
        setContent((previous) => ({
          ...previous,

          promotions:
            previous.promotions.filter(
              (promotion) =>
                promotion.id !== id
            ),
        }));
      };

      return {
        content,

        tracks: content.tracks,
        events: content.events,
        brands: content.brands,
        promotions: content.promotions,

        addTrack,
        updateTrack,
        deleteTrack,

        addEvent,
        updateEvent,
        deleteEvent,

        addBrand,
        updateBrand,
        deleteBrand,

        addPromotion,
        updatePromotion,
        deletePromotion,

        getTrackById: (
          id: string
        ) =>
          content.tracks.find(
            (track) => track.id === id
          ),

        getEventById: (
          id: string
        ) =>
          content.events.find(
            (event) => event.id === id
          ),

        getBrandById: (
          id: string
        ) =>
          content.brands.find(
            (brand) => brand.id === id
          ),

        getPromotionById: (
          id: string
        ) =>
          content.promotions.find(
            (promotion) =>
              promotion.id === id
          ),

        getEventsForTrack: (
          trackId: string
        ) =>
          content.events.filter(
            (event) =>
              event.trackIds.includes(
                trackId
              )
          ),

        getEventsForTrail: (
          trailId: string
        ) =>
          content.events.filter(
            (event) =>
              event.trailIds.includes(
                trailId
              )
          ),

        getPromotionsForBrand: (
          brandId: string
        ) =>
          content.promotions.filter(
            (promotion) =>
              promotion.brandId ===
              brandId
          ),

        getPromotionsForTrack: (
          trackId: string
        ) =>
          content.promotions.filter(
            (promotion) =>
              promotion.trackIds.includes(
                trackId
              )
          ),

        getPromotionsForTrail: (
          trailId: string
        ) =>
          content.promotions.filter(
            (promotion) =>
              promotion.trailIds.includes(
                trailId
              )
          ),

        getPromotionsForEvent: (
          eventId: string
        ) =>
          content.promotions.filter(
            (promotion) =>
              promotion.eventIds.includes(
                eventId
              )
          ),
      };
    }, [content]);

  return (
    <Phase2ContentContext.Provider
      value={value}
    >
      {children}
    </Phase2ContentContext.Provider>
  );
}

export function usePhase2Content() {
  const context = useContext(
    Phase2ContentContext
  );

  if (!context) {
    throw new Error(
      "usePhase2Content must be used inside Phase2ContentProvider"
    );
  }

  return context;
}