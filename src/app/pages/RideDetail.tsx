import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Clock, Map, Hash, Car, Share2, Trash2, Image as ImageIcon, Route } from "lucide-react";
import { Button } from "../components/ui/button";
import { type RideImage, type SavedRide } from "../utils/rideStats";

export function RideDetail() {
  const { rideId } = useParams();
  const [ride, setRide] = useState<SavedRide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    const storedRides = localStorage.getItem("xtrail-saved-rides");

    if (!storedRides) {
      setRide(null);
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedRides) as SavedRide[];
      const foundRide = parsed.find((item) => item.id === rideId) ?? null;
      setRide(foundRide);
    } catch (error) {
      console.error("Failed to load ride details:", error);
      setRide(null);
    } finally {
      setIsLoading(false);
    }
  }, [rideId]);

  const formatRideDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRideTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };

  const handleDeleteRide = () => {
    if (!ride) return;

    const storedRides = localStorage.getItem("xtrail-saved-rides");
    if (!storedRides) return;

    try {
        const parsed = JSON.parse(storedRides) as SavedRide[];
        const updatedRides = parsed.filter((item) => item.id !== ride.id);
        localStorage.setItem("xtrail-saved-rides", JSON.stringify(updatedRides));
        window.location.href = "/ride-history";
    } catch (error) {
        console.error("Failed to delete ride:", error);
    }
    };

    const handleShareRide = async () => {
    if (!ride) return;

    const shareText = `I completed ${ride.trailName} on Xtrail. Distance: ${ride.distanceKm.toFixed(
        2
    )} km, Duration: ${formatRideTime(ride.durationSeconds)}, Avg Speed: ${ride.avgSpeedKmh.toFixed(1)} km/h.`;

    try {
        if (navigator.share) {
        await navigator.share({
            title: `${ride.trailName} Ride`,
            text: shareText,
        });
        } else {
        await navigator.clipboard.writeText(shareText);
        alert("Ride summary copied to clipboard");
        }
    } catch (error) {
        console.error("Failed to share ride:", error);
    }
    };

    const handleUploadRideImages = async (
    event: React.ChangeEvent<HTMLInputElement>
    ) => {
    if (!ride) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const existingImages = ride.galleryImages ?? [];

    if (existingImages.length >= 5) {
        alert("You can only upload up to 5 images per ride.");
        event.target.value = "";
        return;
    }

    const remainingSlots = 5 - existingImages.length;
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    if (selectedFiles.length < files.length) {
        alert(`Only ${remainingSlots} more image(s) can be added to this ride.`);
    }

    setIsUploadingImages(true);

    try {
        const newImages: RideImage[] = selectedFiles.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        thumbnailUrl: URL.createObjectURL(file),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        }));

        const updatedRide: SavedRide = {
        ...ride,
        galleryImages: [...existingImages, ...newImages],
        };

        const storedRides = localStorage.getItem("xtrail-saved-rides");
        if (!storedRides) return;

        const parsed = JSON.parse(storedRides) as SavedRide[];
        const updatedRides = parsed.map((item) =>
        item.id === ride.id ? updatedRide : item
        );

        localStorage.setItem("xtrail-saved-rides", JSON.stringify(updatedRides));
        setRide(updatedRide);
    } catch (error) {
        console.error("Failed to upload ride images:", error);
        alert("Failed to add ride images.");
    } finally {
        setIsUploadingImages(false);
        event.target.value = "";
    }
    };

  if (isLoading) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6 text-neutral-400">
        Loading ride details...
      </div>
    );
  }

  if (!ride) {
    return (
        <div className="min-h-full bg-neutral-950">
            <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
            <div className="flex items-center gap-3">
                <Link to="/ride-history">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-neutral-400 hover:text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                </Link>

                <div>
                <h1 className="text-xl font-semibold text-white">Ride Details</h1>
                <p className="text-sm text-neutral-400">
                    Saved ride could not be found.
                </p>
                </div>
            </div>
            </div>

            <div className="px-4 py-5">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">
                This ride may have been removed or is no longer available.
                </p>

                <Link to="/ride-history" className="mt-4 inline-block">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Back to Ride History
                </Button>
                </Link>
            </div>
            </div>
        </div>
        );
    }

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/ride-history">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-white">Ride Details</h1>
            <p className="text-sm text-neutral-400">
              View saved ride details from Xtrail.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div className="h-52 w-full bg-neutral-800">
            {ride.coverImageUrl ? (
                <img
                src={ride.coverImageUrl}
                alt={ride.trailName}
                className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                No cover image available
                </div>
            )}
            </div>

            <div className="p-5">
            <p className="text-xs uppercase tracking-wide text-emerald-400">
                Saved Ride
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
                {ride.trailName}
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
                Completed on {formatRideDate(ride.finishedAt)}
            </p>
            </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                <p className="text-sm font-medium text-white">Trail Connection</p>
                <p className="mt-1 text-xs text-neutral-400">
                    Open the original trail linked to this ride.
                </p>
                </div>

                {ride.trailId ? (
                <Link to={`/trail/${ride.trailId}`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    View Trail
                    </Button>
                </Link>
                ) : (
                <Button
                    disabled
                    className="bg-neutral-800 text-neutral-500 cursor-not-allowed"
                >
                    No Trail Link
                </Button>
                )}
            </div>
            </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Duration</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
                {formatRideTime(ride.durationSeconds)}
            </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400">
                <Map className="h-4 w-4" />
                <span className="text-xs">Distance</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
                {ride.distanceKm.toFixed(2)} km
            </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Finished</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
                {formatRideDate(ride.finishedAt)}
            </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400">
                <span className="text-xs">Avg Speed</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
                {ride.avgSpeedKmh.toFixed(1)} km/h
            </p>
            </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <Car className="h-4 w-4" />
                Vehicle Used
            </div>

            <p className="mt-2 text-white">
                {ride.vehicleName ?? "Vehicle not linked"}
            </p>

            <p className="mt-1 text-sm text-neutral-400">
                {ride.vehicleType ?? "No vehicle type available"}
            </p>

            <div className="mt-4">
                {ride.vehicleId ? (
                <Link to={`/garage/${ride.vehicleId}`}>
                    <Button className="bg-neutral-800 hover:bg-neutral-700 text-white">
                    View Vehicle
                    </Button>
                </Link>
                ) : (
                <Button
                    disabled
                    className="bg-neutral-800 text-neutral-500 cursor-not-allowed"
                >
                    No Vehicle Link
                </Button>
                )}
            </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <ImageIcon className="h-4 w-4" />
                Ride Gallery
                </div>

                <label className="inline-flex cursor-pointer items-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500">
                {isUploadingImages ? "Uploading..." : "Add Photos"}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUploadRideImages}
                    disabled={isUploadingImages || (ride.galleryImages?.length ?? 0) >= 5}
                />
                </label>
            </div>

            <p className="mt-2 text-xs text-neutral-500">
                Up to 5 images per ride.
            </p>

            {ride.galleryImages && ride.galleryImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                {ride.galleryImages.map((image, index) => (
                    <div
                    key={image.id}
                    className="aspect-square overflow-hidden rounded-xl bg-neutral-800"
                    >
                    <img
                        src={image.thumbnailUrl || image.url}
                        alt={`${ride.trailName} gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                    />
                    </div>
                ))}
                </div>
            ) : (
                <p className="mt-2 text-sm text-neutral-400">
                No extra ride photos added yet.
                </p>
            )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Route className="h-4 w-4" />
            Route Outline
            </div>

            {typeof ride.routePathData === "string" && ride.routePathData.length > 0 ? (
            <div className="mt-4 rounded-2xl bg-neutral-950 p-4">
                <svg
                viewBox="0 0 400 120"
                className="h-36 w-full"
                preserveAspectRatio="none"
                >
                <path
                    d={ride.routePathData}
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                />
                <path
                    d={ride.routePathData}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                </svg>
            </div>
            ) : (
            <p className="mt-2 text-sm text-neutral-400">
                No route outline available for this ride yet.
            </p>
            )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Hash className="h-4 w-4" />
            Ride ID
            </div>
            <p className="mt-2 break-all text-sm text-white">{ride.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button
            type="button"
            onClick={handleShareRide}
            className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
            <Share2 className="h-4 w-4" />
            Share Ride
            </button>

            <button
            type="button"
            onClick={handleDeleteRide}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
            <Trash2 className="h-4 w-4" />
            Delete Ride
            </button>
        </div>
        </div>
    </div>
  );
}