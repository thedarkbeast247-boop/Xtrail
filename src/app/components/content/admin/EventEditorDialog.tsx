import {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
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
  Event as XTrailEvent,
  EventPublicationStatus,
  EventStatus,
  EventType,
} from "../../../types/event";

import type { VehicleClass } from "../../../types/trail";

type Props = {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  event?: XTrailEvent | null;
};

const eventTypes: EventType[] = [
  "Race",
  "Practice Day",
  "Training",
  "Demo Day",
  "Community Ride",
  "Competition",
  "Festival",
  "Product Launch",
  "Meetup",
  "Other",
];

const vehicleClasses: VehicleClass[] = [
  "ATV",
  "Motocross",
  "Dual-Sport",
  "SUV",
  "4x4",
  "UTV",
];

function parseLines(
  value: string
) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function EventEditorDialog({
  open,
  onOpenChange,
  event,
}: Props) {
  const {
    tracks,
    brands,
    addEvent,
    updateEvent,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    eventType,
    setEventType,
  ] =
    useState<EventType>(
      "Community Ride"
    );

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [endDate, setEndDate] =
    useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [endTime, setEndTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [province, setProvince] =
    useState("Gauteng");

  const [country, setCountry] =
    useState("South Africa");

  const [lat, setLat] =
    useState("");

  const [lng, setLng] =
    useState("");

  const [
    imageUrl,
    setImageUrl,
  ] = useState("");

  const [
    galleryUrls,
    setGalleryUrls,
  ] = useState("");

  const [
    selectedVehicles,
    setSelectedVehicles,
  ] = useState<VehicleClass[]>([]);

  const [entryFee, setEntryFee] =
    useState("");

  const [
    entryFeeNotes,
    setEntryFeeNotes,
  ] = useState("");

  const [
    registrationRequired,
    setRegistrationRequired,
  ] = useState(false);

  const [
    registrationUrl,
    setRegistrationUrl,
  ] = useState("");

  const [
    organizerName,
    setOrganizerName,
  ] = useState("");

  const [
    organizerPhone,
    setOrganizerPhone,
  ] = useState("");

  const [
    organizerEmail,
    setOrganizerEmail,
  ] = useState("");

  const [
    organizerWebsite,
    setOrganizerWebsite,
  ] = useState("");

  const [
    selectedTrackIds,
    setSelectedTrackIds,
  ] = useState<string[]>([]);

  const [
    selectedTrailIds,
    setSelectedTrailIds,
  ] = useState<string[]>([]);

  const [
    selectedBrandIds,
    setSelectedBrandIds,
  ] = useState<string[]>([]);

  const [rules, setRules] =
    useState("");

  const [
    requirements,
    setRequirements,
  ] = useState("");

  const [featured, setFeatured] =
    useState(false);

  const [
    eventStatus,
    setEventStatus,
  ] =
    useState<EventStatus>(
      "upcoming"
    );

  const [
    publicationStatus,
    setPublicationStatus,
  ] =
    useState<EventPublicationStatus>(
      "draft"
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!event) {
      setName("");
      setDescription("");
      setEventType(
        "Community Ride"
      );
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setAddress("");
      setProvince("Gauteng");
      setCountry(
        "South Africa"
      );
      setLat("");
      setLng("");
      setImageUrl("");
      setGalleryUrls("");
      setSelectedVehicles([]);
      setEntryFee("");
      setEntryFeeNotes("");
      setRegistrationRequired(
        false
      );
      setRegistrationUrl("");
      setOrganizerName("");
      setOrganizerPhone("");
      setOrganizerEmail("");
      setOrganizerWebsite("");
      setSelectedTrackIds([]);
      setSelectedTrailIds([]);
      setSelectedBrandIds([]);
      setRules("");
      setRequirements("");
      setFeatured(false);
      setEventStatus(
        "upcoming"
      );
      setPublicationStatus(
        "draft"
      );

      return;
    }

    setName(event.name);
    setDescription(
      event.description
    );
    setEventType(
      event.eventType
    );
    setStartDate(
      event.startDate
    );
    setEndDate(
      event.endDate ?? ""
    );
    setStartTime(
      event.startTime ?? ""
    );
    setEndTime(
      event.endTime ?? ""
    );
    setLocation(
      event.location
    );
    setAddress(
      event.address ?? ""
    );
    setProvince(
      event.province
    );
    setCountry(
      event.country
    );
    setLat(
      event.lat !== undefined
        ? String(event.lat)
        : ""
    );
    setLng(
      event.lng !== undefined
        ? String(event.lng)
        : ""
    );
    setImageUrl(
      event.imageUrl
    );
    setGalleryUrls(
      event.galleryImageUrls.join(
        "\n"
      )
    );
    setSelectedVehicles(
      event.vehicleClass
    );
    setEntryFee(
      event.entryFee !==
        undefined
        ? String(
            event.entryFee
          )
        : ""
    );
    setEntryFeeNotes(
      event.entryFeeNotes ??
        ""
    );
    setRegistrationRequired(
      event.registrationRequired
    );
    setRegistrationUrl(
      event.registrationUrl ??
        ""
    );
    setOrganizerName(
      event.organizerName ??
        ""
    );
    setOrganizerPhone(
      event.organizerPhone ??
        ""
    );
    setOrganizerEmail(
      event.organizerEmail ??
        ""
    );
    setOrganizerWebsite(
      event.organizerWebsite ??
        ""
    );
    setSelectedTrackIds(
      event.trackIds
    );
    setSelectedTrailIds(
      event.trailIds
    );
    setSelectedBrandIds(
      event.brandIds
    );
    setRules(
      event.rules.join("\n")
    );
    setRequirements(
      event.requirements.join(
        "\n"
      )
    );
    setFeatured(
      event.featured
    );
    setEventStatus(
      event.eventStatus
    );
    setPublicationStatus(
      event.publicationStatus
    );
  }, [open, event]);

  const toggleString = (
    value: string,
    current: string[],
    setter: Dispatch<
        SetStateAction<string[]>
    >
  ) => {
    setter(
      current.includes(value)
        ? current.filter(
            (item) =>
              item !== value
          )
        : [
            ...current,
            value,
          ]
    );
  };

  const toggleVehicle = (
    value: VehicleClass
  ) => {
    setSelectedVehicles(
      (previous) =>
        previous.includes(value)
          ? previous.filter(
              (item) =>
                item !== value
            )
          : [
              ...previous,
              value,
            ]
    );
  };

  const handleSave = () => {
    if (
      !name.trim() ||
      !startDate ||
      !location.trim()
    ) {
      showNotification({
        title:
          "Event details needed",
        message:
          "Event name, start date and location are required.",
        variant: "warning",
      });

      return;
    }

    const numericLat =
      lat.trim()
        ? Number(lat)
        : undefined;

    const numericLng =
      lng.trim()
        ? Number(lng)
        : undefined;

    const data = {
      name: name.trim(),
      description:
        description.trim(),
      eventType,
      startDate,
      endDate:
        endDate ||
        undefined,
      startTime:
        startTime ||
        undefined,
      endTime:
        endTime ||
        undefined,
      location:
        location.trim(),
      address:
        address.trim() ||
        undefined,
      province:
        province.trim(),
      country:
        country.trim(),
      lat:
        Number.isFinite(
          numericLat
        )
          ? numericLat
          : undefined,
      lng:
        Number.isFinite(
          numericLng
        )
          ? numericLng
          : undefined,
      imageUrl:
        imageUrl.trim(),
      galleryImageUrls:
        parseLines(
          galleryUrls
        ),
      vehicleClass:
        selectedVehicles,
      entryFee:
        entryFee.trim()
          ? Number(entryFee)
          : undefined,
      entryFeeNotes:
        entryFeeNotes.trim() ||
        undefined,
      registrationRequired,
      registrationUrl:
        registrationUrl.trim() ||
        undefined,
      organizerName:
        organizerName.trim() ||
        undefined,
      organizerPhone:
        organizerPhone.trim() ||
        undefined,
      organizerEmail:
        organizerEmail.trim() ||
        undefined,
      organizerWebsite:
        organizerWebsite.trim() ||
        undefined,
      trailIds:
        selectedTrailIds,
      trackIds:
        selectedTrackIds,
      brandIds:
        selectedBrandIds,
      groupIds:
        event?.groupIds ?? [],
      rules:
        parseLines(rules),
      requirements:
        parseLines(
          requirements
        ),
      featured,
      eventStatus,
      publicationStatus,
    };

    if (event) {
      updateEvent(
        event.id,
        data
      );
    } else {
      addEvent(data);
    }

    showNotification({
      title: event
        ? "Event updated"
        : "Event created",
      message:
        `${name.trim()} was saved.`,
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
        <DialogHeader className="shrink-0 border-b border-neutral-800 px-6 py-4">
          <DialogTitle>
            {event
              ? "Edit Event"
              : "Add Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-6">
          <Field
            label="Event Name"
            value={name}
            onChange={setName}
          />

          <Field
            label="Description"
            value={description}
            onChange={
              setDescription
            }
            multiline
          />

          <SelectField
            label="Event Type"
            value={eventType}
            values={eventTypes}
            onChange={(value) =>
              setEventType(
                value as EventType
              )
            }
          />

          <div className="grid grid-cols-2 gap-3">
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

            <Field
              label="Start Time"
              value={startTime}
              onChange={
                setStartTime
              }
              type="time"
            />

            <Field
              label="End Time"
              value={endTime}
              onChange={
                setEndTime
              }
              type="time"
            />
          </div>

          <Field
            label="Location"
            value={location}
            onChange={
              setLocation
            }
          />

          <Field
            label="Address"
            value={address}
            onChange={
              setAddress
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Province"
              value={province}
              onChange={
                setProvince
              }
            />

            <Field
              label="Country"
              value={country}
              onChange={
                setCountry
              }
            />

            <Field
              label="Latitude"
              value={lat}
              onChange={setLat}
              type="number"
            />

            <Field
              label="Longitude"
              value={lng}
              onChange={setLng}
              type="number"
            />
          </div>

          <Field
            label="Cover Image URL"
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

          <Section title="Vehicles">
            <ToggleList
              values={
                vehicleClasses
              }
              selected={
                selectedVehicles
              }
              onToggle={
                toggleVehicle
              }
            />
          </Section>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Entry Fee"
              value={entryFee}
              onChange={
                setEntryFee
              }
              type="number"
            />

            <SelectField
              label="Event Status"
              value={
                eventStatus
              }
              values={[
                "upcoming",
                "ongoing",
                "completed",
                "cancelled",
              ]}
              onChange={(value) =>
                setEventStatus(
                  value as EventStatus
                )
              }
            />
          </div>

          <Field
            label="Entry Fee Notes"
            value={entryFeeNotes}
            onChange={
              setEntryFeeNotes
            }
            multiline
          />

          <ToggleButton
            label="Registration required"
            checked={
              registrationRequired
            }
            onChange={
              setRegistrationRequired
            }
          />

          {registrationRequired && (
            <Field
              label="Registration URL"
              value={
                registrationUrl
              }
              onChange={
                setRegistrationUrl
              }
            />
          )}

          <Section title="Organizer">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Name"
                value={
                  organizerName
                }
                onChange={
                  setOrganizerName
                }
              />

              <Field
                label="Phone"
                value={
                  organizerPhone
                }
                onChange={
                  setOrganizerPhone
                }
              />

              <Field
                label="Email"
                value={
                  organizerEmail
                }
                onChange={
                  setOrganizerEmail
                }
              />

              <Field
                label="Website"
                value={
                  organizerWebsite
                }
                onChange={
                  setOrganizerWebsite
                }
              />
            </div>
          </Section>

          <Section title="Linked Tracks">
            <RelationList
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
                toggleString(
                  id,
                  selectedTrackIds,
                  setSelectedTrackIds
                )
              }
            />
          </Section>

          <Section title="Linked Trails">
            <RelationList
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
                toggleString(
                  id,
                  selectedTrailIds,
                  setSelectedTrailIds
                )
              }
            />
          </Section>

          <Section title="Linked Brands">
            <RelationList
              items={brands.map(
                (brand) => ({
                  id: brand.id,
                  label:
                    brand.name,
                })
              )}
              selected={
                selectedBrandIds
              }
              onToggle={(id) =>
                toggleString(
                  id,
                  selectedBrandIds,
                  setSelectedBrandIds
                )
              }
            />
          </Section>

          <Field
            label="Requirements — one per line"
            value={requirements}
            onChange={
              setRequirements
            }
            multiline
          />

          <Field
            label="Rules — one per line"
            value={rules}
            onChange={setRules}
            multiline
          />

          <ToggleButton
            label="Featured event"
            checked={featured}
            onChange={
              setFeatured
            }
          />

          <SelectField
            label="Publication"
            value={
              publicationStatus
            }
            values={[
              "draft",
              "published",
              "archived",
            ]}
            onChange={(value) =>
              setPublicationStatus(
                value as EventPublicationStatus
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
            {event
              ? "Save Event Changes"
              : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-400">
        {title}
      </h3>

      {children}
    </section>
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
  values: readonly string[];
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
        {values.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
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

function ToggleList<T extends string>({
  values,
  selected,
  onToggle,
}: {
  values: readonly T[];
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() =>
            onToggle(value)
          }
          className={`rounded-full border px-3 py-1.5 text-xs ${
            selected.includes(
              value
            )
              ? "border-orange-500 bg-orange-500 text-black"
              : "border-neutral-700 text-neutral-300"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function RelationList({
  items,
  selected,
  onToggle,
}: {
  items: {
    id: string;
    label: string;
  }[];
  selected: string[];
  onToggle: (
    id: string
  ) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Nothing available yet.
      </p>
    );
  }

  return (
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
  );
}