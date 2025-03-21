
import { useState, useEffect } from 'react';
import { CalculationResult, ConsumptionData, BillData, ConsumptionGroup, ThresholdAlert, MonthlyConsumption, ConsumptionTypeLabels } from '@/types';
import { useAuth } from './useAuth';
import { DEFAULT_CONSUMPTION_TYPE_LABELS } from '@/context/energy-context-types';
import { StorageData, EnergyStorageHook } from '@/types/energy-storage';
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/storage-utils';
import { 
  saveGroupsToSupabase,
  saveThresholdsToSupabase,
  saveCalculationResultToSupabase,
  loadGroupsFromSupabase,
  loadResultsFromSupabase,
  loadThresholdsFromSupabase
} from '@/utils/db-utils';
import { 
  STORAGE_KEY_GROUPS,
  STORAGE_KEY_RESULTS,
  STORAGE_KEY_THRESHOLDS
} from '@/constants/storage-keys';

// Export StorageData type for use in other components
export type { StorageData } from '@/types/energy-storage';

export function useEnergyStorage(): EnergyStorageHook {
  const [officeData, setOfficeData] = useState<ConsumptionData[]>([]);
  const [acData, setAcData] = useState<ConsumptionData[]>([]);
  const [officeBill, setOfficeBill] = useState<BillData | null>(null);
  const [acBill, setAcBill] = useState<BillData | null>(null);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [consumptionGroups, setConsumptionGroups] = useState<ConsumptionGroup[]>([]);
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([]);
  const [monthlyConsumptionData, setMonthlyConsumptionData] = useState<MonthlyConsumption[]>([]);
  const [consumptionTypeLabels, setConsumptionTypeLabels] = useState<ConsumptionTypeLabels>(DEFAULT_CONSUMPTION_TYPE_LABELS);
  
  const { user } = useAuth();
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Initialize with default values
      let storedData = loadFromLocalStorage();
      
      if (user) {
        // Load data from Supabase if user is logged in
        const dbGroups = await loadGroupsFromSupabase(user.id);
        const dbResults = await loadResultsFromSupabase(user.id);
        const dbThresholds = await loadThresholdsFromSupabase(user.id);
        
        // Merge with localStorage data, preferring Supabase data
        storedData = {
          ...storedData,
          groups: dbGroups.length > 0 ? dbGroups : storedData.groups,
          results: dbResults.length > 0 ? dbResults : storedData.results,
          thresholds: dbThresholds.length > 0 ? dbThresholds : storedData.thresholds
        };
      }
      
      // Update state with loaded data
      setOfficeData(storedData.officeData || []);
      setAcData(storedData.acData || []);
      setOfficeBill(storedData.officeBill || null);
      setAcBill(storedData.acBill || null);
      setCalculationResults(storedData.results || []);
      setConsumptionGroups(storedData.groups || []);
      setThresholdAlerts(storedData.thresholds || []);
      setMonthlyConsumptionData(storedData.monthlyConsumptionData || []);
      setConsumptionTypeLabels(storedData.consumptionTypeLabels || DEFAULT_CONSUMPTION_TYPE_LABELS);
    };
    
    loadData();
  }, [user]);
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave: StorageData = {
      officeData,
      acData,
      officeBill,
      acBill,
      results: calculationResults,
      groups: consumptionGroups,
      thresholds: thresholdAlerts,
      monthlyConsumptionData,
      consumptionTypeLabels
    };
    
    saveToLocalStorage(dataToSave);
  }, [
    officeData, 
    acData, 
    officeBill, 
    acBill, 
    calculationResults, 
    consumptionGroups, 
    thresholdAlerts, 
    monthlyConsumptionData,
    consumptionTypeLabels
  ]);
  
  // Save data to database when authenticated
  const saveData = async <T>(key: string, data: T): Promise<boolean> => {
    if (!user) {
      console.warn('User not logged in, data not saved to database.');
      return false;
    }
    
    try {
      switch (key) {
        case STORAGE_KEY_GROUPS:
          return await saveGroupsToSupabase(data as ConsumptionGroup[], user.id);
          
        case STORAGE_KEY_THRESHOLDS:
          return await saveThresholdsToSupabase(data as ThresholdAlert[], user.id);
          
        default:
          console.warn(`No Supabase table for storage key: ${key}, storing in localStorage only`);
          return true;
      }
    } catch (error) {
      console.error(`Error saving data to Supabase for key ${key}:`, error);
      return false;
    }
  };

  // Save a calculation result
  const saveCalculationResult = async (result: CalculationResult): Promise<boolean> => {
    try {
      // Update local state
      const results = [...calculationResults];
      results.unshift(result);
      setCalculationResults(results);
      
      // Save to Supabase if logged in
      if (user) {
        return await saveCalculationResultToSupabase(result, user.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving calculation:', error);
      return false;
    }
  };
  
  // Get all stored data
  const getStoredData = (): StorageData => ({
    officeData,
    acData,
    officeBill,
    acBill,
    results: calculationResults,
    groups: consumptionGroups,
    thresholds: thresholdAlerts,
    monthlyConsumptionData,
    consumptionTypeLabels
  });
  
  // Return hook interface
  return {
    getStoredData,
    setOfficeData,
    setAcData,
    setOfficeBill,
    setAcBill,
    setCalculationResults,
    setConsumptionGroups,
    setThresholdAlerts,
    setMonthlyConsumptionData,
    setConsumptionTypeLabels,
    saveData,
    saveCalculationResult
  };
}
