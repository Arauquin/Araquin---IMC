import {
  UserProfile,
  ClinicalCalculations,
  WHOCategoryInfo,
  Sex,
} from '../types';

export const WHO_CATEGORIES: WHOCategoryInfo[] = [
  {
    id: 'underweight_severe',
    name: 'Bajo peso severo (Desnutrición grado III)',
    shortName: 'Bajo peso severo',
    range: '< 16.0',
    min: 0,
    max: 15.99,
    color: '#0284c7', // Sky 600
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    healthRisk: 'Muy alto riesgo de deficiencias nutricionales, inmunodepresión y pérdida ósea.',
    clinicalAdvice: 'Se recomienda valoración médica inmediata por especialista para descartar patologías subyacentes e iniciar realimentación asistida.',
  },
  {
    id: 'underweight_moderate',
    name: 'Bajo peso moderado (Desnutrición grado II)',
    shortName: 'Bajo peso moderado',
    range: '16.0 - 16.9',
    min: 16.0,
    max: 16.99,
    color: '#0ea5e9', // Sky 500
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    healthRisk: 'Riesgo moderado de anemia, fatiga crónica y pérdida de masa muscular magra.',
    clinicalAdvice: 'Aumentar la densidad calórica de las comidas con grasas saludables, frutos secos y proteínas de alto valor biológico.',
  },
  {
    id: 'underweight_mild',
    name: 'Bajo peso leve (Desnutrición grado I)',
    shortName: 'Bajo peso leve',
    range: '17.0 - 18.4',
    min: 17.0,
    max: 18.49,
    color: '#38bdf8', // Sky 400
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200',
    healthRisk: 'Bajo riesgo clínico, pero conviene optimizar ingesta proteico-calórica.',
    clinicalAdvice: 'Planificar tentempiés saludables y asegurar superávit calórico controlado combinado con ejercicios de fuerza.',
  },
  {
    id: 'normal_weight',
    name: 'Peso normal (Rango saludable OMS)',
    shortName: 'Normopeso saludable',
    range: '18.5 - 24.9',
    min: 18.5,
    max: 24.99,
    color: '#10b981', // Emerald 500
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    healthRisk: 'Riesgo mínimo de morbilidad metabólica y cardiovascular.',
    clinicalAdvice: '¡Enhorabuena! Mantén hábitos regulares de actividad física (150 min/sem) y alimentación basada en alimentos enteros no ultraprocesados.',
  },
  {
    id: 'overweight',
    name: 'Sobrepeso (Preobesidad)',
    shortName: 'Sobrepeso',
    range: '25.0 - 29.9',
    min: 25.0,
    max: 29.99,
    color: '#f59e0b', // Amber 500
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    healthRisk: 'Riesgo incrementado de resistencia a la insulina, dislipemias e hipertensión.',
    clinicalAdvice: 'Déficit calórico moderado (300-500 kcal), entrenamiento de fuerza 2-3 días/semana y reducción de ultraprocesados y azúcares simples.',
  },
  {
    id: 'obesity_class_1',
    name: 'Obesidad Clase I (Moderada)',
    shortName: 'Obesidad Clase I',
    range: '30.0 - 34.9',
    min: 30.0,
    max: 34.99,
    color: '#f97316', // Orange 500
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    healthRisk: 'Riesgo elevado de diabetes mellitus tipo 2, esteatosis hepática y artrosis.',
    clinicalAdvice: 'Intervención integral en estilo de vida con seguimiento nutricional y médico. Priorizar pérdida gradual del 5-10% del peso inicial.',
  },
  {
    id: 'obesity_class_2',
    name: 'Obesidad Clase II (Severa)',
    shortName: 'Obesidad Clase II',
    range: '35.0 - 39.9',
    min: 35.0,
    max: 39.99,
    color: '#ef4444', // Red 500
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    healthRisk: 'Riesgo muy alto de enfermedad coronaria, apnea obstructiva del sueño y síndrome metabólico.',
    clinicalAdvice: 'Supervisión médica multidisciplinar (médico, nutricionista, fisioterapeuta) para reestructuración profunda de hábitos.',
  },
  {
    id: 'obesity_class_3',
    name: 'Obesidad Clase III (Mórbida / Muy severa)',
    shortName: 'Obesidad Clase III',
    range: '≥ 40.0',
    min: 40.0,
    max: 999,
    color: '#881337', // Rose 900
    bgColor: 'bg-red-50',
    textColor: 'text-red-900',
    borderColor: 'border-red-400',
    healthRisk: 'Riesgo clínico extremo para la salud cardiovascular, respiratoria y longevidad.',
    clinicalAdvice: 'Atención clínica prioritaria con equipo médico especializado. Evaluación de opciones médicas avanzadas y soporte metabólico.',
  },
];

