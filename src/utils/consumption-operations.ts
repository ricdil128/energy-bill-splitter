
import { ConsumptionData, ConsumptionType, CalculationResult, BillData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Update consumption value
export const updateConsumption = (
  data: ConsumptionData[], 
  id: string, 
  kwh: number
): ConsumptionData[] => {
  return data.map(item => 
    item.id === id ? { ...item, kwh } : item
  );
};

// Reset consumption data
export const resetConsumptionData = (
  data: ConsumptionData[], 
  groupId?: string
): ConsumptionData[] => {
  return groupId 
    ? data.map(item => (
        item.groupId === groupId ? { ...item, kwh: 0 } : item
      ))
    : data.map(item => ({ ...item, kwh: 0 }));
};

// Calculate results
export const calculateResults = (
  officeData: ConsumptionData[],
  acData: ConsumptionData[],
  officeBill: BillData,
  acBill: BillData,
  groups: any[]
): CalculationResult => {
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
  
  return result;
};
