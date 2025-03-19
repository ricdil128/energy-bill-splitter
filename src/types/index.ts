
export interface ConsumptionData {
  id: string;
  name: string;
  kwh: number;
  cost?: number; // Calculated based on total bill
  percentage?: number; // Percentage of total consumption
  month?: string; // Optional month data for historical tracking
  groupId?: string; // Group identifier for grouping consumption data
  isGeneral?: boolean; // Flag for general counter
}

export interface ConsumptionGroup {
  id: string;
  name: string;
  type: ConsumptionType;
}

export interface BillData {
  totalAmount: number;
  billDate: Date;
  description?: string;
  groupId?: string; // Group identifier
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
    items: ConsumptionData[];
    generalCounters?: ConsumptionData[];
  };
}
