
import { ConsumptionData, BillData, CalculationResult, ConsumptionGroup, ThresholdAlert, MonthlyConsumption, ConsumptionTypeLabels } from '@/types';

// Define StorageData type
export interface StorageData {
  officeData?: ConsumptionData[];
  acData?: ConsumptionData[];
  officeBill?: BillData | null;
  acBill?: BillData | null;
  results?: CalculationResult[];
  groups?: ConsumptionGroup[];
  thresholds?: ThresholdAlert[]; 
  monthlyConsumptionData?: MonthlyConsumption[];
  consumptionTypeLabels?: ConsumptionTypeLabels;
}

// Define hook returns type
export interface EnergyStorageHook {
  getStoredData: () => StorageData;
  setOfficeData: (data: ConsumptionData[]) => void;
  setAcData: (data: ConsumptionData[]) => void;
  setOfficeBill: (data: BillData | null) => void;
  setAcBill: (data: BillData | null) => void;
  setCalculationResults: (data: CalculationResult[]) => void;
  setConsumptionGroups: (data: ConsumptionGroup[]) => void;
  setThresholdAlerts: (data: ThresholdAlert[]) => void;
  setMonthlyConsumptionData: (data: MonthlyConsumption[]) => void;
  setConsumptionTypeLabels: (data: ConsumptionTypeLabels) => void;
  saveData: <T>(key: string, data: T) => Promise<boolean>;
  saveCalculationResult: (result: CalculationResult) => Promise<boolean>;
}
