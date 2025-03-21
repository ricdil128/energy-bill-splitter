
import { ConsumptionData } from '@/types';

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
