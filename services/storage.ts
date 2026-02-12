
export const STORAGE_KEYS = {
  DOCTORS: 'nexus_doctors',
  PATIENTS: 'nexus_patients',
  APPOINTMENTS: 'nexus_appointments',
  PRESCRIPTIONS: 'nexus_prescriptions',
  AI_REPORTS: 'nexus_ai_reports',
  CURRENT_USER: 'nexus_current_user',
};

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  },
  clear: (): void => {
    localStorage.clear();
  }
};
