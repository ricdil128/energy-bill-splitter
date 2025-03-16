
export interface ConsumptionData {
  id: string;
  name: string;
  kwh: number;
  cost?: number; // Calculated based on total bill
  percentage?: number; // Percentage of total consumption
  month?: string; // Optional month data for historical tracking
}

export interface BillData {
  totalAmount: number;
  billDate: Date;
  description?: string;
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
}
