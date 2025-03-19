
import React, { createContext, useContext, ReactNode } from 'react';
import { EnergyContextType } from './energy-context-types';
import { useEnergyStorage, StorageData } from '@/hooks/useEnergyStorage';
import { useEnergyOperations } from '@/hooks/useEnergyOperations';
import { useOfficeRegistry } from '@/hooks/useOfficeRegistry';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { ConsumptionType } from '@/types';

// Create context with default values
const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

export const EnergyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get storage functionality
  const energyStorage = useEnergyStorage();
  const storedData = energyStorage.getStoredData();
  
  // Get office registry
  const officeRegistry = useOfficeRegistry();
  
  // Get company info
  const companyInfo = useCompanyInfo();
  
  // Get energy operations with storage data
  const energyOperations = useEnergyOperations(storedData, (data: StorageData) => {
    if (data.officeData) energyStorage.setOfficeData(data.officeData);
    if (data.acData) energyStorage.setAcData(data.acData);
    if (data.officeBill) energyStorage.setOfficeBill(data.officeBill);
    if (data.acBill) energyStorage.setAcBill(data.acBill);
    if (data.results) energyStorage.setCalculationResults(data.results);
    if (data.groups) energyStorage.setConsumptionGroups(data.groups);
    if (data.thresholds) {
      energyStorage.setThresholdAlerts(data.thresholds);
    }
  });
  
  const contextValue = {
    ...energyOperations,
    companyInfo: companyInfo.companyInfo,
    saveCompanyInfo: companyInfo.saveCompanyInfo
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
