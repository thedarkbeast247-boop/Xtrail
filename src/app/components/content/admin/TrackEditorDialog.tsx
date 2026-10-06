import {
  useEffect,
  useState,
  type ReactNode,
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

import { useNotification } from "../../../context/NotificationContext";
import { usePhase2Content } from "../../../context/Phase2ContentContext";

import type {
  Track,
  TrackDifficulty,
  TrackDirection,
  TrackFacility,
  TrackFeature,
  TrackOperatingHour,
  TrackPublicationStatus,
  TrackRoutePoint,
  TrackRouteSource,
  TrackSurface,
  TrackType,
} from "../../../types/track";

import type { VehicleClass } from "../../../types/trail";

type Props = {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  track?: Track | null;
};

const trackTypes: TrackType[] = [
  "Motocross",
  "Supercross",
  "Enduro Track",
  "Training Track",
  "Off-road Park",
  "Other",
];

const difficulties: TrackDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Mixed",
];

const surfaces: TrackSurface[] = [
  "Hard Pack",
  "Loam",
  "Sand",
  "Clay",
  "Rocky",
  "Mixed",
  "Other",
];

const directions: TrackDirection[] = [
  "Clockwise",
  "Anti-clockwise",
  "Bidirectional",
  "Varies",
  "Not applicable",
];

const vehicleClasses: VehicleClass[] = [
  "ATV",
  "Motocross",
  "Dual-Sport",
  "SUV",
  "4x4",
  "UTV",
];

const facilities: TrackFacility[] = [
  "Parking",
  "Toilets",
  "Food",
  "Pits",
  "Bike Wash",
  "Workshop",
  "Spectator Area",
  "Camping",
  "Showers",
  "Fuel",
  "First Aid",
  "Other",
];

const features: TrackFeature[] = [
  "Tabletops",
  "Doubles",
  "Triples",
  "Whoops",
  "Berms",
  "Rhythm Section",
  "Start Gate",
  "Technical Section",
  "Sand Section",
  "Rock Section",
  "Kids Track",
  "Practice Loop",
  "Other",
];

const days: TrackOperatingHour["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function createDefaultHours(): TrackOperatingHour[] {
  return days.map((day) => ({
    day,
    isOpen: false,
    opensAt: "",
    closesAt: "",
    notes: "",
  }));
}

function parseLines(
  value: string
) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRoutePoints(
  value: string
): TrackRoutePoint[] {
  return parseLines(value)
    .map((line) => {
      const [
        latValue,
        lngValue,
        elevationValue,
      ] = line
        .split(",")
        .map((item) =>
          item.trim()
        );

      const lat = Number(latValue);
      const lng = Number(lngValue);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return null;
      }

      const elevation =
        elevationValue !== undefined &&
        elevationValue !== ""
          ? Number(elevationValue)
          : undefined;

      return {
        lat,
        lng,
        ...(Number.isFinite(
          elevation
        )
          ? { elevation }
          : {}),
      };
    })
    .filter(
      (
        point
      ): point is TrackRoutePoint =>
        point !== null
    );
}