export function getWHOCategory(bmi: number): WHOCategoryInfo {
  const roundedBmi = Math.round(bmi * 10) / 10;
  for (const cat of WHO_CATEGORIES) {
    if (roundedBmi >= cat.min && roundedBmi <= cat.max) {
      return cat;
    }
  }
  return WHO_CATEGORIES[WHO_CATEGORIES.length - 1];
}

/**
 * Body fat percentage estimate using the validated Deurenberg et al. clinical formula:
 * BF% = (1.20 × BMI) + (0.23 × Age) - (10.8 × SexFactor) - 5.4
 * SexFactor: Male = 1, Female = 0
 */
export function calculateDeurenbergBodyFat(
  bmi: number,
  age: number,
  sex: Sex
): { percentage: number; category: string } {
  const sexFactor = sex === 'male' ? 1 : 0;
  const rawPercentage = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  const percentage = Math.max(3, Math.min(65, Math.round(rawPercentage * 10) / 10));

  let category = '';
  if (sex === 'male') {
    if (percentage < 6) category = 'Grasa esencial mínima (<6%)';
    else if (percentage <= 13) category = 'Atleta / Muy magro (6-13%)';
    else if (percentage <= 17) category = 'Fitness / Buena forma (14-17%)';
    else if (percentage <= 24) category = 'Aceptable / Promedio (18-24%)';
    else category = 'Elevada (>25%)';
  } else {
    if (percentage < 14) category = 'Grasa esencial mínima (<14%)';
    else if (percentage <= 20) category = 'Atleta / Muy magra (14-20%)';
    else if (percentage <= 24) category = 'Fitness / Buena forma (21-24%)';
    else if (percentage <= 31) category = 'Aceptable / Promedio (25-31%)';
    else category = 'Elevada (>32%)';
  }

  return { percentage, category };
}

/**
 * Basal Metabolic Rate using Mifflin-St Jeor formula (gold standard)
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: Sex
): number {
  if (sex === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.375));
}

/**
 * Main clinical evaluation engine
 */
