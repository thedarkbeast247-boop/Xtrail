export type RideImage = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  uploadedAt: string;
};

export type SavedRide = {
  id: string;
  trailId?: string;
  trailName: string;
  trailImageUrl?: string;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  finishedAt: string;
  vehicleId?: string;
  vehicleName?: string;
  vehicleType?: string;
  coverImageUrl?: string;
  galleryImages?: RideImage[];
  routePathData?: string;
};

export type RideStats = {
  totalRides: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  averageRideDistanceKm: number;
  averageRideSpeedKmh: number;
};

export function getRideStats(rides: SavedRide[]): RideStats {
  const totalRides = rides.length;

  const totalDurationSeconds = rides.reduce(
    (sum, ride) => sum + ride.durationSeconds,
    0
  );

  const totalDistanceKm = rides.reduce(
    (sum, ride) => sum + ride.distanceKm,
    0
  );

  const totalSpeed = rides.reduce(
    (sum, ride) => sum + ride.avgSpeedKmh,
    0
  );

  const averageRideDistanceKm =
    totalRides > 0 ? totalDistanceKm / totalRides : 0;

  const averageRideSpeedKmh =
    totalRides > 0 ? totalSpeed / totalRides : 0;

  return {
    totalRides,
    totalDurationSeconds,
    totalDistanceKm,
    averageRideDistanceKm,
    averageRideSpeedKmh,
  };
}

export function formatRideDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}