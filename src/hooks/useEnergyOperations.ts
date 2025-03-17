
import { useState } from 'react';
import { 
  ConsumptionData, 
  BillData, 
  CalculationResult, 
  ConsumptionType 
} from '@/types';
import { 
  generateInitialConsumptionData, 
  performFullCalculation,
  checkThreshold
} from '@/utils/calculations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StorageData } from './useEnergyStorage';

export function useEnergyOperations(
  initialData: StorageData,
  onDataChange: (data: StorageData) => void
) {
  // Initialize state for consumption data
  const [officeData, setOfficeData] = useState<ConsumptionData[]>(() => 
    generateInitialConsumptionData(9, 'office')
  );
  
  const [acData, setAcData] = useState<ConsumptionData[]>(() => 
    generateInitialConsumptionData(15, 'ac')
  );
  
  // Initialize bills
  const [officeBill, setOfficeBill] = useState<BillData>({
    totalAmount: 0,
    billDate: new Date(),
  });
  
  const [acBill, setAcBill] = useState<BillData>({
    totalAmount: 0,
    billDate: new Date(),
  });
  
  // Initialize results and thresholds
  const [results, setResults] = useState<CalculationResult[]>(initialData.results);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [thresholds, setThresholds] = useState<Record<string, number>>(initialData.thresholds);
  
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
  
  // Update bill amount
  const updateBillAmount = (type: ConsumptionType, amount: number) => {
    if (type === 'office') {
      setOfficeBill(prev => ({ ...prev, totalAmount: amount }));
    } else {
      setAcBill(prev => ({ ...prev, totalAmount: amount }));
    }
  };
  
  // Calculate and store results
  const calculateResults = () => {
    // Validate inputs
    if (officeBill.totalAmount <= 0 || acBill.totalAmount <= 0) {
      toast.error("Please enter valid bill amounts");
      return;
    }
    
    const officeKwhTotal = officeData.reduce((sum, item) => sum + item.kwh, 0);
    const acKwhTotal = acData.reduce((sum, item) => sum + item.kwh, 0);
    
    if (officeKwhTotal <= 0 || acKwhTotal <= 0) {
      toast.error("Please enter consumption data");
      return;
    }
    
    // Perform calculations
    const result = performFullCalculation(officeData, acData, officeBill, acBill);
    setCurrentResult(result);
    
    // Add to results history
    const updatedResults = [result, ...results];
    setResults(updatedResults);
    
    // Save to storage
    onDataChange({
      results: updatedResults,
      thresholds
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
      thresholds: updatedThresholds
    });
    
    toast.success(`Threshold set for ${type === 'office' ? 'Office' : 'AC'}`);
  };
  
  // Reset consumption data
  const resetConsumptionData = (type: ConsumptionType) => {
    if (type === 'office') {
      setOfficeData(generateInitialConsumptionData(9, 'office'));
    } else {
      setAcData(generateInitialConsumptionData(15, 'ac'));
    }
    
    toast.info(`${type === 'office' ? 'Office' : 'AC'} data reset`);
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
      thresholds
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
    updateConsumption,
    updateBillAmount,
    calculateResults,
    setThreshold,
    resetConsumptionData,
    loadResult,
    deleteResult
  };
}