export function TrackEditorDialog({
  open,
  onOpenChange,
  track,
}: Props) {
  const {
    addTrack,
    updateTrack,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const isEditing =
    Boolean(track);

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    trackType,
    setTrackType,
  ] =
    useState<TrackType>(
      "Motocross"
    );

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
  ] = useState<VehicleClass[]>([
    "Motocross",
  ]);

  const [
    difficulty,
    setDifficulty,
  ] =
    useState<TrackDifficulty>(
      "Intermediate"
    );

  const [
    surface,
    setSurface,
  ] =
    useState<TrackSurface>(
      "Mixed"
    );

  const [lengthKm, setLengthKm] =
    useState("");

  const [
    direction,
    setDirection,
  ] =
    useState<TrackDirection>(
      "Clockwise"
    );

  const [entryFee, setEntryFee] =
    useState("");

  const [
    entryFeeNotes,
    setEntryFeeNotes,
  ] = useState("");

  const [
    requiresBooking,
    setRequiresBooking,
  ] = useState(false);

  const [
    bookingUrl,
    setBookingUrl,
  ] = useState("");

  const [
    operatingHours,
    setOperatingHours,
  ] =
    useState<TrackOperatingHour[]>(
      createDefaultHours()
    );

  const [phone, setPhone] =
    useState("");

  const [whatsapp, setWhatsapp] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [
    instagram,
    setInstagram,
  ] = useState("");

  const [facebook, setFacebook] =
    useState("");

  const [
    selectedFacilities,
    setSelectedFacilities,
  ] = useState<TrackFacility[]>(
    []
  );

  const [
    customFacilities,
    setCustomFacilities,
  ] = useState("");

  const [
    selectedFeatures,
    setSelectedFeatures,
  ] = useState<TrackFeature[]>(
    []
  );

  const [
    customFeatures,
    setCustomFeatures,
  ] = useState("");

  const [rules, setRules] =
    useState("");

  const [
    routePointsText,
    setRoutePointsText,
  ] = useState("");

  const [
    routeSource,
    setRouteSource,
  ] =
    useState<TrackRouteSource>(
      "manual"
    );

  const [
    routeContributor,
    setRouteContributor,
  ] = useState("");

  const [featured, setFeatured] =
    useState(false);

  const [
    publicationStatus,
    setPublicationStatus,
  ] =
    useState<TrackPublicationStatus>(
      "draft"
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!track) {
      setName("");
      setDescription("");
      setTrackType("Motocross");
      setLocation("");
      setAddress("");
      setProvince("Gauteng");
      setCountry("South Africa");
      setLat("");
      setLng("");
      setImageUrl("");
      setGalleryUrls("");
      setSelectedVehicles([
        "Motocross",
      ]);
      setDifficulty(
        "Intermediate"
      );
      setSurface("Mixed");
      setLengthKm("");
      setDirection(
        "Clockwise"
      );
      setEntryFee("");
      setEntryFeeNotes("");
      setRequiresBooking(false);
      setBookingUrl("");
      setOperatingHours(
        createDefaultHours()
      );
      setPhone("");
      setWhatsapp("");
      setEmail("");
      setWebsite("");
      setInstagram("");
      setFacebook("");
      setSelectedFacilities([]);
      setCustomFacilities("");
      setSelectedFeatures([]);
      setCustomFeatures("");
      setRules("");
      setRoutePointsText("");
      setRouteSource("manual");
      setRouteContributor("");
      setFeatured(false);
      setPublicationStatus(
        "draft"
      );

      return;
    }

    setName(track.name);
    setDescription(
      track.description
    );
    setTrackType(
      track.trackType
    );
    setLocation(
      track.location
    );
    setAddress(
      track.address ?? ""
    );
    setProvince(
      track.province
    );
    setCountry(track.country);
    setLat(String(track.lat));
    setLng(String(track.lng));
    setImageUrl(
      track.imageUrl
    );
    setGalleryUrls(
      track.galleryImageUrls.join(
        "\n"
      )
    );
    setSelectedVehicles(
      track.vehicleClass
    );
    setDifficulty(
      track.difficulty
    );
    setSurface(track.surface);
    setLengthKm(
      track.lengthKm !==
        undefined
        ? String(
            track.lengthKm
          )
        : ""
    );
    setDirection(
      track.direction
    );
    setEntryFee(
      track.entryFee !==
        undefined
        ? String(
            track.entryFee
          )
        : ""
    );
    setEntryFeeNotes(
      track.entryFeeNotes ??
        ""
    );
    setRequiresBooking(
      track.requiresBooking
    );
    setBookingUrl(
      track.bookingUrl ?? ""
    );
    setOperatingHours(
      days.map((day) => {
        const existing =
          track.operatingHours.find(
            (item) =>
              item.day === day
          );

        return (
          existing ?? {
            day,
            isOpen: false,
            opensAt: "",
            closesAt: "",
            notes: "",
          }
        );
      })
    );
    setPhone(track.phone ?? "");
    setWhatsapp(
      track.whatsapp ?? ""
    );
    setEmail(track.email ?? "");
    setWebsite(
      track.website ?? ""
    );
    setInstagram(
      track.instagram ?? ""
    );
    setFacebook(
      track.facebook ?? ""
    );
    setSelectedFacilities(
      track.facilities
    );
    setCustomFacilities(
      track.customFacilities.join(
        "\n"
      )
    );
    setSelectedFeatures(
      track.features
    );
    setCustomFeatures(
      track.customFeatures.join(
        "\n"
      )
    );
    setRules(
      track.rules.join("\n")
    );
    setRoutePointsText(
      track.routePoints
        .map((point) =>
          [
            point.lat,
            point.lng,
            point.elevation,
          ]
            .filter(
              (value) =>
                value !==
                undefined
            )
            .join(", ")
        )
        .join("\n")
    );
    setRouteSource(
      track.routeSource ??
        "manual"
    );
    setRouteContributor(
      track.routeContributor ??
        ""
    );
    setFeatured(
      track.featured
    );
    setPublicationStatus(
      track.publicationStatus
    );
  }, [open, track]);

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

  const toggleFacility = (
    value: TrackFacility
  ) => {
    setSelectedFacilities(
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

  const toggleFeature = (
    value: TrackFeature
  ) => {
    setSelectedFeatures(
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
    const numericLat =
      Number(lat);

    const numericLng =
      Number(lng);

    if (
      !name.trim() ||
      !location.trim() ||
      !Number.isFinite(
        numericLat
      ) ||
      !Number.isFinite(
        numericLng
      )
    ) {
      showNotification({
        title:
          "Track details needed",
        message:
          "Track name, location, latitude and longitude are required.",
        variant: "warning",
      });

      return;
    }

    const routePoints =
      parseRoutePoints(
        routePointsText
      );

    const data = {
      name: name.trim(),
      description:
        description.trim(),
      trackType,
      location:
        location.trim(),
      address:
        address.trim() ||
        undefined,
      province:
        province.trim(),
      country:
        country.trim(),
      lat: numericLat,
      lng: numericLng,
      imageUrl:
        imageUrl.trim(),
      galleryImageUrls:
        parseLines(
          galleryUrls
        ),
      vehicleClass:
        selectedVehicles,
      difficulty,
      surface,
      lengthKm:
        lengthKm.trim()
          ? Number(lengthKm)
          : undefined,
      direction,
      entryFee:
        entryFee.trim()
          ? Number(entryFee)
          : undefined,
      entryFeeNotes:
        entryFeeNotes.trim() ||
        undefined,
      requiresBooking,
      bookingUrl:
        bookingUrl.trim() ||
        undefined,
      operatingHours,
      phone:
        phone.trim() ||
        undefined,
      whatsapp:
        whatsapp.trim() ||
        undefined,
      email:
        email.trim() ||
        undefined,
      website:
        website.trim() ||
        undefined,
      instagram:
        instagram.trim() ||
        undefined,
      facebook:
        facebook.trim() ||
        undefined,
      facilities:
        selectedFacilities,
      customFacilities:
        parseLines(
          customFacilities
        ),
      features:
        selectedFeatures,
      customFeatures:
        parseLines(
          customFeatures
        ),
      rules:
        parseLines(rules),
      routePoints,
      routeSource:
        routePoints.length > 0
          ? routeSource
          : undefined,
      routeUpdatedAt:
        routePoints.length > 0
          ? new Date().toISOString()
          : undefined,
      routeContributor:
        routeContributor.trim() ||
        undefined,
      featured,
      publicationStatus,
    };

    if (track) {
      updateTrack(
        track.id,
        data
      );

      showNotification({
        title:
          "Track updated",
        message:
          `${name.trim()} was updated.`,
        variant: "success",
      });
    } else {
      addTrack({
        ...data,
        rating: 0,
        reviewCount: 0,
      });

      showNotification({
        title:
          "Track created",
        message:
          `${name.trim()} was created.`,
        variant: "success",
      });
    }

    onOpenChange(false);
  };

  const updateHour = (
    index: number,
    updates: Partial<TrackOperatingHour>
  ) => {
    setOperatingHours(
      (previous) =>
        previous.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  ...updates,
                }
              : item
        )
    );
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
            {isEditing
              ? "Edit Track"
              : "Add Track"}
          </DialogTitle>
        </DialogHeader>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-7">
          <Section title="Basic Information">
            <Field
              label="Track Name"
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

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Track Type"
                value={trackType}
                values={trackTypes}
                onChange={(value) =>
                  setTrackType(
                    value as TrackType
                  )
                }
              />

              <SelectField
                label="Difficulty"
                value={difficulty}
                values={
                  difficulties
                }
                onChange={(value) =>
                  setDifficulty(
                    value as TrackDifficulty
                  )
                }
              />

              <SelectField
                label="Surface"
                value={surface}
                values={surfaces}
                onChange={(value) =>
                  setSurface(
                    value as TrackSurface
                  )
                }
              />

              <SelectField
                label="Direction"
                value={direction}
                values={directions}
                onChange={(value) =>
                  setDirection(
                    value as TrackDirection
                  )
                }
              />
            </div>
          </Section>

          <Section title="Location">
            <Field
              label="Area / Location"
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
          </Section>

          <Section title="Images">
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
          </Section>

          <Section title="Vehicle Compatibility">
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

          <Section title="Track Details">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Length (km)"
                value={lengthKm}
                onChange={
                  setLengthKm
                }
                type="number"
              />

              <Field
                label="Entry Fee (R)"
                value={entryFee}
                onChange={
                  setEntryFee
                }
                type="number"
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
              checked={
                requiresBooking
              }
              onChange={
                setRequiresBooking
              }
              label="Booking required"
            />

            {requiresBooking && (
              <Field
                label="Booking URL"
                value={bookingUrl}
                onChange={
                  setBookingUrl
                }
              />
            )}
          </Section>

          <Section title="Opening Hours">
            <div className="space-y-3">
              {operatingHours.map(
                (
                  hour,
                  index
                ) => (
                  <div
                    key={
                      hour.day
                    }
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3"
                  >
                    <ToggleButton
                      checked={
                        hour.isOpen
                      }
                      onChange={(
                        value
                      ) =>
                        updateHour(
                          index,
                          {
                            isOpen:
                              value,
                          }
                        )
                      }
                      label={
                        hour.day
                      }
                    />

                    {hour.isOpen && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field
                          label="Opens"
                          value={
                            hour.opensAt ??
                            ""
                          }
                          onChange={(
                            value
                          ) =>
                            updateHour(
                              index,
                              {
                                opensAt:
                                  value,
                              }
                            )
                          }
                          type="time"
                        />

                        <Field
                          label="Closes"
                          value={
                            hour.closesAt ??
                            ""
                          }
                          onChange={(
                            value
                          ) =>
                            updateHour(
                              index,
                              {
                                closesAt:
                                  value,
                              }
                            )
                          }
                          type="time"
                        />
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </Section>

          <Section title="Facilities">
            <ToggleList
              values={facilities}
              selected={
                selectedFacilities
              }
              onToggle={
                toggleFacility
              }
            />

            <Field
              label="Custom Facilities — one per line"
              value={
                customFacilities
              }
              onChange={
                setCustomFacilities
              }
              multiline
            />
          </Section>

          <Section title="Track Features">
            <ToggleList
              values={features}
              selected={
                selectedFeatures
              }
              onToggle={
                toggleFeature
              }
            />

            <Field
              label="Custom Features — one per line"
              value={
                customFeatures
              }
              onChange={
                setCustomFeatures
              }
              multiline
            />
          </Section>

          <Section title="Rules">
            <Field
              label="One rule per line"
              value={rules}
              onChange={setRules}
              multiline
            />
          </Section>

          <Section title="Contact">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Phone"
                value={phone}
                onChange={
                  setPhone
                }
              />

              <Field
                label="WhatsApp"
                value={whatsapp}
                onChange={
                  setWhatsapp
                }
              />

              <Field
                label="Email"
                value={email}
                onChange={
                  setEmail
                }
              />

              <Field
                label="Website"
                value={website}
                onChange={
                  setWebsite
                }
              />

              <Field
                label="Instagram"
                value={instagram}
                onChange={
                  setInstagram
                }
              />

              <Field
                label="Facebook"
                value={facebook}
                onChange={
                  setFacebook
                }
              />
            </div>
          </Section>

          <Section title="Track Route">
            <p className="text-xs leading-5 text-neutral-500">
              Optional. Enter one GPS
              point per line as:
              latitude, longitude,
              elevation.
            </p>

            <Field
              label="Route Points"
              value={
                routePointsText
              }
              onChange={
                setRoutePointsText
              }
              multiline
            />

            <SelectField
              label="Route Source"
              value={routeSource}
              values={[
                "manual",
                "gpx_import",
                "community_recording",
                "official",
              ]}
              onChange={(value) =>
                setRouteSource(
                  value as TrackRouteSource
                )
              }
            />

            <Field
              label="Route Contributor"
              value={
                routeContributor
              }
              onChange={
                setRouteContributor
              }
            />
          </Section>

          <Section title="Publishing">
            <ToggleButton
              checked={featured}
              onChange={
                setFeatured
              }
              label="Featured track"
            />

            <SelectField
              label="Status"
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
                  value as TrackPublicationStatus
                )
              }
            />
          </Section>

                </div>
              </div>

              <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 px-6 py-4">
                <Button
                  type="button"
                  onClick={handleSave}
                  className="w-full bg-orange-500 text-black hover:bg-orange-400"
                >
                  {isEditing
                    ? "Save Track Changes"
                    : "Create Track"}
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
    <section className="space-y-4">
      <h3 className="border-b border-neutral-800 pb-2 text-sm font-semibold uppercase tracking-wide text-orange-400">
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
      {values.map((value) => {
        const active =
          selected.includes(value);

        return (
          <button
            key={value}
            type="button"
            onClick={() =>
              onToggle(value)
            }
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              active
                ? "border-orange-500 bg-orange-500 text-black"
                : "border-neutral-700 bg-neutral-900 text-neutral-300"
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}

function ToggleButton({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  label: string;
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
      <span>{label}</span>

      <span>
        {checked
          ? "Yes"
          : "No"}
      </span>
    </button>
  );
}