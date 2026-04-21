import { Link, useParams } from "react-router";
import {
  DirtBikeIcon,
  DualSportIcon,
  AtvIcon,
  SxsIcon,
  FourByFourIcon,
  SuvIcon,
} from "../components/VehicleIcons";
import {
  MapPin,
  Star,
  Clock,
  Route,
  Mountain,
  Bike,
  Car,
  Truck,
  Lock,
  ArrowLeft,
  Bookmark,
  Share2,
  Navigation,
  X,
} from "lucide-react";
import { mockTrails } from "../data/mockData";
import type { Trail } from "../types/trail";
import { useEffect, useMemo, useState } from "react";
import { type CompletedTrail } from "../types/completedTrail";
import { type SavedTrail } from "../types/savedTrail";


function getDifficultyStyles(difficulty: Trail["difficulty"]) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/15 text-green-400 border-green-500/20";
    case "Moderate":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    case "Difficult":
      return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    case "Expert":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    default:
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  }
}

const getVehicleIcon = (vehicle: string) => {
  switch (vehicle) {
    case "Motocross":
      return <DirtBikeIcon className="h-6 w-6" />;

    case "Dual-Sport":
      return <DualSportIcon className="h-6 w-6" />;

    case "ATV":
      return <AtvIcon className="h-6 w-6" />;

    case "UTV":
      return <SxsIcon className="h-6 w-6" />;

    case "4x4":
      return <FourByFourIcon className="h-6 w-6" />;

    case "SUV":
      return <SuvIcon className="h-6 w-6" />;

    default:
      return <DirtBikeIcon className="h-6 w-6" />;
  }
};

