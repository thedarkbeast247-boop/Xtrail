import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Edit3,
  Flag,
  MapPinned,
  Megaphone,
  Plus,
  Route,
  ShieldAlert,
  Store,
  Trash2,
} from "lucide-react";

import { Link } from "react-router";

import { Button } from "../components/ui/button";

import { TrackEditorDialog } from "../components/content/admin/TrackEditorDialog";
import { EventEditorDialog } from "../components/content/admin/EventEditorDialog";
import { BrandEditorDialog } from "../components/content/admin/BrandEditorDialog";
import { PromotionEditorDialog } from "../components/content/admin/PromotionEditorDialog";

import { useNotification } from "../context/NotificationContext";
import { usePhase2Content } from "../context/Phase2ContentContext";
import { useUserAccess } from "../context/UserAccessContext";

import { isGlobalAdmin } from "../lib/accessControl";

import type { Track } from "../types/track";
import type { Event as XTrailEvent } from "../types/event";
import type { Brand } from "../types/brand";
import type { Promotion } from "../types/promotion";

type Tab =
  | "tracks"
  | "events"
  | "brands"
  | "promotions";

export function OwnerContent() {
  const {
    currentUserAccess,
  } = useUserAccess();

  const {
    tracks,
    events,
    brands,
    promotions,

    deleteTrack,
    deleteEvent,
    deleteBrand,
    deletePromotion,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const [tab, setTab] =
    useState<Tab>("tracks");

  const [
    trackEditorOpen,
    setTrackEditorOpen,
  ] = useState(false);

  const [
    eventEditorOpen,
    setEventEditorOpen,
  ] = useState(false);

  const [
    brandEditorOpen,
    setBrandEditorOpen,
  ] = useState(false);

  const [
    promotionEditorOpen,
    setPromotionEditorOpen,
  ] = useState(false);

  const [
    editingTrack,
    setEditingTrack,
  ] =
    useState<Track | null>(
      null
    );

  const [
    editingEvent,
    setEditingEvent,
  ] =
    useState<XTrailEvent | null>(
      null
    );

  const [
    editingBrand,
    setEditingBrand,
  ] =
    useState<Brand | null>(
      null
    );

  const [
    editingPromotion,
    setEditingPromotion,
  ] =
    useState<Promotion | null>(
      null
    );

  const stats = useMemo(
    () => ({
      tracks:
        tracks.length,
      publishedTracks:
        tracks.filter(
          (item) =>
            item.publicationStatus ===
            "published"
        ).length,

      events:
        events.length,
      publishedEvents:
        events.filter(
          (item) =>
            item.publicationStatus ===
            "published"
        ).length,

      brands:
        brands.length,
      publishedBrands:
        brands.filter(
          (item) =>
            item.publicationStatus ===
            "published"
        ).length,

      promotions:
        promotions.length,
      activePromotions:
        promotions.filter(
          (item) =>
            item.status ===
              "active" ||
            item.status ===
              "scheduled"
        ).length,
    }),
    [
      tracks,
      events,
      brands,
      promotions,
    ]
  );

  if (
    !isGlobalAdmin(
      currentUserAccess
    )
  ) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6 text-white">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <ShieldAlert className="h-8 w-8 text-red-400" />

          <h1 className="mt-4 text-xl font-bold">
            Owner access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-300">
            XTrail content management is
            restricted to the Global
            Admin / Owner account.
          </p>

          <Link to="/profile">
            <Button className="mt-5">
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const confirmDelete = (
    type:
      | "track"
      | "event"
      | "brand"
      | "promotion",
    id: string,
    name: string
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${name}"?\n\nThis cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    if (type === "track") {
      deleteTrack(id);
    }

    if (type === "event") {
      deleteEvent(id);
    }

    if (type === "brand") {
      deleteBrand(id);
    }

    if (
      type === "promotion"
    ) {
      deletePromotion(id);
    }

    showNotification({
      title:
        "Content deleted",
      message:
        `${name} was removed.`,
      variant: "info",
    });
  };

  const openNew = () => {
    if (tab === "tracks") {
      setEditingTrack(null);
      setTrackEditorOpen(
        true
      );

      return;
    }

    if (tab === "events") {
      setEditingEvent(null);
      setEventEditorOpen(
        true
      );

      return;
    }

    if (tab === "brands") {
      setEditingBrand(null);
      setBrandEditorOpen(
        true
      );

      return;
    }

    setEditingPromotion(null);
    setPromotionEditorOpen(
      true
    );
  };

  return (
    <div className="min-h-full bg-neutral-950 pb-32 text-white">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-5">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Profile
        </Link>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              XTrail Owner
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Content Manager
            </h1>

            <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-400">
              Create and manage Tracks,
              Events, Brands and
              commercial Promotions.
            </p>
          </div>

          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
            <Flag className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 px-4 py-5">
        <StatCard
          icon={
            <MapPinned className="h-4 w-4" />
          }
          label="Tracks"
          value={stats.tracks}
          detail={`${stats.publishedTracks} published`}
        />

        <StatCard
          icon={
            <Calendar className="h-4 w-4" />
          }
          label="Events"
          value={stats.events}
          detail={`${stats.publishedEvents} published`}
        />

        <StatCard
          icon={
            <Store className="h-4 w-4" />
          }
          label="Brands"
          value={stats.brands}
          detail={`${stats.publishedBrands} published`}
        />

        <StatCard
          icon={
            <Megaphone className="h-4 w-4" />
          }
          label="Promotions"
          value={
            stats.promotions
          }
          detail={`${stats.activePromotions} live/scheduled`}
        />
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-neutral-800 bg-neutral-900 p-1">
          <TabButton
            active={
              tab === "tracks"
            }
            onClick={() =>
              setTab("tracks")
            }
            label="Tracks"
          />

          <TabButton
            active={
              tab === "events"
            }
            onClick={() =>
              setTab("events")
            }
            label="Events"
          />

          <TabButton
            active={
              tab === "brands"
            }
            onClick={() =>
              setTab("brands")
            }
            label="Brands"
          />

          <TabButton
            active={
              tab ===
              "promotions"
            }
            onClick={() =>
              setTab(
                "promotions"
              )
            }
            label="Promo"
          />
        </div>

        <Button
          type="button"
          onClick={openNew}
          className="mt-4 w-full gap-2 bg-orange-500 text-black hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" />

          {tab === "tracks"
            ? "Add Track"
            : tab === "events"
            ? "Add Event"
            : tab === "brands"
            ? "Add Brand"
            : "Add Promotion"}
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3 px-4 pt-5">
        {tab === "tracks" &&
          (tracks.length === 0 ? (
            <EmptyState
              title="No tracks yet"
              message="Add your first motocross, supercross or off-road track."
            />
          ) : (
            tracks.map(
              (track) => (
                <ContentRow
                  key={
                    track.id
                  }
                  icon={
                    <Route className="h-5 w-5" />
                  }
                  name={
                    track.name
                  }
                  subtitle={`${track.trackType} • ${track.location}`}
                  status={
                    track.publicationStatus
                  }
                  featured={
                    track.featured
                  }
                  onEdit={() => {
                    setEditingTrack(
                      track
                    );
                    setTrackEditorOpen(
                      true
                    );
                  }}
                  onDelete={() =>
                    confirmDelete(
                      "track",
                      track.id,
                      track.name
                    )
                  }
                />
              )
            )
          ))}

        {tab === "events" &&
          (events.length === 0 ? (
            <EmptyState
              title="No events yet"
              message="Create events and link them to tracks, trails, brands, or all three."
            />
          ) : (
            events.map(
              (event) => (
                <ContentRow
                  key={
                    event.id
                  }
                  icon={
                    <Calendar className="h-5 w-5" />
                  }
                  name={
                    event.name
                  }
                  subtitle={`${event.eventType} • ${event.location}`}
                  status={`${event.publicationStatus} / ${event.eventStatus}`}
                  featured={
                    event.featured
                  }
                  onEdit={() => {
                    setEditingEvent(
                      event
                    );
                    setEventEditorOpen(
                      true
                    );
                  }}
                  onDelete={() =>
                    confirmDelete(
                      "event",
                      event.id,
                      event.name
                    )
                  }
                />
              )
            )
          ))}

        {tab === "brands" &&
          (brands.length === 0 ? (
            <EmptyState
              title="No brands yet"
              message="Create official brand profiles for manufacturers, gear, parts and partners."
            />
          ) : (
            brands.map(
              (brand) => (
                <ContentRow
                  key={
                    brand.id
                  }
                  icon={
                    brand.verified ? (
                      <BadgeCheck className="h-5 w-5 text-sky-400" />
                    ) : (
                      <Store className="h-5 w-5" />
                    )
                  }
                  name={
                    brand.name
                  }
                  subtitle={
                    brand.category
                  }
                  status={
                    brand.publicationStatus
                  }
                  featured={
                    brand.featured
                  }
                  onEdit={() => {
                    setEditingBrand(
                      brand
                    );
                    setBrandEditorOpen(
                      true
                    );
                  }}
                  onDelete={() =>
                    confirmDelete(
                      "brand",
                      brand.id,
                      brand.name
                    )
                  }
                />
              )
            )
          ))}

        {tab ===
          "promotions" &&
          (promotions.length ===
          0 ? (
            <EmptyState
              title="No promotions yet"
              message="Create bike releases, gear launches, campaigns and sponsored content."
            />
          ) : (
            promotions.map(
              (promotion) => {
                const brand =
                  brands.find(
                    (
                      candidate
                    ) =>
                      candidate.id ===
                      promotion.brandId
                  );

                return (
                  <ContentRow
                    key={
                      promotion.id
                    }
                    icon={
                      <Megaphone className="h-5 w-5" />
                    }
                    name={
                      promotion.title
                    }
                    subtitle={`${brand?.name ?? "Unknown brand"} • ${promotion.promotionType}`}
                    status={
                      promotion.status
                    }
                    featured={
                      promotion.featured
                    }
                    onEdit={() => {
                      setEditingPromotion(
                        promotion
                      );
                      setPromotionEditorOpen(
                        true
                      );
                    }}
                    onDelete={() =>
                      confirmDelete(
                        "promotion",
                        promotion.id,
                        promotion.title
                      )
                    }
                  />
                );
              }
            )
          ))}
      </div>

      <TrackEditorDialog
        open={trackEditorOpen}
        onOpenChange={
          setTrackEditorOpen
        }
        track={editingTrack}
      />

      <EventEditorDialog
        open={eventEditorOpen}
        onOpenChange={
          setEventEditorOpen
        }
        event={editingEvent}
      />

      <BrandEditorDialog
        open={brandEditorOpen}
        onOpenChange={
          setBrandEditorOpen
        }
        brand={editingBrand}
      />

      <PromotionEditorDialog
        open={
          promotionEditorOpen
        }
        onOpenChange={
          setPromotionEditorOpen
        }
        promotion={
          editingPromotion
        }
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center gap-2 text-orange-400">
        {icon}

        <p className="text-xs font-medium">
          {label}
        </p>
      </div>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-500">
        {detail}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-2 text-xs font-semibold ${
        active
          ? "bg-orange-500 text-black"
          : "text-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}

function ContentRow({
  icon,
  name,
  subtitle,
  status,
  featured,
  onEdit,
  onDelete,
}: {
  icon: ReactNode;
  name: string;
  subtitle: string;
  status: string;
  featured: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-orange-400">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold">
                {name}
              </h3>

              <p className="mt-1 truncate text-xs text-neutral-500">
                {subtitle}
              </p>
            </div>

            {featured && (
              <span className="flex-shrink-0 rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-semibold text-orange-400">
                Featured
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="rounded-full border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-[11px] capitalize text-neutral-300">
              {status}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={
                  onDelete
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-7 text-center">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        {message}
      </p>
    </div>
  );
}