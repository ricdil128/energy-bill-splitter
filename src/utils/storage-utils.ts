
import {
  STORAGE_KEY_OFFICE,
  STORAGE_KEY_AC,
  STORAGE_KEY_OFFICE_BILL,
  STORAGE_KEY_AC_BILL,
  STORAGE_KEY_RESULTS,
  STORAGE_KEY_GROUPS,
  STORAGE_KEY_THRESHOLDS,
  STORAGE_KEY_MONTHLY_CONSUMPTION,
  STORAGE_KEY_CONSUMPTION_TYPE_LABELS
} from '@/constants/storage-keys';
import { StorageData } from '@/types/energy-storage';
import { DEFAULT_CONSUMPTION_TYPE_LABELS } from '@/context/energy-context-types';

// Load data from localStorage
export const loadFromLocalStorage = (): StorageData => {
  return {
    officeData: JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICE) || '[]'),
    acData: JSON.parse(localStorage.getItem(STORAGE_KEY_AC) || '[]'),
    officeBill: JSON.parse(localStorage.getItem(STORAGE_KEY_OFFICE_BILL) || 'null'),
    acBill: JSON.parse(localStorage.getItem(STORAGE_KEY_AC_BILL) || 'null'),
    results: JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]'),
    groups: JSON.parse(localStorage.getItem(STORAGE_KEY_GROUPS) || '[]'),
    thresholds: JSON.parse(localStorage.getItem(STORAGE_KEY_THRESHOLDS) || '[]'),
    monthlyConsumptionData: JSON.parse(localStorage.getItem(STORAGE_KEY_MONTHLY_CONSUMPTION) || '[]'),
    consumptionTypeLabels: JSON.parse(localStorage.getItem(STORAGE_KEY_CONSUMPTION_TYPE_LABELS) || JSON.stringify(DEFAULT_CONSUMPTION_TYPE_LABELS)),
  };
};

// Save data to localStorage
export const saveToLocalStorage = (data: StorageData): void => {
  if (data.officeData) {
    localStorage.setItem(STORAGE_KEY_OFFICE, JSON.stringify(data.officeData));
  }
  if (data.acData) {
    localStorage.setItem(STORAGE_KEY_AC, JSON.stringify(data.acData));
  }
  if (data.officeBill !== undefined) {
    localStorage.setItem(STORAGE_KEY_OFFICE_BILL, JSON.stringify(data.officeBill));
  }
  if (data.acBill !== undefined) {
    localStorage.setItem(STORAGE_KEY_AC_BILL, JSON.stringify(data.acBill));
  }
  if (data.results) {
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(data.results));
  }
  if (data.groups) {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(data.groups));
  }
  if (data.thresholds) {
    localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(data.thresholds));
  }
  if (data.monthlyConsumptionData) {
    localStorage.setItem(STORAGE_KEY_MONTHLY_CONSUMPTION, JSON.stringify(data.monthlyConsumptionData));
  }
  if (data.consumptionTypeLabels) {
    localStorage.setItem(STORAGE_KEY_CONSUMPTION_TYPE_LABELS, JSON.stringify(data.consumptionTypeLabels));
  }
};