export function calculateClinicalMetrics(profile: UserProfile): ClinicalCalculations {
  const heightM = profile.height / 100;
  const rawBmi = profile.weight / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  const category = getWHOCategory(bmi);

  // Age clinical adjustments
  const isElderly = profile.age >= 65;
  const isChildOrTeen = profile.age < 18;

  let ageContextMessage = '';
  let minIdealBmi = 18.5;
  let maxIdealBmi = 24.9;

  if (isElderly) {
    // Geriatric guidelines (ESPEN / SEGG / WHO)
    minIdealBmi = 22.0;
    maxIdealBmi = 26.9;
    ageContextMessage =
      'En adultos mayores de 65 años, la evidencia geriátrica internacional (OMS/ESPEN) recomienda un IMC objetivo ligeramente superior (22.0 - 27.0 kg/m²) como factor protector frente a la sarcopenia, desnutrición oculta y fragilidad ósea.';
  } else if (isChildOrTeen) {
    ageContextMessage =
      'En personas menores de 18 años, el IMC se evalúa clínicamente mediante tablas de percentiles y desviaciones estándar (Z-score) de la OMS según edad exacta en meses y sexo, en lugar de puntos de corte fijos de adulto.';
  } else {
    ageContextMessage =
      'Evaluación clínica ajustada a población adulta (18-64 años) según los puntos de corte oficiales de la OMS.';
  }

  const idealWeightMin = Math.round(minIdealBmi * heightM * heightM * 10) / 10;
  const idealWeightMax = Math.round(maxIdealBmi * heightM * heightM * 10) / 10;
  const recommendedAvg = Math.round(((idealWeightMin + idealWeightMax) / 2) * 10) / 10;

  // Weight difference to be within ideal range
  let weightDifferenceToNormal = 0;
  if (profile.weight < idealWeightMin) {
    weightDifferenceToNormal = Math.round((idealWeightMin - profile.weight) * 10) / 10; // kg to gain
  } else if (profile.weight > idealWeightMax) {
    weightDifferenceToNormal = -Math.round((profile.weight - idealWeightMax) * 10) / 10; // kg to lose
  }

  // Deurenberg Body Fat
  const { percentage: bodyFatPercentage, category: bodyFatCategory } =
    calculateDeurenbergBodyFat(bmi, profile.age, profile.sex);

  // BMR & TDEE
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  // Hydration: 35 ml per kg (WHO standard)
  const recommendedWaterLiters = Math.round(profile.weight * 0.035 * 10) / 10;

  // Waist and Cardiovascular Risk
  let waistToHeightRatio: number | undefined = undefined;
  let cardiovascularRisk: 'Bajo' | 'Aumentado' | 'Muy alto' | undefined = undefined;

  if (profile.waistCircumference && profile.waistCircumference > 0) {
    waistToHeightRatio = Math.round((profile.waistCircumference / profile.height) * 100) / 100;
    if (waistToHeightRatio < 0.5) {
      cardiovascularRisk = 'Bajo';
    } else if (waistToHeightRatio <= 0.59) {
      cardiovascularRisk = 'Aumentado';
    } else {
      cardiovascularRisk = 'Muy alto';
    }
  }

  return {
    bmi,
    category,
    isElderlyAdjusted: isElderly,
    ageContextMessage,
    bodyFatPercentage,
    bodyFatCategory,
    idealWeightRange: {
      min: idealWeightMin,
      max: idealWeightMax,
      recommendedAvg,
    },
    weightDifferenceToNormal,
    bmr,
    tdee,
    recommendedWaterLiters,
    waistToHeightRatio,
    cardiovascularRisk,
  };
}

export function validateEmailFormat(email?: string): { isValid: boolean; error: string | null } {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'El correo electrónico es obligatorio para registrar y guardar tu perfil.',
    };
  }

  const trimmed = email.trim();

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'El correo electrónico no debe contener espacios en blanco.',
    };
  }

  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      error: "El correo debe incluir el carácter '@' (ejemplo: usuario@correo.com).",
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      error: "Formato incompleto. Introduce una dirección como 'usuario@correo.com'.",
    };
  }

  const domain = parts[1];
  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: "El dominio debe incluir un punto y extensión válida (ejemplo: '.com', '.org').",
    };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: "La extensión del correo debe tener al menos 2 caracteres (ejemplo: '.com').",
    };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'El formato del correo electrónico no es válido. Revisa que no contenga caracteres inválidos.',
    };
  }

  return { isValid: true, error: null };
}

export function isEmailValid(email?: string): boolean {
  return validateEmailFormat(email).isValid;
}

/**
 * Pre-populated monthly tracking seed data (last 6 months leading up to today)
 * to provide an immediate realistic progress visualization
 */
export function generateSeedMonthlyLogs(currentWeight: number, height: number, age: number, sex: Sex) {
  const heightM = height / 100;
  const now = new Date();
  const seedLogs = [];

  // Trend slightly downward or realistic over the past 5 months
  const monthlyDeltas = [2.8, 2.1, 1.4, 0.8, 0.3, 0];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const weightVal = Math.round((currentWeight + monthlyDeltas[5 - i]) * 10) / 10;
    const bmiVal = Math.round((weightVal / (heightM * heightM)) * 10) / 10;
    const { percentage: fatVal } = calculateDeurenbergBodyFat(bmiVal, age, sex);

    seedLogs.push({
      id: `seed-log-${i}`,
      date: d.toISOString().split('T')[0],
      weight: weightVal,
      bmi: bmiVal,
      bodyFatPercentage: fatVal,
      waistCircumference: Math.round(weightVal * 1.15),
      notes:
        i === 5
          ? 'Medición de inicio'
          : i === 2
          ? 'Ajuste de plan nutricional y mayor actividad'
          : i === 0
          ? 'Medición actual'
          : 'Seguimiento mensual constante',
    });
  }

  return seedLogs;
}
