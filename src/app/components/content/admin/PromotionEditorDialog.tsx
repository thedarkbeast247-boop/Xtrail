import {
  useEffect,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

import { mockTrails } from "../../../data/mockData";

import { useNotification } from "../../../context/NotificationContext";
import { usePhase2Content } from "../../../context/Phase2ContentContext";

import type {
  Promotion,
  PromotionStatus,
  PromotionType,
} from "../../../types/promotion";

type Props = {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  promotion?: Promotion | null;
};

const promotionTypes: PromotionType[] = [
  "Bike Release",
  "Gear Release",
  "Product Release",
  "Brand Campaign",
  "Event Campaign",
  "Announcement",
];

function parseLines(
  value: string
) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PromotionEditorDialog({
  open,
  onOpenChange,
  promotion,
}: Props) {
  const {
    brands,
    tracks,
    events,
    addPromotion,
    updatePromotion,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const [brandId, setBrandId] =
    useState("");

  const [
    promotionType,
    setPromotionType,
  ] =
    useState<PromotionType>(
      "Bike Release"
    );

  const [title, setTitle] =
    useState("");

  const [summary, setSummary] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    imageUrl,
    setImageUrl,
  ] = useState("");

  const [
    galleryUrls,
    setGalleryUrls,
  ] = useState("");

  const [
    ctaLabel,
    setCtaLabel,
  ] = useState("");

  const [ctaUrl, setCtaUrl] =
    useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [endDate, setEndDate] =
    useState("");

  const [
    selectedTrackIds,
    setSelectedTrackIds,
  ] = useState<string[]>([]);

  const [
    selectedTrailIds,
    setSelectedTrailIds,
  ] = useState<string[]>([]);

  const [
    selectedEventIds,
    setSelectedEventIds,
  ] = useState<string[]>([]);

  const [
    sponsored,
    setSponsored,
  ] = useState(false);

  const [featured, setFeatured] =
    useState(false);

  const [status, setStatus] =
    useState<PromotionStatus>(
      "draft"
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!promotion) {
      setBrandId(
        brands[0]?.id ?? ""
      );
      setPromotionType(
        "Bike Release"
      );
      setTitle("");
      setSummary("");
      setDescription("");
      setImageUrl("");
      setGalleryUrls("");
      setCtaLabel("");
      setCtaUrl("");
      setStartDate("");
      setEndDate("");
      setSelectedTrackIds([]);
      setSelectedTrailIds([]);
      setSelectedEventIds([]);
      setSponsored(false);
      setFeatured(false);
      setStatus("draft");

      return;
    }

    setBrandId(
      promotion.brandId
    );
    setPromotionType(
      promotion.promotionType
    );
    setTitle(
      promotion.title
    );
    setSummary(
      promotion.summary
    );
    setDescription(
      promotion.description
    );
    setImageUrl(
      promotion.imageUrl
    );
    setGalleryUrls(
      promotion.galleryImageUrls.join(
        "\n"
      )
    );
    setCtaLabel(
      promotion.ctaLabel ?? ""
    );
    setCtaUrl(
      promotion.ctaUrl ?? ""
    );
    setStartDate(
      promotion.startDate ??
        ""
    );
    setEndDate(
      promotion.endDate ?? ""
    );
    setSelectedTrackIds(
      promotion.trackIds
    );
    setSelectedTrailIds(
      promotion.trailIds
    );
    setSelectedEventIds(
      promotion.eventIds
    );
    setSponsored(
      promotion.sponsored
    );
    setFeatured(
      promotion.featured
    );
    setStatus(
      promotion.status
    );
  }, [
    open,
    promotion,
    brands,
  ]);

  const toggle = (
    id: string,
    selected: string[],
    setter: (
      values: string[]
    ) => void
  ) => {
    setter(
      selected.includes(id)
        ? selected.filter(
            (item) =>
              item !== id
          )
        : [
            ...selected,
            id,
          ]
    );
  };

  const handleSave = () => {
    if (
      !brandId ||
      !title.trim()
    ) {
      showNotification({
        title:
          "Promotion details needed",
        message:
          "Select a brand and enter a title.",
        variant: "warning",
      });

      return;
    }

    const data = {
      brandId,
      promotionType,
      title: title.trim(),
      summary:
        summary.trim(),
      description:
        description.trim(),
      imageUrl:
        imageUrl.trim(),
      galleryImageUrls:
        parseLines(
          galleryUrls
        ),
      ctaLabel:
        ctaLabel.trim() ||
        undefined,
      ctaUrl:
        ctaUrl.trim() ||
        undefined,
      startDate:
        startDate ||
        undefined,
      endDate:
        endDate ||
        undefined,
      trackIds:
        selectedTrackIds,
      trailIds:
        selectedTrailIds,
      eventIds:
        selectedEventIds,
      sponsored,
      featured,
      status,
    };

    if (promotion) {
      updatePromotion(
        promotion.id,
        data
      );
    } else {
      addPromotion(data);
    }

    showNotification({
      title: promotion
        ? "Promotion updated"
        : "Promotion created",
      message:
        `${title.trim()} was saved.`,
      variant: "success",
    });

    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="top-4 bottom-4 flex h-auto max-h-none max-w-[720px] translate-y-0 flex-col gap-0 overflow-hidden border-neutral-800 bg-neutral-950 p-0 text-white">
        <DialogHeader className="shrink-0 border-b border-neutral-800 px-6 py-4 pr-12">
          <DialogTitle>
            {promotion
              ? "Edit Promotion"
              : "Add Promotion"}
          </DialogTitle>
        </DialogHeader>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-5">
          <SelectField
            label="Brand"
            value={brandId}
            values={brands.map(
              (brand) => ({
                value: brand.id,
                label: brand.name,
              })
            )}
            onChange={
              setBrandId
            }
          />

          <SelectField
            label="Promotion Type"
            value={
              promotionType
            }
            values={promotionTypes.map(
              (value) => ({
                value,
                label: value,
              })
            )}
            onChange={(value) =>
              setPromotionType(
                value as PromotionType
              )
            }
          />

          <Field
            label="Title"
            value={title}
            onChange={setTitle}
          />

          <Field
            label="Short Summary"
            value={summary}
            onChange={
              setSummary
            }
            multiline
          />

          <Field
            label="Full Description"
            value={description}
            onChange={
              setDescription
            }
            multiline
          />

          <Field
            label="Hero Image URL"
            value={imageUrl}
            onChange={
              setImageUrl
            }
          />

          <Field
            label="Gallery URLs — one per line"
            value={galleryUrls}
            onChange={
              setGalleryUrls
            }
            multiline
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="CTA Label"
              value={ctaLabel}
              onChange={
                setCtaLabel
              }
            />

            <Field
              label="CTA URL"
              value={ctaUrl}
              onChange={
                setCtaUrl
              }
            />

            <Field
              label="Start Date"
              value={startDate}
              onChange={
                setStartDate
              }
              type="date"
            />

            <Field
              label="End Date"
              value={endDate}
              onChange={
                setEndDate
              }
              type="date"
            />
          </div>

          <RelationSection
            title="Promoted Tracks"
            items={tracks.map(
              (track) => ({
                id: track.id,
                label:
                  track.name,
              })
            )}
            selected={
              selectedTrackIds
            }
            onToggle={(id) =>
              toggle(
                id,
                selectedTrackIds,
                setSelectedTrackIds
              )
            }
          />

          <RelationSection
            title="Promoted Trails"
            items={mockTrails.map(
              (trail) => ({
                id: trail.id,
                label:
                  trail.name,
              })
            )}
            selected={
              selectedTrailIds
            }
            onToggle={(id) =>
              toggle(
                id,
                selectedTrailIds,
                setSelectedTrailIds
              )
            }
          />

          <RelationSection
            title="Related Events"
            items={events.map(
              (event) => ({
                id: event.id,
                label:
                  event.name,
              })
            )}
            selected={
              selectedEventIds
            }
            onToggle={(id) =>
              toggle(
                id,
                selectedEventIds,
                setSelectedEventIds
              )
            }
          />

          <ToggleButton
            label="Sponsored content"
            checked={sponsored}
            onChange={
              setSponsored
            }
          />

          <ToggleButton
            label="Featured placement"
            checked={featured}
            onChange={
              setFeatured
            }
          />

          <SelectField
            label="Status"
            value={status}
            values={[
              "draft",
              "scheduled",
              "active",
              "ended",
              "archived",
            ].map((value) => ({
              value,
              label: value,
            }))}
            onChange={(value) =>
              setStatus(
                value as PromotionStatus
              )
            }
          />

                  </div>
      </div>

      <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 px-6 py-4">
        <Button
          type="button"
          onClick={handleSave}
          className="w-full bg-orange-500 text-black hover:bg-orange-400"
        >
          {promotion
            ? "Save Promotion Changes"
            : "Create Promotion"}
        </Button>
      </div>
    </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-neutral-300">
        {label}
      </Label>

      {multiline ? (
        <Textarea
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="mt-1 border-neutral-700 bg-neutral-900 text-white"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="mt-1 border-neutral-700 bg-neutral-900 text-white"
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: {
    value: string;
    label: string;
  }[];
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <Label className="text-neutral-300">
        {label}
      </Label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-1 h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-white"
      >
        <option value="">
          Select...
        </option>

        {values.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleButton({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        checked
          ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
          : "border-neutral-800 bg-neutral-900 text-neutral-300"
      }`}
    >
      {label}

      <span>
        {checked
          ? "Yes"
          : "No"}
      </span>
    </button>
  );
}

function RelationSection({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: {
    id: string;
    label: string;
  }[];
  selected: string[];
  onToggle: (
    id: string
  ) => void;
}) {
  return (
    <section>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-400">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nothing available yet.
        </p>
      ) : (
        <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-neutral-800 p-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onToggle(item.id)
              }
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selected.includes(
                  item.id
                )
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}