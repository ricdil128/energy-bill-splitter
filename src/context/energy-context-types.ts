
import { 
  ConsumptionData, 
  BillData, 
  CalculationResult, 
  ConsumptionType 
} from '@/types';

// Define the context shape
export interface EnergyContextType {
  officeData: ConsumptionData[];
  acData: ConsumptionData[];
  officeBill: BillData;
  acBill: BillData;
  results: CalculationResult[];
  currentResult: CalculationResult | null;
  thresholds: Record<string, number>;
  updateConsumption: (type: ConsumptionType, id: string, kwh: number) => void;
  updateBillAmount: (type: ConsumptionType, amount: number) => void;
  calculateResults: () => void;
  setThreshold: (type: ConsumptionType, id: string, value: number) => void;
  resetConsumptionData: (type: ConsumptionType) => void;
  loadResult: (id: string) => void;
  deleteResult: (id: string) => void;
}

// The key we'll use to store results in localStorage
export const STORAGE_KEY = 'energy-bill-splitter-data';
