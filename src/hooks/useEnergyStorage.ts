
import { useState, useEffect } from 'react';
import { CalculationResult, ConsumptionData, BillData, ConsumptionGroup, ThresholdAlert, MonthlyConsumption, OfficeRegistry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY_OFFICE = 'office-consumption-data';
const STORAGE_KEY_AC = 'ac-consumption-data';
const STORAGE_KEY_OFFICE_BILL = 'office-bill-data';
const STORAGE_KEY_AC_BILL = 'ac-bill-data';
const STORAGE_KEY_RESULTS = 'calculation-results';
const STORAGE_KEY_GROUPS = 'consumption-groups';
const STORAGE_KEY_THRESHOLDS = 'threshold-alerts';
const STORAGE_KEY_MONTHLY_CONSUMPTION = 'monthly-consumption';

// Define StorageData type
export interface StorageData {
  officeData?: ConsumptionData[];
  acData?: ConsumptionData[];
  officeBill?: BillData | null;
  acBill?: BillData | null;
  results?: CalculationResult[];
  groups?: ConsumptionGroup[];
  thresholds?: Record<string, number>;
  monthlyConsumptionData?: MonthlyConsumption[];
}

export function useEnergyStorage() {
  const [officeData, setOfficeData] = useState<ConsumptionData[]>([]);
  const [acData, setAcData] = useState<ConsumptionData[]>([]);
  const [officeBill, setOfficeBill] = useState<BillData | null>(null);
  const [acBill, setAcBill] = useState<BillData | null>(null);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [consumptionGroups, setConsumptionGroups] = useState<ConsumptionGroup[]>([]);
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([]);
  const [monthlyConsumptionData, setMonthlyConsumptionData] = useState<MonthlyConsumption[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadData = async () => {
      let storedOfficeData: ConsumptionData[] = [];
      let storedAcData: ConsumptionData[] = [];
      let storedOfficeBill: BillData | null = null;
      let storedAcBill: BillData | null = null;
      let storedResults: CalculationResult[] = [];
      let storedGroups: ConsumptionGroup[] = [];
      let storedThresholds: ThresholdAlert[] = [];
      let storedMonthlyConsumption: MonthlyConsumption[] = [];
      
      if (user) {
        // Since we only have calculation_results, consumption_groups, office_registry and thresholds tables in Supabase,
        // we'll need to use localStorage for the other data for now
        
        // Load consumption groups from Supabase
        const { data: dbGroups } = await supabase
          .from('consumption_groups')
          .select('*')
          .eq('user_id', user.id);
          
        if (dbGroups) {
          storedGroups = dbGroups.map(group => ({
            id: group.id,
            name: group.name,
            type: group.type as any, // Cast to ConsumptionType
          }));
        }
        
        // Load calculation results from Supabase
        const { data: dbResults } = await supabase
          .from('calculation_results')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (dbResults) {
          storedResults = dbResults.map(result => ({
            id: result.id,
            date: new Date(result.date || new Date()),
            officeTotal: result.office_total,
            acTotal: result.ac_total,
            officeData: result.office_data as any,
            acData: result.ac_data as any,
            officeBill: result.office_bill as any,
            acBill: result.ac_bill as any,
            month: result.month || '',
            groups: result.groups as any || []
          }));
        }
        
        // Load thresholds from Supabase
        const { data: dbThresholds } = await supabase
          .from('thresholds')
          .select('*')
          .eq('user_id', user.id);
          
        if (dbThresholds) {
          storedThresholds = dbThresholds.map(threshold => ({
            type: threshold.consumption_type as any,
            consumptionId: threshold.consumption_id,
            threshold: threshold.threshold_value,
            active: threshold.active || true
          }));
        }
        
        // Load from localStorage for items not yet migrated to Supabase
        storedOfficeData = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICE) || '[]');
        storedAcData = JSON.parse(localStorage.getItem(STORAGE_KEY_AC) || '[]');
        storedOfficeBill = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICE_BILL) || 'null');
        storedAcBill = JSON.parse(localStorage.getItem(STORAGE_KEY_AC_BILL) || 'null');
        storedMonthlyConsumption = JSON.parse(localStorage.getItem(STORAGE_KEY_MONTHLY_CONSUMPTION) || '[]');
      } else {
        // Load data from localStorage
        storedOfficeData = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICE) || '[]');
        storedAcData = JSON.parse(localStorage.getItem(STORAGE_KEY_AC) || '[]');
        storedOfficeBill = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICE_BILL) || 'null');
        storedAcBill = JSON.parse(localStorage.getItem(STORAGE_KEY_AC_BILL) || 'null');
        storedResults = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
        storedGroups = JSON.parse(localStorage.getItem(STORAGE_KEY_GROUPS) || '[]');
        storedThresholds = JSON.parse(localStorage.getItem(STORAGE_KEY_THRESHOLDS) || '[]');
        storedMonthlyConsumption = JSON.parse(localStorage.getItem(STORAGE_KEY_MONTHLY_CONSUMPTION) || '[]');
      }
      
      setOfficeData(storedOfficeData);
      setAcData(storedAcData);
      setOfficeBill(storedOfficeBill);
      setAcBill(storedAcBill);
      setCalculationResults(storedResults);
      setConsumptionGroups(storedGroups);
      setThresholdAlerts(storedThresholds);
      setMonthlyConsumptionData(storedMonthlyConsumption);
    };
    
    loadData();
  }, [user]);
  
  // Save data to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OFFICE, JSON.stringify(officeData));
    localStorage.setItem(STORAGE_KEY_AC, JSON.stringify(acData));
    localStorage.setItem(STORAGE_KEY_OFFICE_BILL, JSON.stringify(officeBill));
    localStorage.setItem(STORAGE_KEY_AC_BILL, JSON.stringify(acBill));
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(calculationResults));
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(consumptionGroups));
    localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(thresholdAlerts));
    localStorage.setItem(STORAGE_KEY_MONTHLY_CONSUMPTION, JSON.stringify(monthlyConsumptionData));
  }, [officeData, acData, officeBill, acBill, calculationResults, consumptionGroups, thresholdAlerts, monthlyConsumptionData]);
  
  // Save data to database
  const saveData = async <T>(key: string, data: T): Promise<boolean> => {
    if (!user) {
      console.warn('User not logged in, data not saved to database.');
      return false;
    }
    
    try {
      switch (key) {
        case STORAGE_KEY_GROUPS:
          // Save consumption groups to Supabase
          const { error: groupsError } = await supabase
            .from('consumption_groups')
            .upsert(
              (data as ConsumptionGroup[]).map(group => ({
                id: group.id,
                name: group.name,
                type: group.type,
                user_id: user.id
              })),
              { onConflict: 'id' }
            );
          if (groupsError) throw groupsError;
          break;

        case STORAGE_KEY_RESULTS:
          // Save calculation results to Supabase
          // We'll handle this in the saveCalculationResult function
          break;

        case STORAGE_KEY_THRESHOLDS:
          // Save threshold alerts to Supabase
          const { error: thresholdsError } = await supabase
            .from('thresholds')
            .upsert(
              (data as ThresholdAlert[]).map(alert => ({
                consumption_id: alert.consumptionId,
                consumption_type: alert.type,
                threshold_value: alert.threshold,
                active: alert.active,
                user_id: user.id
              })),
              { onConflict: 'consumption_id' }
            );
          if (thresholdsError) throw thresholdsError;
          break;

        default:
          console.warn(`No Supabase table for storage key: ${key}, storing in localStorage only`);
          return true;
      }
      return true;
    } catch (error) {
      console.error(`Error saving data to Supabase for key ${key}:`, error);
      return false;
    }
  };

  // Save a calculation to the database or localStorage
  const saveCalculationResult = async (result: CalculationResult): Promise<boolean> => {
    try {
      if (user) {
        // Prepare data for Supabase (as JSON)
        const dbData = {
          date: result.date.toISOString(),
          office_total: result.officeTotal,
          ac_total: result.acTotal,
          office_data: JSON.stringify(result.officeData),
          ac_data: JSON.stringify(result.acData),
          office_bill: JSON.stringify(result.officeBill),
          ac_bill: JSON.stringify(result.acBill),
          month: result.month,
          groups: JSON.stringify(result.groups),
          user_id: user.id
        };
        
        // Insert into database
        const { error } = await supabase
          .from('calculation_results')
          .insert(dbData);
        
        if (error) throw error;
      }

      // Also update localStorage
      const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
      results.unshift(result);
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
      
      return true;
    } catch (error) {
      console.error('Error saving calculation:', error);
      return false;
    }
  };
  
  const getStoredData = () => ({
    officeData,
    acData,
    officeBill,
    acBill,
    calculationResults,
    consumptionGroups,
    thresholdAlerts,
    monthlyConsumptionData
  });
  
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
    saveData,
    saveCalculationResult
  };
}
