
import { useState, useEffect } from 'react';
import { 
  ConsumptionData, 
  BillData, 
  CalculationResult, 
  ConsumptionType,
  ConsumptionGroup,
  GroupedConsumptionData,
  ThresholdAlert
} from '@/types';
import { 
  generateInitialConsumptionData,
  generateGeneralCounters,
  performFullCalculation,
  checkThreshold,
  groupConsumptionData
} from '@/utils/calculations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StorageData } from './useEnergyStorage';
import { 
  DEFAULT_GROUPS, 
  GROUP_COLABORA1, 
  GROUP_COLABORA2 
} from '@/context/energy-context-types';

// Update the interface for the stored data
interface StoredData {
  officeData: ConsumptionData[];
  acData: ConsumptionData[];
  officeBill: BillData | null;
  acBill: BillData | null;
  calculationResults: CalculationResult[];
  consumptionGroups: ConsumptionGroup[];
  thresholdAlerts: ThresholdAlert[];
  monthlyConsumptionData: any[];
}

export function useEnergyOperations(
  initialData: StoredData,
  onDataChange: (data: StorageData) => void
) {
  // Initialize groups
  const [groups, setGroups] = useState<ConsumptionGroup[]>(
    initialData.consumptionGroups.length > 0 ? initialData.consumptionGroups : DEFAULT_GROUPS
  );
  
  // Initialize state for consumption data
  const [officeData, setOfficeData] = useState<ConsumptionData[]>(() => {
    if (initialData.officeData.length > 0) {
      return initialData.officeData;
    }
    const colabora1Offices = generateInitialConsumptionData(9, 'office', GROUP_COLABORA1, 'Ufficio');
    const colabora2Offices = generateInitialConsumptionData(6, 'office', GROUP_COLABORA2, 'Ufficio');
    return [...colabora1Offices, ...colabora2Offices];
  });
  
  const [acData, setAcData] = useState<ConsumptionData[]>(() => {
    if (initialData.acData.length > 0) {
      return initialData.acData;
    }
    const colabora1AC = generateInitialConsumptionData(9, 'ac', GROUP_COLABORA1, 'AC');
    const colabora2AC = generateInitialConsumptionData(6, 'ac', GROUP_COLABORA2, 'AC');
    
    // General counters
    const colabora1General = generateGeneralCounters(1, GROUP_COLABORA1, 'Collabora 1');
    const colabora2General = generateGeneralCounters(2, GROUP_COLABORA2, 'Collabora 2');
    
    return [...colabora1AC, ...colabora2AC, ...colabora1General, ...colabora2General];
  });
  
  // Group consumption data for easier access
  const [groupedOfficeData, setGroupedOfficeData] = useState<GroupedConsumptionData>(
    groupConsumptionData(officeData, groups)
  );
  
  const [groupedAcData, setGroupedAcData] = useState<GroupedConsumptionData>(
    groupConsumptionData(acData, groups)
  );
  
  // Update grouped data when raw data changes
  useEffect(() => {
    setGroupedOfficeData(groupConsumptionData(officeData, groups));
  }, [officeData, groups]);
  
  useEffect(() => {
    setGroupedAcData(groupConsumptionData(acData, groups));
  }, [acData, groups]);
  
  // Initialize bills
  const [officeBill, setOfficeBill] = useState<BillData>({
    totalAmount: initialData.officeBill?.totalAmount || 0,
    billDate: initialData.officeBill?.billDate || new Date(),
    description: initialData.officeBill?.description,
    groupId: initialData.officeBill?.groupId,
    providerName: initialData.officeBill?.providerName,
    billNumber: initialData.officeBill?.billNumber
  });
  
  const [acBill, setAcBill] = useState<BillData>({
    totalAmount: initialData.acBill?.totalAmount || 0,
    billDate: initialData.acBill?.billDate || new Date(),
    description: initialData.acBill?.description,
    groupId: initialData.acBill?.groupId,
    providerName: initialData.acBill?.providerName,
    billNumber: initialData.acBill?.billNumber
  });
  
  // Initialize results and thresholds
  const [results, setResults] = useState<CalculationResult[]>(initialData.calculationResults || []);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  
  // Convert ThresholdAlert array to a simple Record for easier access
  const [thresholds, setThresholds] = useState<Record<string, number>>(() => {
    const thresholdMap: Record<string, number> = {};
    initialData.thresholdAlerts.forEach(alert => {
      thresholdMap[alert.consumptionId] = alert.threshold;
    });
    return thresholdMap;
  });
  
  // Helper method to get items for a specific group
  const getGroupItems = (type: ConsumptionType, groupId: string): ConsumptionData[] => {
    const data = type === 'office' ? officeData : acData;
    return data.filter(item => item.groupId === groupId && !item.isGeneral);
  };
  
  // Helper method to get general counters for a specific group
  const getGroupGeneralCounters = (type: ConsumptionType, groupId: string): ConsumptionData[] => {
    const data = type === 'office' ? officeData : acData;
    return data.filter(item => item.groupId === groupId && item.isGeneral);
  };
  
  // Update consumption data for a specific item
  const updateConsumption = (type: ConsumptionType, id: string, kwh: number) => {
    if (type === 'office') {
      setOfficeData(prev => 
        prev.map(item => 
          item.id === id ? { ...item, kwh } : item
        )
      );
    } else {
      setAcData(prev => 
        prev.map(item => 
          item.id === id ? { ...item, kwh } : item
        )
      );
    }
  };
  
  // Update bill amount and details
  const updateBillAmount = (
    type: ConsumptionType, 
    amount: number, 
    groupId?: string, 
    providerName?: string, 
    billNumber?: string
  ) => {
    if (type === 'office') {
      setOfficeBill(prev => ({ 
        ...prev, 
        totalAmount: amount, 
        groupId,
        providerName: providerName || prev.providerName,
        billNumber: billNumber || prev.billNumber
      }));
    } else {
      setAcBill(prev => ({ 
        ...prev, 
        totalAmount: amount, 
        groupId,
        providerName: providerName || prev.providerName,
        billNumber: billNumber || prev.billNumber
      }));
    }
  };
  
  // Update a group's properties
  const updateGroup = (groupId: string, data: Partial<ConsumptionGroup>) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId ? { ...group, ...data } : group
      )
    );
    
    // Save to storage
    onDataChange({
      groups: groups.map(group => 
        group.id === groupId ? { ...group, ...data } : group
      )
    });
    
    toast.success("Informazioni proprietà aggiornate");
  };
  
  // Calculate and store results
  const calculateResults = () => {
    // Validate inputs
    if (officeBill.totalAmount <= 0 || acBill.totalAmount <= 0) {
      toast.error("Please enter valid bill amounts");
      return;
    }
    
    const officeKwhTotal = officeData
      .filter(item => !item.isGeneral)
      .reduce((sum, item) => sum + item.kwh, 0);
      
    const acKwhTotal = acData
      .filter(item => !item.isGeneral)
      .reduce((sum, item) => sum + item.kwh, 0);
    
    if (officeKwhTotal <= 0 || acKwhTotal <= 0) {
      toast.error("Please enter consumption data");
      return;
    }
    
    // Perform calculations
    const result = performFullCalculation(officeData, acData, officeBill, acBill, groups);
    setCurrentResult(result);
    
    // Add to results history
    const updatedResults = [result, ...results];
    setResults(updatedResults);
    
    // Save to storage
    onDataChange({
      results: updatedResults,
      thresholds,
      groups
    });
    
    // Check for threshold alerts
    const officeAlerts = checkThreshold(result.officeData, thresholds);
    const acAlerts = checkThreshold(result.acData, thresholds);
    
    if (officeAlerts.length > 0 || acAlerts.length > 0) {
      const alertItems = [...officeAlerts, ...acAlerts].join(', ');
      toast.warning(`Threshold exceeded: ${alertItems}`);
    }
    
    toast.success("Calculation completed");
  };
  
  // Set threshold for a specific consumption item
  const setThreshold = (type: ConsumptionType, id: string, value: number) => {
    const updatedThresholds = {
      ...thresholds,
      [id]: value
    };
    
    setThresholds(updatedThresholds);
    
    // Save to storage
    onDataChange({
      results,
      thresholds: updatedThresholds,
      groups
    });
    
    toast.success(`Threshold set for ${type === 'office' ? 'Office' : 'AC'}`);
  };
  
  // Reset consumption data
  const resetConsumptionData = (type: ConsumptionType, groupId?: string) => {
    if (type === 'office') {
      if (groupId) {
        // Reset only specific group
        setOfficeData(prev => {
          return prev.map(item => 
            item.groupId === groupId ? { ...item, kwh: 0 } : item
          );
        });
      } else {
        // Reset all office data
        const colabora1Offices = generateInitialConsumptionData(9, 'office', GROUP_COLABORA1, 'Ufficio');
        const colabora2Offices = generateInitialConsumptionData(6, 'office', GROUP_COLABORA2, 'Ufficio');
        setOfficeData([...colabora1Offices, ...colabora2Offices]);
      }
    } else {
      if (groupId) {
        // Reset only specific group
        setAcData(prev => {
          return prev.map(item => 
            item.groupId === groupId ? { ...item, kwh: 0 } : item
          );
        });
      } else {
        // Reset all AC data
        const colabora1AC = generateInitialConsumptionData(9, 'ac', GROUP_COLABORA1, 'AC');
        const colabora2AC = generateInitialConsumptionData(6, 'ac', GROUP_COLABORA2, 'AC');
        
        // General counters
        const colabora1General = generateGeneralCounters(1, GROUP_COLABORA1, 'Collabora 1');
        const colabora2General = generateGeneralCounters(2, GROUP_COLABORA2, 'Collabora 2');
        
        setAcData([...colabora1AC, ...colabora2AC, ...colabora1General, ...colabora2General]);
      }
    }
    
    toast.info(`${type === 'office' ? 'Office' : 'AC'} data reset${groupId ? ' for group' : ''}`);
  };
  
  // Load a specific result
  const loadResult = (id: string) => {
    const result = results.find(r => r.id === id);
    if (result) {
      setCurrentResult(result);
      toast.info(`Loaded calculation from ${format(result.date, 'PPpp')}`);
    }
  };
  
  // Delete a specific result
  const deleteResult = (id: string) => {
    const updatedResults = results.filter(r => r.id !== id);
    setResults(updatedResults);
    
    // Save to storage
    onDataChange({
      results: updatedResults,
      thresholds,
      groups
    });
    
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
    
    toast.success("Calculation deleted");
  };
  
  return {
    officeData,
    acData,
    officeBill,
    acBill,
    results,
    currentResult,
    thresholds,
    groups,
    groupedOfficeData,
    groupedAcData,
    updateConsumption,
    updateBillAmount,
    calculateResults,
    setThreshold,
    resetConsumptionData,
    loadResult,
    deleteResult,
    getGroupItems,
    getGroupGeneralCounters,
    updateGroup
  };
}
