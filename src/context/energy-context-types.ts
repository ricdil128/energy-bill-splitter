
import { 
  ConsumptionData, 
  BillData, 
  CalculationResult, 
  ConsumptionType,
  ConsumptionGroup,
  GroupedConsumptionData
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
  groups: ConsumptionGroup[];
  groupedOfficeData: GroupedConsumptionData;
  groupedAcData: GroupedConsumptionData;
  updateConsumption: (type: ConsumptionType, id: string, kwh: number) => void;
  updateBillAmount: (type: ConsumptionType, amount: number, groupId?: string) => void;
  calculateResults: () => void;
  setThreshold: (type: ConsumptionType, id: string, value: number) => void;
  resetConsumptionData: (type: ConsumptionType, groupId?: string) => void;
  loadResult: (id: string) => void;
  deleteResult: (id: string) => void;
  getGroupItems: (type: ConsumptionType, groupId: string) => ConsumptionData[];
  getGroupGeneralCounters: (type: ConsumptionType, groupId: string) => ConsumptionData[];
}

// The key we'll use to store results in localStorage
export const STORAGE_KEY = 'energy-bill-splitter-data';

// Group IDs
export const GROUP_COLABORA1 = 'colabora1';
export const GROUP_COLABORA2 = 'colabora2';

// Default groups configuration
export const DEFAULT_GROUPS: ConsumptionGroup[] = [
  { id: GROUP_COLABORA1, name: 'Colabora 1', type: 'office' },
  { id: GROUP_COLABORA2, name: 'Colabora 2', type: 'office' }
];
