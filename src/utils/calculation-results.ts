
import { ConsumptionData, BillData, CalculationResult, ConsumptionGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { calculateCostsAndPercentages } from './cost-calculations';

/**
 * Perform the complete calculation for both office and AC data
 */
export function performFullCalculation(
  officeData: ConsumptionData[],
  acData: ConsumptionData[],
  officeBill: BillData,
  acBill: BillData,
  groups: ConsumptionGroup[]
): CalculationResult {
  const updatedOfficeData = calculateCostsAndPercentages(officeData, officeBill.totalAmount);
  const updatedAcData = calculateCostsAndPercentages(acData, acBill.totalAmount);
  
  const officeTotal = updatedOfficeData.reduce((sum, entry) => sum + (entry.isGeneral ? 0 : entry.kwh), 0);
  const acTotal = updatedAcData.reduce((sum, entry) => sum + (entry.isGeneral ? 0 : entry.kwh), 0);
  
  return {
    officeData: updatedOfficeData,
    acData: updatedAcData,
    officeBill,
    acBill,
    officeTotal,
    acTotal,
    date: new Date(),
    id: uuidv4(),
    groups: [...groups]
  };
}

/**
 * Prepare data for report
 */
export function prepareDataForReport(result: CalculationResult): CalculationResult {
  return {
    officeData: result.officeData,
    acData: result.acData,
    officeBill: result.officeBill,
    acBill: result.acBill,
    officeTotal: result.officeTotal,
    acTotal: result.acTotal,
    date: new Date(),
    id: uuidv4(),
    groups: [...(result.groups || [])],
    companyInfo: result.companyInfo
  };
}
