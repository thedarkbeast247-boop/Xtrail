export type VehicleClass =
  | "ATV"
  | "Motocross"
  | "Dual-Sport"
  | "SUV"
  | "4x4"
  | "UTV";

export type TrailType =
  | "Motocross"
  | "Light Enduro"
  | "Hard Enduro"
  | "Technical Rock"
  | "Sand Dunes"
  | "Forest Trail"
  | "Desert Trail"
  | "Alpine";

export interface Trail {
  id: string;
  name: string;
  vehicleClass: VehicleClass[];
  difficulty: "Easy" | "Moderate" | "Difficult" | "Expert";
  trailType: TrailType;
  distance: number;
  elevation: number;
  duration: number;
  imageUrl: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  isOfflineAvailable?: boolean;
  lat: number;
  lng: number;
    province: string;
  country: string;
  pathData?: string;
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
  elevationProfile?: { distance: number; elevation: number }[];
  popularity?: number;
}