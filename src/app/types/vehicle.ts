export type VehicleType =
  | "dirt-bike"
  | "adventure-bike"
  | "quad"
  | "sxs"
  | "4x4"
  | "other";

export type VehicleSetupProfile = {
  // General setup
  primaryUse?: string;
  terrainFocus?: string;
  ridingSetup?: string;
  ridingSetupNotes?: string;
  setupNotes?: string;

  // Tyres / wheels
  frontTyreType?: string;
  frontTyreName?: string;
  rearTyreType?: string;
  rearTyreName?: string;
  tyreSize?: string;
  wheelSetup?: string;
  tyrePressure?: string;
  tubeMousseTubliss?: string;

  // Suspension
  suspensionSetup?: string;
  suspensionNotes?: string;
  riderWeightKg?: number;

  // Fuel / range
  fuelSetup?: string;
  fuelRangeKm?: number;
  fuelTankSizeLitres?: number;
  fuelNotes?: string;

  // Protection / accessories
  protectionParts?: string[];
  protectionNotes?: string;

  // Bike-specific / motorcycle setup
  frontSprocket?: number;
  rearSprocket?: number;
  gearingNotes?: string;

  // Adventure / touring setup
  luggageSetup?: string;
  navigationSetup?: string;
  windProtection?: string;

  // Quad / SXS / 4x4 setup
  winch?: string;
  recoveryGear?: string;
  lightingSetup?: string;
  lightingNotes?: string;
  roofDoorsSetup?: string;
  cargoSetup?: string;
  drivetrainSetup?: string;
  lockers?: string;
  liftKit?: string;
  snorkel?: string;
  campingSetup?: string;

  // Communication / electronics
  commsSetup?: string;
  electronicsNotes?: string;

  // Tools and spares
  toolsAndSpares?: string[];
  toolsAndSparesNotes?: string;

  // Flexible custom field
  customSetup?: string;
};

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  hours: number;
  hoursAtPurchase?: number;
  manualAddedHours?: number;
  mileage: number;
  notes?: string;
  image?: string;
  bannerImage?: string;
  color?: string;
  setupProfile?: VehicleSetupProfile;
  createdAt: string;
  updatedAt: string;
}