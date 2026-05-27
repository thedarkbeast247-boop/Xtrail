import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Award,
  Bike,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Mountain,
  Route,
  Star,
  Timer,
  UserPlus,
  Users,
} from "lucide-react";

type RiderStatus = "friend" | "requested" | "suggested";

interface RiderProfile {
  id: string;
  name: string;
  avatar: string;
  location: string;
  vehicleType: string;
  ridingStyle: string;
  favoriteTerrain: string;
  totalRides: number;
  completedTrails: number;
  level: number;
  groups: number;
  isOnline: boolean;
  status: RiderStatus;
  bio: string;
}

const mockRiderProfiles: RiderProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    location: "Cape Town",
    vehicleType: "Dual-Sport",
    ridingStyle: "Adventure / Scenic trails",
    favoriteTerrain: "Mountain passes",
    totalRides: 47,
    completedTrails: 18,
    level: 12,
    groups: 3,
    isOnline: true,
    status: "friend",
    bio: "Weekend adventure rider who enjoys scenic routes, gravel passes, and relaxed group rides.",
  },
  {
    id: "2",
    name: "Mike Johnson",
    avatar: "MJ",
    location: "Johannesburg",
    vehicleType: "4x4",
    ridingStyle: "Overlanding / 4x4 routes",
    favoriteTerrain: "Rocky climbs",
    totalRides: 89,
    completedTrails: 32,
    level: 18,
    groups: 4,
    isOnline: true,
    status: "friend",
    bio: "4x4 explorer focused on long routes, camping trips, and technical off-road sections.",
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "EW",
    location: "Durban",
    vehicleType: "ATV",
    ridingStyle: "Trail riding",
    favoriteTerrain: "Forest trails",
    totalRides: 34,
    completedTrails: 12,
    level: 9,
    groups: 2,
    isOnline: false,
    status: "suggested",
    bio: "ATV rider who enjoys forest trails, group rides, and beginner-friendly routes.",
  },
  {
    id: "4",
    name: "David Brown",
    avatar: "DB",
    location: "Pretoria",
    vehicleType: "Motocross",
    ridingStyle: "Enduro / Motocross",
    favoriteTerrain: "Technical climbs",
    totalRides: 112,
    completedTrails: 41,
    level: 22,
    groups: 5,
    isOnline: false,
    status: "requested",
    bio: "Experienced rider focused on technical riding, steep climbs, and faster trail sessions.",
  },
];

const FRIENDS_STORAGE_KEY = "xtrail-friends";

function isRiderStatus(value: unknown): value is RiderStatus {
  return value === "friend" || value === "requested" || value === "suggested";
}

function getStoredRiderStatus(riderId: string | undefined) {
  if (!riderId) return "suggested" as RiderStatus;

  const storedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);

  if (!storedFriends) {
    return (
      mockRiderProfiles.find((rider) => rider.id === riderId)?.status ??
      "suggested"
    );
  }

  try {
    const parsedFriends = JSON.parse(storedFriends) as Array<{
      id: string;
      status?: unknown;
    }>;

    const matchedFriend = parsedFriends.find((friend) => friend.id === riderId);

    if (matchedFriend && isRiderStatus(matchedFriend.status)) {
      return matchedFriend.status;
    }

    return (
      mockRiderProfiles.find((rider) => rider.id === riderId)?.status ??
      "suggested"
    );
  } catch (error) {
    console.error("Failed to load rider status:", error);

    return (
      mockRiderProfiles.find((rider) => rider.id === riderId)?.status ??
      "suggested"
    );
  }
}

