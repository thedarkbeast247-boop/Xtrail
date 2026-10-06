export type PromotionType =
  | "Bike Release"
  | "Gear Release"
  | "Product Release"
  | "Brand Campaign"
  | "Event Campaign"
  | "Announcement";

export type PromotionStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "ended"
  | "archived";

export interface Promotion {
  id: string;

  brandId: string;

  promotionType: PromotionType;

  title: string;
  summary: string;
  description: string;

  imageUrl: string;
  galleryImageUrls: string[];

  ctaLabel?: string;
  ctaUrl?: string;

  startDate?: string;
  endDate?: string;

  trackIds: string[];
  trailIds: string[];
  eventIds: string[];

  sponsored: boolean;
  featured: boolean;

  status: PromotionStatus;

  createdAt: string;
  updatedAt: string;
}