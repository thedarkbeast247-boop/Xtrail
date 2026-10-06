import type { VehicleClass } from "./trail";

export type EventType =
  | "Race"
  | "Practice Day"
  | "Training"
  | "Demo Day"
  | "Community Ride"
  | "Competition"
  | "Festival"
  | "Product Launch"
  | "Meetup"
  | "Other";

export type EventPublicationStatus =
  | "draft"
  | "published"
  | "archived";

export type EventStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Event {
  id: string;

  name: string;
  description: string;

  eventType: EventType;

  startDate: string;
  endDate?: string;

  startTime?: string;
  endTime?: string;

  location: string;
  address?: string;

  province: string;
  country: string;

  lat?: number;
  lng?: number;

  imageUrl: string;
  galleryImageUrls: string[];

  vehicleClass: VehicleClass[];

  entryFee?: number;
  entryFeeNotes?: string;

  registrationRequired: boolean;
  registrationUrl?: string;

  organizerName?: string;
  organizerPhone?: string;
  organizerEmail?: string;
  organizerWebsite?: string;

  trailIds: string[];
  trackIds: string[];

  brandIds: string[];
  groupIds: string[];

  rules: string[];
  requirements: string[];

  featured: boolean;

  eventStatus: EventStatus;
  publicationStatus: EventPublicationStatus;

  createdAt: string;
  updatedAt: string;
}