function updateStoredRiderStatus(riderId: string, status: RiderStatus) {
  const storedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);

  try {
    const baseFriends = mockRiderProfiles.map((rider) => ({
      id: rider.id,
      name: rider.name,
      avatar: rider.avatar,
      location: rider.location,
      vehicleType: rider.vehicleType,
      totalRides: rider.totalRides,
      level: rider.level,
      isOnline: rider.isOnline,
      status: rider.status,
    }));

    const parsedFriends = storedFriends
      ? (JSON.parse(storedFriends) as Array<{
          id: string;
          status?: RiderStatus;
          [key: string]: unknown;
        }>)
      : baseFriends;

    const nextFriends = parsedFriends.map((friend) =>
      friend.id === riderId
        ? {
            ...friend,
            status,
          }
        : friend
    );

    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(nextFriends));
  } catch (error) {
    console.error("Failed to update rider status:", error);
  }
}

function getStatusLabel(status: RiderStatus) {
  if (status === "friend") return "Friends";
  if (status === "requested") return "Requested";
  return "Add Friend";
}

function getStatusClass(status: RiderStatus) {
  if (status === "friend") {
    return "border-emerald-500/20 bg-emerald-500/15 text-emerald-400";
  }

  if (status === "requested") {
    return "border-orange-500/20 bg-orange-500/15 text-orange-400";
  }

  return "bg-orange-500 text-black hover:bg-orange-400";
}

export function RiderDetail() {
  const { riderId } = useParams();

  const [riderStatus, setRiderStatus] = useState<RiderStatus>(() =>
    getStoredRiderStatus(riderId)
  );

  useEffect(() => {
    setRiderStatus(getStoredRiderStatus(riderId));
  }, [riderId]);

  const rider = mockRiderProfiles.find((item) => item.id === riderId);

  const handleRiderAction = () => {
    if (!riderId) return;

    const nextStatus: RiderStatus =
      riderStatus === "suggested"
        ? "requested"
        : riderStatus === "requested"
        ? "friend"
        : "friend";

    setRiderStatus(nextStatus);
    updateStoredRiderStatus(riderId, nextStatus);
  };

  if (!rider) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6 text-white">
        <Link to="/friends">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
          <p className="text-base font-semibold text-white">Rider not found</p>
          <p className="mt-2 text-sm text-neutral-400">
            This rider profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      {/* Hero */}
      <div className="relative">
        <div className="h-56 w-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-neutral-950" />

        <div className="absolute left-4 top-4 z-10">
          <Link to="/friends">
            <button className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/80">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
        </div>

        <div className="absolute -bottom-16 left-0 w-full px-4">
          <div className="flex items-end gap-4">
            <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-gradient-to-br from-orange-500 to-red-600 text-xl font-bold text-white shadow-lg">
              {rider.avatar}

              {rider.isOnline && (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-neutral-950 bg-emerald-500" />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-2">
              <h1 className="truncate text-2xl font-bold text-white">
                {rider.name}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-neutral-300">
                <MapPin className="h-4 w-4 text-neutral-500" />
                {rider.location}
              </p>
            </div>

            <div className="pb-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                  riderStatus
                )}`}
              >
                {getStatusLabel(riderStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 pb-32 pt-20">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Route className="h-4 w-4" />
              <span className="text-xs font-medium">Rides</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {rider.totalRides}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Trails</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {rider.completedTrails}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">Level</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {rider.level}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Groups</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {rider.groups}
            </p>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">About Rider</h2>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {rider.bio}
          </p>
        </div>

        {/* Riding Profile */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Riding Profile</h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-orange-400">
                <Bike className="h-4 w-4" />
                <p className="text-xs">Vehicle</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {rider.vehicleType}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Mountain className="h-4 w-4" />
                <p className="text-xs">Terrain</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {rider.favoriteTerrain}
              </p>
            </div>

            <div className="col-span-2 rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Star className="h-4 w-4" />
                <p className="text-xs">Style</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {rider.ridingStyle}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Rider Actions</h2>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={handleRiderAction}
              disabled={riderStatus === "friend"}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${getStatusClass(
                riderStatus
              )}`}
            >
              {riderStatus === "friend" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Friends
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {getStatusLabel(riderStatus)}
                </>
              )}
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Message Rider
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Recent Activity</h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                  <Timer className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Completed a weekend ride
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Public activity feed will connect here later.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Added trail progress
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Trail history and public ride stats can show here later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}