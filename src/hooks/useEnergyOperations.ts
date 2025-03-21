
import React from 'react';
import { 
  ConsumptionData, 
  ConsumptionType, 
  BillData, 
  CalculationResult, 
  ConsumptionGroup 
} from '@/types';
import { StorageData } from '@/types/energy-storage';
import { 
  groupConsumptionData, 
  getGroupItems, 
  getGroupGeneralCounters, 
  updateGroup, 
  addGroup, 
  deleteGroup 
} from '@/utils/group-operations';
import { 
  updateConsumption as updateConsumptionUtil, 
  resetConsumptionData as resetConsumptionDataUtil, 
  calculateResults as calculateResultsUtil 
} from '@/utils/consumption-operations';
import { 
  updateBillAmount as updateBillAmountUtil, 
  formatThresholdsForStorage 
} from '@/utils/bill-operations';

// Main hook for energy operations
export const useEnergyOperations = (
  storedData: StorageData,
  updateStorage: (data: StorageData) => void
) => {
  // Use stored data or initialize with defaults
  const officeData = storedData.officeData || [];
  const acData = storedData.acData || [];
  const officeBill = storedData.officeBill || { totalAmount: 0, billDate: new Date() };
  const acBill = storedData.acBill || { totalAmount: 0, billDate: new Date() };
  const results = storedData.results || [];
  const groups = storedData.groups || [];
  const thresholds = storedData.thresholds?.reduce((acc, item) => {
    acc[item.consumptionId] = item.threshold;
    return acc;
  }, {} as Record<string, number>) || {};
  
  // Current result for display
  const [currentResult, setCurrentResult] = React.useState<CalculationResult | null>(
    results.length > 0 ? results[0] : null
  );
  
  // Group data by group ID
  const groupedOfficeData = groupConsumptionData(officeData, groups);
  const groupedAcData = groupConsumptionData(acData, groups);
  
  // Update consumption value
  const updateConsumption = (type: ConsumptionType, id: string, kwh: number) => {
    if (type === 'office') {
      const updatedData = updateConsumptionUtil(officeData, id, kwh);
      updateStorage({ ...storedData, officeData: updatedData });
    } else {
      const updatedData = updateConsumptionUtil(acData, id, kwh);
      updateStorage({ ...storedData, acData: updatedData });
    }
  };
  
  // Update bill amount
  const updateBillAmount = (
    type: ConsumptionType, 
    amount: number, 
    groupId?: string,
    providerName?: string,
    billNumber?: string
  ) => {
    if (type === 'office') {
      const updatedBill = updateBillAmountUtil(
        type,
        officeBill,
        amount,
        groupId,
        providerName,
        billNumber
      );
      updateStorage({ ...storedData, officeBill: updatedBill });
    } else {
      const updatedBill = updateBillAmountUtil(
        type,
        acBill,
        amount,
        groupId,
        providerName,
        billNumber
      );
      updateStorage({ ...storedData, acBill: updatedBill });
    }
  };
  
  // Set threshold for a consumption item
  const setThreshold = (type: ConsumptionType, id: string, value: number) => {
    const updatedThresholds = { ...thresholds, [id]: value };
    
    // Format for storage
    const thresholdItems = formatThresholdsForStorage(updatedThresholds);
    
    updateStorage({ 
      ...storedData, 
      thresholds: thresholdItems
    });
  };
  
  // Calculate results
  const calculateResults = () => {
    const result = calculateResultsUtil(officeData, acData, officeBill, acBill, groups);
    
    // Add to results and save
    const updatedResults = [result, ...results];
    updateStorage({ 
      ...storedData, 
      results: updatedResults 
    });
    
    // Set as current
    setCurrentResult(result);
    
    return result;
  };
  
  // Reset consumption data
  const resetConsumptionData = (type: ConsumptionType, groupId?: string) => {
    if (type === 'office') {
      const updatedData = resetConsumptionDataUtil(officeData, groupId);
      updateStorage({ ...storedData, officeData: updatedData });
    } else {
      const updatedData = resetConsumptionDataUtil(acData, groupId);
      updateStorage({ ...storedData, acData: updatedData });
    }
  };
  
  // Load a specific result
  const loadResult = (id: string) => {
    const result = results.find(r => r.id === id);
    if (result) {
      setCurrentResult(result);
    }
  };
  
  // Delete a result
  const deleteResult = (id: string) => {
    const updatedResults = results.filter(r => r.id !== id);
    updateStorage({ ...storedData, results: updatedResults });
    
    if (currentResult?.id === id) {
      setCurrentResult(updatedResults.length > 0 ? updatedResults[0] : null);
    }
  };

  // Update group using utility function
  const handleUpdateGroup = (groupId: string, data: Partial<ConsumptionGroup>) => {
    const updatedGroups = updateGroup(groups, groupId, data);
    updateStorage({ ...storedData, groups: updatedGroups });
  };
  
  // Add group using utility function
  const handleAddGroup = (
    name: string, 
    type: ConsumptionType, 
    propertyType?: string, 
    propertyNumber?: string,
    numberOfUnits?: number,
    parentGroupId?: string
  ): string => {
    const { id, updatedGroups } = addGroup(
      groups, 
      name, 
      type, 
      propertyType, 
      propertyNumber, 
      numberOfUnits, 
      parentGroupId
    );
    
    updateStorage({ ...storedData, groups: updatedGroups });
    
    return id;
  };
  
  // Delete group using utility function
  const handleDeleteGroup = (groupId: string): boolean => {
    const result = deleteGroup(groups, officeData, acData, groupId);
    
    if (result.success) {
      updateStorage({ 
        ...storedData, 
        groups: result.updatedGroups!,
        officeData: result.updatedOfficeData!,
        acData: result.updatedAcData!
      });
    }
    
    return result.success;
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
    getGroupItems: (type: ConsumptionType, groupId: string) => 
      getGroupItems(type === 'office' ? officeData : acData, groupId),
    getGroupGeneralCounters: (type: ConsumptionType, groupId: string) => 
      getGroupGeneralCounters(type === 'office' ? officeData : acData, groupId),
    updateGroup: handleUpdateGroup,
    addGroup: handleAddGroup,
    deleteGroup: handleDeleteGroup
  };
};
