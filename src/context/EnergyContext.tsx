
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ConsumptionData, 
  BillData, 
  CalculationResult, 
  ThresholdAlert, 
  ConsumptionType 
} from '@/types';
import { 
  generateInitialConsumptionData, 
  performFullCalculation,
  checkThreshold
} from '@/utils/calculations';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Define the context shape
interface EnergyContextType {
  officeData: ConsumptionData[];
  acData: ConsumptionData[];
  officeBill: BillData;
  acBill: BillData;
  results: CalculationResult[];
  currentResult: CalculationResult | null;
  thresholds: Record<string, number>;
  updateConsumption: (type: ConsumptionType, id: string, kwh: number) => void;
  updateBillAmount: (type: ConsumptionType, amount: number) => void;
  calculateResults: () => void;
  setThreshold: (type: ConsumptionType, id: string, value: number) => void;
  resetConsumptionData: (type: ConsumptionType) => void;
  loadResult: (id: string) => void;
  deleteResult: (id: string) => void;
}

// Create context with default values
const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

// The key we'll use to store results in localStorage
const STORAGE_KEY = 'energy-bill-splitter-data';

export const EnergyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  
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
        
        setResults(processedResults);
        setThresholds(parsed.thresholds || {});
      } catch (error) {
        console.error("Failed to parse saved data:", error);
      }
    }
  }, []);
  
  // Save results to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      results,
      thresholds
    }));
  }, [results, thresholds]);
  
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
    setResults(prev => [result, ...prev]);
    
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
    setThresholds(prev => ({
      ...prev,
      [id]: value
    }));
    
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
    setResults(prev => prev.filter(r => r.id !== id));
    
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
    
    toast.success("Calculation deleted");
  };
  
  // Provide the context value
  const contextValue: EnergyContextType = {
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
  
  return (
    <EnergyContext.Provider value={contextValue}>
      {children}
    </EnergyContext.Provider>
  );
};

// Custom hook to use the energy context
export const useEnergy = () => {
  const context = useContext(EnergyContext);
  
  if (context === undefined) {
    throw new Error("useEnergy must be used within an EnergyProvider");
  }
  
  return context;
};
