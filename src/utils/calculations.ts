
import { ConsumptionData, BillData, CalculationResult, ConsumptionType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate the cost and percentage for each consumption entry
 */
export function calculateCostsAndPercentages(
  consumptionData: ConsumptionData[],
  billAmount: number
): ConsumptionData[] {
  // Calculate total kWh
  const totalKwh = consumptionData.reduce((sum, entry) => sum + entry.kwh, 0);
  
  if (totalKwh <= 0) {
    return consumptionData.map(entry => ({
      ...entry,
      cost: 0,
      percentage: 0
    }));
  }
  
  // Calculate cost and percentage for each entry
  return consumptionData.map(entry => {
    const percentage = (entry.kwh / totalKwh) * 100;
    const cost = (entry.kwh / totalKwh) * billAmount;
    
    return {
      ...entry,
      cost: parseFloat(cost.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2))
    };
  });
}

/**
 * Perform the complete calculation for both office and AC data
 */
export function performFullCalculation(
  officeData: ConsumptionData[],
  acData: ConsumptionData[],
  officeBill: BillData,
  acBill: BillData
): CalculationResult {
  const updatedOfficeData = calculateCostsAndPercentages(officeData, officeBill.totalAmount);
  const updatedAcData = calculateCostsAndPercentages(acData, acBill.totalAmount);
  
  const officeTotal = updatedOfficeData.reduce((sum, entry) => sum + entry.kwh, 0);
  const acTotal = updatedAcData.reduce((sum, entry) => sum + entry.kwh, 0);
  
  return {
    officeData: updatedOfficeData,
    acData: updatedAcData,
    officeBill,
    acBill,
    officeTotal,
    acTotal,
    date: new Date(),
    id: uuidv4()
  };
}

/**
 * Check if a consumption value exceeds the threshold
 */
export function checkThreshold(
  consumptionData: ConsumptionData[],
  thresholds: Record<string, number>
): string[] {
  return consumptionData
    .filter(entry => 
      thresholds[entry.id] && entry.kwh > thresholds[entry.id]
    )
    .map(entry => entry.name);
}

/**
 * Generate initial consumption data with default values
 */
export function generateInitialConsumptionData(
  count: number,
  type: ConsumptionType
): ConsumptionData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: `${type === 'office' ? 'Office' : 'AC'} ${i + 1}`,
    kwh: 0,
    cost: 0,
    percentage: 0
  }));
}

/**
 * Export data to CSV format
 */
export function exportToCSV(result: CalculationResult): string {
  const rows: string[] = [];
  
  // Add headers
  rows.push('Type,Name,kWh,Cost (€),Percentage (%)');
  
  // Add office data
  result.officeData.forEach(entry => {
    rows.push(`Office,${entry.name},${entry.kwh},${entry.cost},${entry.percentage}`);
  });
  
  // Add AC data
  result.acData.forEach(entry => {
    rows.push(`AC,${entry.name},${entry.kwh},${entry.cost},${entry.percentage}`);
  });
  
  // Add totals
  rows.push(`Total,Offices,${result.officeTotal},${result.officeBill.totalAmount},100`);
  rows.push(`Total,Air Conditioning,${result.acTotal},${result.acBill.totalAmount},100`);
  
  return rows.join('\n');
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
