import type { VehicleClass } from "./trail";

export type TrackType =
  | "Motocross"
  | "Supercross"
  | "Enduro Track"
  | "Training Track"
  | "Off-road Park"
  | "Other";

export type TrackDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | "Mixed";

export type TrackSurface =
  | "Hard Pack"
  | "Loam"
  | "Sand"
  | "Clay"
  | "Rocky"
  | "Mixed"
  | "Other";

export type TrackDirection =
  | "Clockwise"
  | "Anti-clockwise"
  | "Bidirectional"
  | "Varies"
  | "Not applicable";

export type TrackPublicationStatus =
  | "draft"
  | "published"
  | "archived";

export type TrackRouteSource =
  | "manual"
  | "gpx_import"
  | "community_recording"
  | "official";

export type TrackFacility =
  | "Parking"
  | "Toilets"
  | "Food"
  | "Pits"
  | "Bike Wash"
  | "Workshop"
  | "Spectator Area"
  | "Camping"
  | "Showers"
  | "Fuel"
  | "First Aid"
  | "Other";

export type TrackFeature =
  | "Tabletops"
  | "Doubles"
  | "Triples"
  | "Whoops"
  | "Berms"
  | "Rhythm Section"
  | "Start Gate"
  | "Technical Section"
  | "Sand Section"
  | "Rock Section"
  | "Kids Track"
  | "Practice Loop"
  | "Other";

export interface TrackRoutePoint {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface TrackOperatingHour {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

  isOpen: boolean;

  opensAt?: string;
  closesAt?: string;

  notes?: string;
}

export interface Track {
  id: string;

  name: string;
  description: string;

  trackType: TrackType;

  location: string;
  address?: string;

  province: string;
  country: string;

  lat: number;
  lng: number;

  imageUrl: string;
  galleryImageUrls: string[];

  vehicleClass: VehicleClass[];

  difficulty: TrackDifficulty;
  surface: TrackSurface;

  lengthKm?: number;

  direction: TrackDirection;

  entryFee?: number;
  entryFeeNotes?: string;

  requiresBooking: boolean;
  bookingUrl?: string;

  operatingHours: TrackOperatingHour[];

  phone?: string;
  whatsapp?: string;
  email?: string;

  website?: string;
  instagram?: string;
  facebook?: string;

  facilities: TrackFacility[];
  customFacilities: string[];

  features: TrackFeature[];
  customFeatures: string[];

  rules: string[];

  routePoints: TrackRoutePoint[];
  routeSource?: TrackRouteSource;
  routeUpdatedAt?: string;
  routeContributor?: string;

  rating: number;
  reviewCount: number;

  featured: boolean;

  publicationStatus: TrackPublicationStatus;

  createdAt: string;
  updatedAt: string;
}