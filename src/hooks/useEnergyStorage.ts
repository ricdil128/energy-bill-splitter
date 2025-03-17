
import { useState, useEffect } from 'react';
import { CalculationResult } from '@/types';
import { STORAGE_KEY } from '@/context/energy-context-types';

export interface StorageData {
  results: CalculationResult[];
  thresholds: Record<string, number>;
}

export function useEnergyStorage() {
  const [storedData, setStoredData] = useState<StorageData>({ 
    results: [], 
    thresholds: {} 
  });

  // Load saved results from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Convert string dates back to Date objects
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
          thresholds: parsed.thresholds || {}
        });
      } catch (error) {
        console.error("Failed to parse saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage
  const saveData = (data: StorageData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStoredData(data);
  };

  return {
    storedData,
    saveData
  };
}
