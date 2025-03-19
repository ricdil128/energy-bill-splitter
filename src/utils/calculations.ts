import { ConsumptionData, BillData, CalculationResult, ConsumptionType, ConsumptionGroup, GroupedConsumptionData, CompanyInfo } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { GROUP_COLABORA1, GROUP_COLABORA2 } from '@/context/energy-context-types';

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
  type: ConsumptionType,
  groupId: string,
  groupName: string
): ConsumptionData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: `${groupName} ${i + 1}`,
    kwh: 0,
    cost: 0,
    percentage: 0,
    groupId,
    squareMeters: 0,
    thousandthQuota: 0
  }));
}

/**
 * Generate general counters for AC
 */
export function generateGeneralCounters(
  count: number,
  groupId: string,
  groupName: string
): ConsumptionData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: `Contatore Generale ${groupName} ${count > 1 ? (i + 1) : ''}`,
    kwh: 0,
    cost: 0,
    percentage: 0,
    groupId,
    isGeneral: true
  }));
}

/**
 * Group consumption data by groupId
 */
export function groupConsumptionData(
  data: ConsumptionData[],
  groups: ConsumptionGroup[]
): GroupedConsumptionData {
  const result: GroupedConsumptionData = {};
  
  data.forEach(item => {
    const groupId = item.groupId || 'default';
    const group = groups.find(g => g.id === groupId);
    
    if (!result[groupId]) {
      result[groupId] = {
        name: group?.name || 'Altro',
        propertyType: group?.propertyType,
        propertyNumber: group?.propertyNumber,
        items: [],
        generalCounters: []
      };
    }
    
    if (item.isGeneral) {
      result[groupId].generalCounters!.push(item);
    } else {
      result[groupId].items.push(item);
    }
  });
  
  return result;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(result: CalculationResult): string {
  const rows: string[] = [];
  
  // Add headers
  rows.push('Group,Type,Name,kWh,Cost (€),Percentage (%),IsGeneral');
  
  // Group data
  const groupedOffice = groupConsumptionData(result.officeData, result.groups || []);
  const groupedAC = groupConsumptionData(result.acData, result.groups || []);
  
  // Add office data
  Object.entries(groupedOffice).forEach(([groupId, group]) => {
    group.items.forEach(entry => {
      rows.push(`${group.name},Office,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},No`);
    });
    
    if (group.generalCounters && group.generalCounters.length > 0) {
      group.generalCounters.forEach(entry => {
        rows.push(`${group.name},Office,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},Yes`);
      });
    }
  });
  
  // Add AC data
  Object.entries(groupedAC).forEach(([groupId, group]) => {
    group.items.forEach(entry => {
      rows.push(`${group.name},AC,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},No`);
    });
    
    if (group.generalCounters && group.generalCounters.length > 0) {
      group.generalCounters.forEach(entry => {
        rows.push(`${group.name},AC,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},Yes`);
      });
    }
  });
  
  // Add totals
  rows.push(`Total,Offices,All,${result.officeTotal},${result.officeBill.totalAmount},100,No`);
  rows.push(`Total,Air Conditioning,All,${result.acTotal},${result.acBill.totalAmount},100,No`);
  
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

/**
 * Prepare data for report
 */
export function prepareDataForReport(result: CalculationResult): CalculationResult {
  const groupedOfficeData = groupConsumptionData(result.officeData, result.groups || []);
  const groupedAcData = groupConsumptionData(result.acData, result.groups || []);
  
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
