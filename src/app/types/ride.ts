export interface RidePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Ride {
  id: string;
  vehicleId: string;

  // Link to a trail if applicable
  trailId?: string;

  date: string;

  durationHours: number;
  distanceKm: number;

  averageSpeed?: number;
  maxSpeed?: number;

  elevationGain?: number;
  highPoint?: number;
  lowPoint?: number;

  notes?: string;

  // GPS path
  route: RidePoint[];
}