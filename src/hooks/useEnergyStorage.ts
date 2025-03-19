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
        // Load data from Supabase
        const { data: dbOfficeData } = await supabase
          .from('office_consumption')
          .select('*')
          .eq('user_id', user.id);
        storedOfficeData = dbOfficeData || [];
        
        const { data: dbAcData } = await supabase
          .from('ac_consumption')
          .select('*')
          .eq('user_id', user.id);
        storedAcData = dbAcData || [];
        
        const { data: dbOfficeBill } = await supabase
          .from('office_bills')
          .select('*')
          .eq('user_id', user.id)
          .order('bill_date', { ascending: false })
          .limit(1);
        storedOfficeBill = dbOfficeBill?.[0] || null;
        
        const { data: dbAcBill } = await supabase
          .from('ac_bills')
          .select('*')
          .eq('user_id', user.id)
          .order('bill_date', { ascending: false })
          .limit(1);
        storedAcBill = dbAcBill?.[0] || null;
        
        const { data: dbResults } = await supabase
          .from('calculation_results')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (dbResults) {
          storedResults = dbResults.map(result => ({
            ...result,
            date: new Date(result.date),
            officeData: result.office_data,
            acData: result.ac_data,
            officeBill: result.office_bill,
            acBill: result.ac_bill,
            officeTotal: result.office_total,
            acTotal: result.ac_total
          }));
        } else {
          storedResults = [];
        }
        
        const { data: dbGroups } = await supabase
          .from('consumption_groups')
          .select('*')
          .eq('user_id', user.id);
        storedGroups = dbGroups || [];
        
        const { data: dbThresholds } = await supabase
          .from('threshold_alerts')
          .select('*')
          .eq('user_id', user.id);
        storedThresholds = dbThresholds || [];

        const { data: dbMonthlyConsumption } = await supabase
          .from('monthly_consumption')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: false });
        storedMonthlyConsumption = dbMonthlyConsumption || [];
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
        case STORAGE_KEY_OFFICE:
          // Save office data to Supabase
          const { error: officeError } = await supabase
            .from('office_consumption')
            .upsert(
              (data as ConsumptionData[]).map(item => ({
                id: item.id,
                name: item.name,
                kwh: item.kwh,
                cost: item.cost,
                percentage: item.percentage,
                month: item.month,
                group_id: item.groupId,
                is_general: item.isGeneral,
                user_id: user.id
              })),
              { onConflict: 'id' }
            );
          if (officeError) throw officeError;
          break;
        case STORAGE_KEY_AC:
          // Save AC data to Supabase
          const { error: acError } = await supabase
            .from('ac_consumption')
            .upsert(
              (data as ConsumptionData[]).map(item => ({
                id: item.id,
                name: item.name,
                kwh: item.kwh,
                cost: item.cost,
                percentage: item.percentage,
                month: item.month,
                group_id: item.groupId,
                is_general: item.isGeneral,
                user_id: user.id
              })),
              { onConflict: 'id' }
            );
          if (acError) throw acError;
          break;
        case STORAGE_KEY_OFFICE_BILL:
          // Save office bill to Supabase
          const officeBillData = data as BillData;
          const { error: officeBillError } = await supabase
            .from('office_bills')
            .upsert(
              {
                total_amount: officeBillData.totalAmount,
                bill_date: officeBillData.billDate.toISOString(),
                description: officeBillData.description,
                group_id: officeBillData.groupId,
                user_id: user.id
              },
              { onConflict: 'user_id' }
            );
          if (officeBillError) throw officeBillError;
          break;
        case STORAGE_KEY_AC_BILL:
          // Save AC bill to Supabase
          const acBillData = data as BillData;
          const { error: acBillError } = await supabase
            .from('ac_bills')
            .upsert(
              {
                total_amount: acBillData.totalAmount,
                bill_date: acBillData.billDate.toISOString(),
                description: acBillData.description,
                group_id: acBillData.groupId,
                user_id: user.id
              },
              { onConflict: 'user_id' }
            );
          if (acBillError) throw acBillError;
          break;
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
        case STORAGE_KEY_THRESHOLDS:
          // Save threshold alerts to Supabase
          const { error: thresholdsError } = await supabase
            .from('threshold_alerts')
            .upsert(
              (data as ThresholdAlert[]).map(alert => ({
                type: alert.type,
                consumption_id: alert.consumptionId,
                threshold: alert.threshold,
                active: alert.active,
                user_id: user.id
              })),
              { onConflict: 'consumption_id' }
            );
          if (thresholdsError) throw thresholdsError;
          break;
        case STORAGE_KEY_MONTHLY_CONSUMPTION:
          // Save monthly consumption data to Supabase
          const { error: monthlyConsumptionError } = await supabase
            .from('monthly_consumption')
            .upsert(
              (data as MonthlyConsumption[]).map(item => ({
                month: item.month,
                office_total: item.officeTotal,
                ac_total: item.acTotal,
                office_cost: item.officeCost,
                ac_cost: item.acCost,
                group_id: item.groupId,
                user_id: user.id
              })),
              { onConflict: 'month' }
            );
          if (monthlyConsumptionError) throw monthlyConsumptionError;
          break;
        default:
          console.warn(`Unknown storage key: ${key}`);
          return false;
      }
      return true;
    } catch (error) {
      console.error(`Error saving data to Supabase for key ${key}:`, error);
      return false;
    }
  };

  // Salva un calcolo nel database o nel localStorage
  const saveCalculationResult = async (result: CalculationResult): Promise<boolean> => {
    try {
      if (user) {
        // Preparazione dati per Supabase (JSON)
        const dbData = {
          date: result.date.toISOString(),
          office_total: result.officeTotal,
          ac_total: result.acTotal,
          office_data: result.officeData,
          ac_data: result.acData,
          office_bill: result.officeBill,
          ac_bill: result.acBill,
          month: result.month,
          groups: result.groups,
          user_id: user.id
        };
        
        // Inserimento nel database
        const { error } = await supabase
          .from('calculation_results')
          .insert(dbData);
        
        if (error) throw error;
      }

      // Aggiorna anche il localStorage
      const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
      results.unshift(result);
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
      
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio del calcolo:', error);
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
