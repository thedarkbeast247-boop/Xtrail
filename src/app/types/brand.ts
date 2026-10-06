export type BrandCategory =
  | "Motorcycle Manufacturer"
  | "4x4 Manufacturer"
  | "Riding Gear"
  | "Parts & Accessories"
  | "Tyres"
  | "Suspension"
  | "Workshop"
  | "Training"
  | "Tour Operator"
  | "Track Operator"
  | "Event Organizer"
  | "Other";

export type BrandPublicationStatus =
  | "draft"
  | "published"
  | "archived";

export interface Brand {
  id: string;

  name: string;
  description: string;

  category: BrandCategory;

  logoUrl: string;
  bannerImageUrl?: string;

  website?: string;

  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;

  email?: string;
  phone?: string;
  whatsapp?: string;

  verified: boolean;
  featured: boolean;

  publicationStatus: BrandPublicationStatus;

  createdAt: string;
  updatedAt: string;
}