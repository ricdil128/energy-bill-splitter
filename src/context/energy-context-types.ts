
import { 
  ConsumptionData, 
  BillData, 
  CalculationResult, 
  ConsumptionType,
  ConsumptionGroup,
  GroupedConsumptionData,
  CompanyInfo,
  ConsumptionTypeLabels
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
  companyInfo: CompanyInfo | null;
  consumptionTypeLabels: ConsumptionTypeLabels;
  updateConsumption: (type: ConsumptionType, id: string, kwh: number) => void;
  updateBillAmount: (type: ConsumptionType, amount: number, groupId?: string, providerName?: string, billNumber?: string) => void;
  calculateResults: () => void;
  setThreshold: (type: ConsumptionType, id: string, value: number) => void;
  resetConsumptionData: (type: ConsumptionType, groupId?: string) => void;
  loadResult: (id: string) => void;
  deleteResult: (id: string) => void;
  getGroupItems: (type: ConsumptionType, groupId: string) => ConsumptionData[];
  getGroupGeneralCounters: (type: ConsumptionType, groupId: string) => ConsumptionData[];
  updateGroup: (groupId: string, data: Partial<ConsumptionGroup>) => void;
  addGroup: (name: string, type: ConsumptionType, propertyType?: string, propertyNumber?: string, numberOfUnits?: number, parentGroupId?: string) => string;
  deleteGroup: (groupId: string) => boolean;
  saveCompanyInfo: (info: CompanyInfo) => Promise<boolean>;
  updateConsumptionTypeLabel: (type: ConsumptionType, label: string) => void;
  getConsumptionTypeLabel: (type: ConsumptionType) => string;
}

// The key we'll use to store results in localStorage
export const STORAGE_KEY = 'energy-bill-splitter-data';

// Group IDs
export const GROUP_COLABORA1 = 'colabora1';
export const GROUP_COLABORA2 = 'colabora2';

// Default groups configuration
export const DEFAULT_GROUPS: ConsumptionGroup[] = [
  { 
    id: GROUP_COLABORA1, 
    name: 'Collabora 1', 
    type: 'office',
    propertyType: 'Uffici',
    propertyNumber: '1'
  },
  { 
    id: GROUP_COLABORA2, 
    name: 'Collabora 2', 
    type: 'office',
    propertyType: 'Uffici',
    propertyNumber: '2'
  }
];

// Default consumption type labels
export const DEFAULT_CONSUMPTION_TYPE_LABELS: ConsumptionTypeLabels = {
  office: 'Uffici',
  ac: 'Aria Condizionata'
};
