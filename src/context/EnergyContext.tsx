
import React, { createContext, useContext, ReactNode } from 'react';
import { EnergyContextType } from './energy-context-types';
import { useEnergyStorage } from '@/hooks/useEnergyStorage';
import { useEnergyOperations } from '@/hooks/useEnergyOperations';
import { useOfficeRegistry } from '@/hooks/useOfficeRegistry';

// Create context with default values
const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

export const EnergyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get storage functionality
  const { storedData, saveData } = useEnergyStorage();
  
  // Get energy operations with storage data
  const energyOperations = useEnergyOperations(storedData, saveData);
  
  return (
    <EnergyContext.Provider value={energyOperations}>
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
