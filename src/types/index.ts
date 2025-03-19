export interface ConsumptionData {
  id: string;
  name: string;
  kwh: number;
  cost?: number; // Calculated based on total bill
  percentage?: number; // Percentage of total consumption
  month?: string; // Optional month data for historical tracking
  groupId?: string; // Group identifier for grouping consumption data
  isGeneral?: boolean; // Flag for general counter
  squareMeters?: number; // Square meters of the property/unit
  thousandthQuota?: number; // "Quota millesimale" for condominium calculations
  type?: ConsumptionType; // Type of consumption (office or ac)
}

export interface ConsumptionGroup {
  id: string;
  name: string;
  type: ConsumptionType;
  propertyType?: string; // Type of property (building, offices, etc.)
  propertyNumber?: string; // Property identifier number
}

export interface BillData {
  totalAmount: number;
  billDate: Date;
  description?: string;
  groupId?: string; // Group identifier
  providerName?: string; // Energy provider company name
  billNumber?: string; // Bill/invoice number
}

export type ConsumptionType = 'office' | 'ac';

export interface CalculationResult {
  officeData: ConsumptionData[];
  acData: ConsumptionData[];
  officeBill: BillData;
  acBill: BillData;
  officeTotal: number; // Total kWh
  acTotal: number; // Total kWh
  date: Date;
  id: string;
  month?: string; // Month this calculation represents
  groups?: ConsumptionGroup[]; // Groups information
  companyInfo?: CompanyInfo; // Company/condominium information
}

export interface ThresholdAlert {
  type: ConsumptionType;
  consumptionId: string;
  threshold: number; // kWh value
  active: boolean;
}

// For monthly consumption tracking
export interface MonthlyConsumption {
  month: string;
  officeTotal: number;
  acTotal: number;
  officeCost: number;
  acCost: number;
  groupId?: string; // Group identifier
}

// Group structure for organizing consumption data
export interface GroupedConsumptionData {
  [groupId: string]: {
    name: string;
    propertyType?: string;
    propertyNumber?: string;
    items: ConsumptionData[];
    generalCounters?: ConsumptionData[];
  };
}

// New interface for office/property registry
export interface OfficeRegistry {
  id: string;
  consumptionId: string;
  consumptionType: ConsumptionType;
  groupId: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isOwner?: boolean; // Flag to indicate if owner or tenant
  squareMeters?: number; // Square meters of the property
  thousandthQuota?: number; // "Quota millesimale" for condominium calculations
}

// New interface for company/condominium information
export interface CompanyInfo {
  id: string;
  name: string; // Company/Condominium name
  type: 'company' | 'condominium'; // Type of organization
  address?: string;
  vatNumber?: string;
  administrator?: {
    name: string;
    email?: string;
    phone?: string;
  };
  logoUrl?: string; // URL to the logo image
}