export function TrailDetail() {
  const { id } = useParams();
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);
  const [savedTrails, setSavedTrails] = useState<SavedTrail[]>([]);
  const [showSendInXtrail, setShowSendInXtrail] = useState(false);
  const [sendTab, setSendTab] = useState<"friends" | "groups">("friends");

  useEffect(() => {
    const storedCompletedTrails = localStorage.getItem("xtrail-completed-trails");

    if (!storedCompletedTrails) {
      setCompletedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedCompletedTrails) as CompletedTrail[];
      setCompletedTrails(parsed);
    } catch (error) {
      console.error("Failed to load completed trails:", error);
      setCompletedTrails([]);
    }
  }, []);

  useEffect(() => {
    const storedSavedTrails = localStorage.getItem("xtrail-saved-trails");

    if (!storedSavedTrails) {
      setSavedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedSavedTrails) as SavedTrail[];
      setSavedTrails(parsed);
    } catch (error) {
      console.error("Failed to load saved trails:", error);
      setSavedTrails([]);
    }
  }, []);

  const trail = mockTrails.find((item) => item.id === id);

  const isTrailCompleted = useMemo(() => {
    if (!trail) return false;

    return completedTrails.some(
      (completedTrail) => completedTrail.trailId === trail.id
    );
  }, [completedTrails, trail]);

  const isTrailSaved = useMemo(() => {
    if (!trail) return false;

    return savedTrails.some((savedTrail) => savedTrail.trailId === trail.id);
  }, [savedTrails, trail]);

  const mockFriends = [
    { id: "friend-1", name: "Liam Carter" },
    { id: "friend-2", name: "Zane Jacobs" },
    { id: "friend-3", name: "Mia Naidoo" },
  ];

  const mockGroups = [
    { id: "group-1", name: "Weekend Riders" },
    { id: "group-2", name: "Cape Dirt Crew" },
  ];

  const handleToggleSaveTrail = () => {
    if (!trail) return;

    try {
      if (isTrailSaved) {
        const updatedSavedTrails = savedTrails.filter(
          (savedTrail) => savedTrail.trailId !== trail.id
        );

        localStorage.setItem(
          "xtrail-saved-trails",
          JSON.stringify(updatedSavedTrails)
        );
        setSavedTrails(updatedSavedTrails);
        return;
      }

      const newSavedTrail: SavedTrail = {
        id: crypto.randomUUID(),
        trailId: trail.id,
        trailName: trail.name,
        trailImageUrl: trail.imageUrl,
        location: trail.location,
        province: trail.province,
        country: trail.country,
        difficulty: trail.difficulty,
        trailType: trail.trailType,
        savedAt: new Date().toISOString(),
      };

      const updatedSavedTrails = [newSavedTrail, ...savedTrails];

      localStorage.setItem(
        "xtrail-saved-trails",
        JSON.stringify(updatedSavedTrails)
      );
      setSavedTrails(updatedSavedTrails);
    } catch (error) {
      console.error("Failed to toggle saved trail:", error);
    }
  };

  const handleShareTrail = async () => {
    if (!trail) return;

    const trailUrl = window.location.href;

    const shareLines = [
      "Check out this trail on Xtrail:",
      "",
      trail.name,
      trail.location ? `Location: ${trail.location}` : null,
      trail.difficulty ? `Difficulty: ${trail.difficulty}` : null,
      trail.trailType ? `Type: ${trail.trailType}` : null,
      "",
      trailUrl,
    ].filter(Boolean);

    const shareText = shareLines.join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: trail.name,
          text: shareText,
          url: trailUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      alert("Trail link copied to clipboard.");
    } catch (error) {
      console.error("Failed to share trail:", error);
      alert("Unable to share trail right now.");
    }
  };

  const handleSendInXtrail = (target: {
    id: string;
    name: string;
    type: "friend" | "group";
  }) => {
    if (!trail) return;

    try {
      const storedNotifications = localStorage.getItem("xtrail-notifications");
      const parsedNotifications = storedNotifications
        ? JSON.parse(storedNotifications)
        : [];

      const newNotification = {
        id: crypto.randomUUID(),
        type: "trail_share",
        recipientType: target.type,
        recipientId: target.id,
        recipientName: target.name,
        trailId: trail.id,
        trailName: trail.name,
        trailImageUrl: trail.imageUrl,
        senderName: "You",
        message:
          target.type === "group"
            ? `You shared ${trail.name} with ${target.name}`
            : `You sent ${trail.name} to ${target.name}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      localStorage.setItem(
        "xtrail-notifications",
        JSON.stringify([newNotification, ...parsedNotifications])
      );

      setShowSendInXtrail(false);
      console.log(`Sent ${trail.name} to ${target.name}`);

    } catch (error) {
      console.error("Failed to send trail in Xtrail:", error);
      alert("Unable to send trail right now.");
    }
  };

  if (!trail) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
            Back to trails
          </Link>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h1 className="text-2xl font-bold">Trail not found</h1>
            <p className="mt-2 text-neutral-400">
              We could not find the trail you were looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-28 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="px-4 pt-4">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to trails
          </Link>
        </div>

        <div className="relative overflow-hidden border-y border-neutral-800 bg-neutral-900 sm:rounded-3xl sm:border">
          <div className="relative h-72 w-full sm:h-96">
            <img
              src={trail.imageUrl}
              alt={trail.name}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${getDifficultyStyles(
                  trail.difficulty
                )}`}
              >
                {trail.difficulty}
              </span>

              {trail.isPremium && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                  Premium
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h1 className="text-3xl font-bold sm:text-4xl">{trail.name}</h1>

              {isTrailCompleted && (
                <div className="mt-3 inline-flex items-center rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Completed
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {trail.location}, {trail.country}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>
                    {trail.rating} ({trail.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral-800/80 p-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Route className="h-4 w-4 text-orange-400" />
                  <span className="text-xs">Distance</span>
                </div>
                <p className="mt-2 text-xl font-bold text-white">
                  {trail.distance} km
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-xs">Duration</span>
                </div>
                <p className="mt-2 text-xl font-bold text-white">
                  {trail.duration} min
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Mountain className="h-4 w-4 text-orange-400" />
                  <span className="text-xs">Elevation</span>
                </div>
                <p className="mt-2 text-xl font-bold text-white">
                  {trail.elevation} ft
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Bike className="h-4 w-4 text-orange-400" />
                  <span className="text-xs">Trail Type</span>
                </div>
                <p className="mt-2 text-xl font-bold text-white">
                  {trail.trailType}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to={`/?startTrail=${trail.id}`}
                className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-black transition hover:bg-orange-400"
              >
                <Navigation className="h-4 w-4" />
                Start Trail
              </Link>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleToggleSaveTrail}
                  className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                    isTrailSaved
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                      : "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  {isTrailSaved ? "Saved" : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSendInXtrail(true)}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  <MapPin className="h-4 w-4" />
                  Send
                </button>

                <button
                  type="button"
                  onClick={handleShareTrail}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="text-lg font-semibold text-white">
                  Trail Overview
                </h2>
                <p className="mt-3 leading-7 text-neutral-300">
                  {trail.description}
                </p>

                <div className="mt-5 border-t border-neutral-800 pt-5">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-200">
                    Location Details
                  </h3>

                  <div className="mt-3 space-y-2 text-sm text-neutral-300">
                    <p>
                      <span className="text-neutral-500">Area:</span>{" "}
                      {trail.location}
                    </p>
                    <p>
                      <span className="text-neutral-500">Province:</span>{" "}
                      {trail.province}
                    </p>
                    <p>
                      <span className="text-neutral-500">Country:</span>{" "}
                      {trail.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Supported Vehicles */}
                <div>
                  <h2 className="text-lg font-semibold text-white">Supported Vehicles</h2>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {trail.vehicleClass.map((vehicle) => (
                      <div
                        key={vehicle}
                        className="flex items-center gap-3 rounded-2xl bg-neutral-800/80 px-4 py-4 text-neutral-200"
                      >
                        <div className="text-orange-400">
                          {getVehicleIcon(vehicle)}
                        </div>
                        <span className="text-sm font-medium">{vehicle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                  <h2 className="text-lg font-semibold text-white">
                    Trail Access
                  </h2>

                  <div className="mt-4 space-y-3 text-sm text-neutral-300">
                    <div className="flex items-start gap-3 py-1">
                      <Lock className="mt-0.5 h-4 w-4 text-neutral-500" />
                      <p>
                        {trail.isPremium
                          ? "Premium trail access required for full route tools."
                          : "Public community trail available in the standard feed."}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 py-1">
                      <MapPin className="mt-0.5 h-4 w-4 text-neutral-500" />
                      <p>
                        This trail is listed in {trail.province}, {trail.country}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {trail.elevationProfile && trail.elevationProfile.length > 0 && (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
                <h2 className="text-lg font-semibold text-white">
                  Elevation Profile
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-neutral-800/80 p-4">
                    <p className="text-xs text-neutral-400">High Point</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {Math.max(...trail.elevationProfile.map((point) => point.elevation))} ft
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-800/80 p-4">
                    <p className="text-xs text-neutral-400">Low Point</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {Math.min(...trail.elevationProfile.map((point) => point.elevation))} ft
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-800/80 p-4">
                    <p className="text-xs text-neutral-400">Route Points</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {trail.elevationProfile.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showSendInXtrail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={() => setShowSendInXtrail(false)}
          >
            <div
              className="flex max-h-[80vh] w-full max-w-[360px] flex-col rounded-[28px] border border-neutral-800 bg-neutral-900 px-4 pb-5 pt-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title row */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-400">
                    Share inside Xtrail
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Send {trail.name}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Choose a friend or group.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSendInXtrail(false)}
                  className="rounded-full border border-neutral-700 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-1">
                <button
                  type="button"
                  onClick={() => setSendTab("friends")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    sendTab === "friends"
                      ? "bg-orange-500 text-black"
                      : "text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  Friends
                </button>

                <button
                  type="button"
                  onClick={() => setSendTab("groups")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    sendTab === "groups"
                      ? "bg-orange-500 text-black"
                      : "text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  Groups
                </button>
              </div>

              <div className="mt-2 flex-1 space-y-3 overflow-y-auto pr-1 pb-1">
                {sendTab === "friends" &&
                  mockFriends.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() =>
                        handleSendInXtrail({
                          id: friend.id,
                          name: friend.name,
                          type: "friend",
                        })
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-left transition hover:bg-neutral-800"
                    >
                      <div>
                        <p className="font-semibold text-white">{friend.name}</p>
                        <p className="text-sm text-neutral-400">Send {trail.name}</p>
                      </div>
                      <span className="text-sm text-orange-400">Send</span>
                    </button>
                  ))}

                {sendTab === "groups" &&
                  mockGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() =>
                        handleSendInXtrail({
                          id: group.id,
                          name: group.name,
                          type: "group",
                        })
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-left transition hover:bg-neutral-800"
                    >
                      <div>
                        <p className="font-semibold text-white">{group.name}</p>
                        <p className="text-sm text-neutral-400">Send {trail.name}</p>
                      </div>
                      <span className="text-sm text-orange-400">Send</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}