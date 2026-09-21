export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type DietaryGoal =
  | 'lose_weight'
  | 'maintain'
  | 'gain_muscle'
  | 'improve_health';

export type DietaryPreference =
  | 'mediterranean'
  | 'balanced'
  | 'vegetarian'
  | 'vegan'
  | 'low_carb'
  | 'hyperproteic';

export interface WHOCategoryInfo {
  id: string;
  name: string;
  shortName: string;
  range: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  healthRisk: string;
  clinicalAdvice: string;
}

export interface UserProfile {
  email?: string; // Correo electrónico requerido para cálculos e informe
  height: number; // cm
  weight: number; // kg
  age: number; // years
  sex: Sex;
  waistCircumference?: number; // cm (optional for cardiovascular risk)
  activityLevel: ActivityLevel;
  dietaryGoal: DietaryGoal;
  dietaryPreferences: DietaryPreference;
}

export interface ClinicalCalculations {
  bmi: number;
  category: WHOCategoryInfo;
  isElderlyAdjusted: boolean;
  ageContextMessage: string;
  bodyFatPercentage: number;
  bodyFatCategory: string;
  idealWeightRange: {
    min: number;
    max: number;
    recommendedAvg: number;
  };
  weightDifferenceToNormal: number; // 0 if inside normal, +/- kg to reach boundary
  bmr: number; // Basal Metabolic Rate (Mifflin-St Jeor)
  tdee: number; // Total Daily Energy Expenditure
  recommendedWaterLiters: number;
  waistToHeightRatio?: number;
  cardiovascularRisk?: 'Bajo' | 'Aumentado' | 'Muy alto';
}

export interface ProgressLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  bmi: number;
  bodyFatPercentage: number;
  waistCircumference?: number;
  notes?: string;
}

export interface HealthReminder {
  id: string;
  title: string;
  description: string;
  type: 'weigh_in' | 'water' | 'meal_prep' | 'physical_activity' | 'clinical_review';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  time: string; // HH:mm
  dayOfWeek?: number; // 0-6
  enabled: boolean;
  lastCompletedDate?: string; // YYYY-MM-DD
}

export interface MacronutrientDistribution {
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  proteinGrams: string;
  summary: string;
}

export interface SampleDayPlan {
  breakfast: string;
  midMorning: string;
  lunch: string;
  afternoonSnack: string;
  dinner: string;
}

export interface NutritionPlan {
  clinicalAssessment: string;
  dailyCalorieTarget: string;
  hydrationGoal: string;
  macronutrientDistribution: MacronutrientDistribution;
  keyRecommendations: string[];
  sampleDayPlan: SampleDayPlan;
  foodsToEmphasize: string[];
  foodsToModerate: string[];
  customReminders: string[];
}
