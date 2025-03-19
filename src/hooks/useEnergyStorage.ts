import { useState, useEffect } from 'react';
import { CalculationResult, ConsumptionGroup } from '@/types';
import { STORAGE_KEY, DEFAULT_GROUPS } from '@/context/energy-context-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface StorageData {
  results: CalculationResult[];
  thresholds: Record<string, number>;
  groups?: ConsumptionGroup[];
}

export function useEnergyStorage() {
  const [storedData, setStoredData] = useState<StorageData>({ 
    results: [], 
    thresholds: {},
    groups: DEFAULT_GROUPS
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: resultsData, error: resultsError } = await supabase
            .from('calculation_results')
            .select('*')
            .order('date', { ascending: false });
          
          if (resultsError) throw resultsError;

          const { data: thresholdsData, error: thresholdsError } = await supabase
            .from('thresholds')
            .select('*');
          
          if (thresholdsError) throw thresholdsError;

          const { data: groupsData, error: groupsError } = await supabase
            .from('consumption_groups')
            .select('*');
          
          if (groupsError) throw groupsError;

          const processedResults = resultsData.map((result: any) => ({
            id: result.id,
            date: new Date(result.date),
            officeTotal: parseFloat(result.office_total),
            acTotal: parseFloat(result.ac_total),
            officeBill: {
              ...result.office_bill,
              billDate: new Date(result.office_bill.billDate)
            },
            acBill: {
              ...result.ac_bill,
              billDate: new Date(result.ac_bill.billDate)
            },
            officeData: result.office_data,
            acData: result.ac_data,
            month: result.month,
            groups: result.groups || DEFAULT_GROUPS
          }));

          const thresholdsRecord: Record<string, number> = {};
          thresholdsData.forEach((threshold: any) => {
            thresholdsRecord[threshold.consumption_id] = threshold.threshold_value;
          });

          setStoredData({
            results: processedResults,
            thresholds: thresholdsRecord,
            groups: groupsData.length > 0 ? groupsData.map((g: any) => ({
              id: g.id,
              name: g.name,
              type: g.type
            })) : DEFAULT_GROUPS
          });
        } else {
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati da Supabase:", error);
        loadFromLocalStorage();
        toast.error("Impossibile caricare i dati dal server. Utilizzo dati locali.");
      } finally {
        setIsLoading(false);
      }
    }

    function loadFromLocalStorage() {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          
          const processedResults = parsed.results.map((result: any) => ({
            ...result,
            date: new Date(result.date),
            officeBill: {
              ...result.officeBill,
              billDate: new Date(result.officeBill.billDate)
            },
            acBill: {
              ...result.acBill,
              billDate: new Date(result.acBill.billDate)
            }
          }));
          
          setStoredData({
            results: processedResults,
            thresholds: parsed.thresholds || {},
            groups: parsed.groups || DEFAULT_GROUPS
          });
        } catch (error) {
          console.error("Errore nell'analisi dei dati salvati:", error);
        }
      }
    }

    loadDataFromSupabase();
  }, []);

  const saveData = async (data: StorageData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStoredData(data);
    
    if (isOnline) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session?.user) {
          const userId = sessionData.session.user.id;
          
          const newResults = data.results.filter(result => 
            !result.id || result.id.length !== 36 || !result.id.includes('-')
          );
          
          for (const result of newResults) {
            if (!result.id || result.id.length !== 36 || !result.id.includes('-')) {
              result.id = uuidv4();
            }
            
            const { error } = await supabase
              .from('calculation_results')
              .insert({
                user_id: userId,
                date: result.date.toISOString(),
                office_total: result.officeTotal,
                ac_total: result.acTotal,
                office_bill: result.officeBill,
                ac_bill: result.acBill,
                office_data: result.officeData,
                ac_data: result.acData,
                month: result.month,
                groups: result.groups
              });
              
            if (error) console.error("Errore nel salvataggio del risultato:", error);
          }
          
          await supabase
            .from('thresholds')
            .delete()
            .eq('user_id', userId);
            
          const thresholdEntries = Object.entries(data.thresholds);
          if (thresholdEntries.length > 0) {
            const thresholdsToInsert = thresholdEntries.map(([id, value]) => ({
              user_id: userId,
              consumption_id: id,
              consumption_type: id.includes('office') ? 'office' : 'ac',
              threshold_value: value,
              active: true
            }));
            
            const { error } = await supabase
              .from('thresholds')
              .insert(thresholdsToInsert);
              
            if (error) console.error("Errore nel salvataggio delle soglie:", error);
          }
          
          await supabase
            .from('consumption_groups')
            .delete()
            .eq('user_id', userId);
            
          if (data.groups && data.groups.length > 0) {
            const groupsToInsert = data.groups.map(group => ({
              id: group.id,
              name: group.name,
              type: group.type,
              user_id: userId
            }));
            
            const { error } = await supabase
              .from('consumption_groups')
              .insert(groupsToInsert);
              
            if (error) console.error("Errore nel salvataggio dei gruppi:", error);
          }
        }
      } catch (error) {
        console.error("Errore nel salvataggio dei dati su Supabase:", error);
        toast.error("Impossibile salvare i dati sul server. I dati sono stati salvati localmente.");
      }
    }
  };

  return {
    storedData,
    saveData,
    isLoading
  };
}
