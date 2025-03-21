import React from 'react';
import { 
  ConsumptionData, 
  ConsumptionType, 
  BillData, 
  CalculationResult, 
  ConsumptionGroup 
} from '@/types';
import { StorageData } from '@/hooks/useEnergyStorage';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Helper to group consumption data
  function groupConsumptionData(data: ConsumptionData[], groups: ConsumptionGroup[]) {
    const groupedData: Record<string, {
      name: string;
      propertyType?: string;
      propertyNumber?: string;
      numberOfUnits?: number;
      items: ConsumptionData[];
      generalCounters?: ConsumptionData[];
      parentGroupId?: string;
    }> = {};
    
    // Initialize with all groups
    groups.forEach(group => {
      groupedData[group.id] = {
        name: group.name,
        propertyType: group.propertyType,
        propertyNumber: group.propertyNumber,
        numberOfUnits: group.numberOfUnits,
        parentGroupId: group.parentGroupId,
        items: [],
        generalCounters: []
      };
    });
    
    // Group the data
    data.forEach(item => {
      const groupId = item.groupId || '';
      
      if (groupedData[groupId]) {
        if (item.isGeneral) {
          groupedData[groupId].generalCounters?.push(item);
        } else {
          groupedData[groupId].items.push(item);
        }
      }
    });
    
    return groupedData;
  }
  
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
  
  // Update consumption value
  const updateConsumption = (type: ConsumptionType, id: string, kwh: number) => {
    if (type === 'office') {
      const updatedData = officeData.map(item => 
        item.id === id ? { ...item, kwh } : item
      );
      updateStorage({ ...storedData, officeData: updatedData });
    } else {
      const updatedData = acData.map(item => 
        item.id === id ? { ...item, kwh } : item
      );
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
      const updatedBill = { 
        ...officeBill, 
        totalAmount: amount,
        groupId,
        providerName,
        billNumber
      };
      updateStorage({ ...storedData, officeBill: updatedBill });
    } else {
      const updatedBill = { 
        ...acBill, 
        totalAmount: amount,
        groupId,
        providerName,
        billNumber
      };
      updateStorage({ ...storedData, acBill: updatedBill });
    }
  };
  
  // Set threshold for a consumption item
  const setThreshold = (type: ConsumptionType, id: string, value: number) => {
    const updatedThresholds = { ...thresholds, [id]: value };
    
    // Format for storage
    const thresholdItems = Object.entries(updatedThresholds).map(([consumptionId, threshold]) => ({
      consumptionId,
      threshold,
      type: consumptionId.includes('ac') ? 'ac' as ConsumptionType : 'office' as ConsumptionType,
      active: true
    }));
    
    updateStorage({ 
      ...storedData, 
      thresholds: thresholdItems
    });
  };
  
  // Calculate results
  const calculateResults = () => {
    // Get total consumption
    const officeTotal = officeData.reduce((total, item) => total + item.kwh, 0);
    const acTotal = acData.reduce((total, item) => total + item.kwh, 0);
    
    // Calculate percentages and costs
    const calculatedOfficeData = officeData.map(item => ({
      ...item,
      percentage: (item.kwh / officeTotal) * 100,
      cost: (item.kwh / officeTotal) * officeBill.totalAmount
    }));
    
    const calculatedAcData = acData.map(item => ({
      ...item,
      percentage: (item.kwh / acTotal) * 100,
      cost: (item.kwh / acTotal) * acBill.totalAmount
    }));
    
    // Create result object
    const result: CalculationResult = {
      id: uuidv4(),
      date: new Date(),
      officeData: calculatedOfficeData,
      acData: calculatedAcData,
      officeBill,
      acBill,
      officeTotal,
      acTotal,
      groups: [...groups]
    };
    
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
      const updatedData = groupId 
        ? officeData.map(item => (
            item.groupId === groupId ? { ...item, kwh: 0 } : item
          ))
        : officeData.map(item => ({ ...item, kwh: 0 }));
      
      updateStorage({ ...storedData, officeData: updatedData });
    } else {
      const updatedData = groupId 
        ? acData.map(item => (
            item.groupId === groupId ? { ...item, kwh: 0 } : item
          ))
        : acData.map(item => ({ ...item, kwh: 0 }));
      
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

  // Update an existing group
  const updateGroup = (groupId: string, data: Partial<ConsumptionGroup>) => {
    const updatedGroups = groups.map(group => 
      group.id === groupId ? { ...group, ...data } : group
    );
    updateStorage({ ...storedData, groups: updatedGroups });
  };
  
  // Add a new group
  const addGroup = (
    name: string, 
    type: ConsumptionType, 
    propertyType?: string, 
    propertyNumber?: string,
    numberOfUnits?: number,
    parentGroupId?: string
  ): string => {
    const id = uuidv4();
    const newGroup: ConsumptionGroup = { 
      id, 
      name, 
      type,
      propertyType,
      propertyNumber,
      numberOfUnits,
      parentGroupId
    };
    
    const updatedGroups = [...groups, newGroup];
    updateStorage({ ...storedData, groups: updatedGroups });
    
    return id;
  };
  
  // Delete a group and its associated data
  const deleteGroup = (groupId: string): boolean => {
    // Check if group exists
    if (!groups.find(g => g.id === groupId)) {
      return false;
    }
    
    // Filter out groups
    const updatedGroups = groups.filter(g => g.id !== groupId);
    
    // Filter out office data for this group
    const updatedOfficeData = officeData.filter(item => item.groupId !== groupId);
    
    // Filter out AC data for this group
    const updatedAcData = acData.filter(item => item.groupId !== groupId);
    
    // Update storage
    updateStorage({ 
      ...storedData, 
      groups: updatedGroups,
      officeData: updatedOfficeData,
      acData: updatedAcData
    });
    
    return true;
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
    updateGroup,
    addGroup,
    deleteGroup
  };
};
