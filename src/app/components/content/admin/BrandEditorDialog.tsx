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

import { useNotification } from "../../../context/NotificationContext";
import { usePhase2Content } from "../../../context/Phase2ContentContext";

import type {
  Brand,
  BrandCategory,
  BrandPublicationStatus,
} from "../../../types/brand";

type Props = {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  brand?: Brand | null;
};

const categories: BrandCategory[] = [
  "Motorcycle Manufacturer",
  "4x4 Manufacturer",
  "Riding Gear",
  "Parts & Accessories",
  "Tyres",
  "Suspension",
  "Workshop",
  "Training",
  "Tour Operator",
  "Track Operator",
  "Event Organizer",
  "Other",
];

export function BrandEditorDialog({
  open,
  onOpenChange,
  brand,
}: Props) {
  const {
    addBrand,
    updateBrand,
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
    category,
    setCategory,
  ] =
    useState<BrandCategory>(
      "Motorcycle Manufacturer"
    );

  const [logoUrl, setLogoUrl] =
    useState("");

  const [
    bannerImageUrl,
    setBannerImageUrl,
  ] = useState("");

  const [website, setWebsite] =
    useState("");

  const [
    instagram,
    setInstagram,
  ] = useState("");

  const [facebook, setFacebook] =
    useState("");

  const [youtube, setYoutube] =
    useState("");

  const [tiktok, setTiktok] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [whatsapp, setWhatsapp] =
    useState("");

  const [verified, setVerified] =
    useState(false);

  const [featured, setFeatured] =
    useState(false);

  const [
    publicationStatus,
    setPublicationStatus,
  ] =
    useState<BrandPublicationStatus>(
      "draft"
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!brand) {
      setName("");
      setDescription("");
      setCategory(
        "Motorcycle Manufacturer"
      );
      setLogoUrl("");
      setBannerImageUrl("");
      setWebsite("");
      setInstagram("");
      setFacebook("");
      setYoutube("");
      setTiktok("");
      setEmail("");
      setPhone("");
      setWhatsapp("");
      setVerified(false);
      setFeatured(false);
      setPublicationStatus(
        "draft"
      );

      return;
    }

    setName(brand.name);
    setDescription(
      brand.description
    );
    setCategory(
      brand.category
    );
    setLogoUrl(
      brand.logoUrl
    );
    setBannerImageUrl(
      brand.bannerImageUrl ??
        ""
    );
    setWebsite(
      brand.website ?? ""
    );
    setInstagram(
      brand.instagram ?? ""
    );
    setFacebook(
      brand.facebook ?? ""
    );
    setYoutube(
      brand.youtube ?? ""
    );
    setTiktok(
      brand.tiktok ?? ""
    );
    setEmail(brand.email ?? "");
    setPhone(brand.phone ?? "");
    setWhatsapp(
      brand.whatsapp ?? ""
    );
    setVerified(
      brand.verified
    );
    setFeatured(
      brand.featured
    );
    setPublicationStatus(
      brand.publicationStatus
    );
  }, [open, brand]);

  const handleSave = () => {
    if (!name.trim()) {
      showNotification({
        title:
          "Brand name needed",
        message:
          "Enter a name before saving the brand.",
        variant: "warning",
      });

      return;
    }

    const data = {
      name: name.trim(),
      description:
        description.trim(),
      category,
      logoUrl:
        logoUrl.trim(),
      bannerImageUrl:
        bannerImageUrl.trim() ||
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
      youtube:
        youtube.trim() ||
        undefined,
      tiktok:
        tiktok.trim() ||
        undefined,
      email:
        email.trim() ||
        undefined,
      phone:
        phone.trim() ||
        undefined,
      whatsapp:
        whatsapp.trim() ||
        undefined,
      verified,
      featured,
      publicationStatus,
    };

    if (brand) {
      updateBrand(
        brand.id,
        data
      );
    } else {
      addBrand(data);
    }

    showNotification({
      title: brand
        ? "Brand updated"
        : "Brand created",
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
      <DialogContent className="top-4 bottom-4 flex h-auto max-h-none max-w-[620px] translate-y-0 flex-col gap-0 overflow-hidden border-neutral-800 bg-neutral-950 p-0 text-white">
        <DialogHeader className="shrink-0 border-b border-neutral-800 px-6 py-4 pr-12">
          <DialogTitle>
            {brand
              ? "Edit Brand"
              : "Add Brand"}
          </DialogTitle>
        </DialogHeader>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-5">
          <Field
            label="Brand Name"
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
            label="Category"
            value={category}
            values={categories}
            onChange={(value) =>
              setCategory(
                value as BrandCategory
              )
            }
          />

          <Field
            label="Logo URL"
            value={logoUrl}
            onChange={
              setLogoUrl
            }
          />

          <Field
            label="Banner Image URL"
            value={
              bannerImageUrl
            }
            onChange={
              setBannerImageUrl
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Website"
              value={website}
              onChange={
                setWebsite
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

            <Field
              label="YouTube"
              value={youtube}
              onChange={
                setYoutube
              }
            />

            <Field
              label="TikTok"
              value={tiktok}
              onChange={
                setTiktok
              }
            />
          </div>

          <ToggleButton
            label="Verified official brand"
            checked={verified}
            onChange={
              setVerified
            }
          />

          <ToggleButton
            label="Featured brand"
            checked={featured}
            onChange={
              setFeatured
            }
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
                value as BrandPublicationStatus
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
            {brand
              ? "Save Brand Changes"
              : "Create Brand"}
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
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  multiline?: boolean;
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