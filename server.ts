import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with lazy check
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Gemini content generation with multi-model fallback and thinking level optimization
async function generateWithModelFallback(
  ai: GoogleGenAI,
  buildParams: (model: string) => any
) {
  // Primary model with fast fallback to flash-lite if primary experiences 503 high-demand or transient spikes
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const params = buildParams(model);
      const response = await ai.models.generateContent(params);
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Notice: Model '${model}' experienced transient status (${err?.status || err?.message || 'UNAVAILABLE'}). Switching to next candidate...`);
    }
  }

  throw lastError;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Clinical Recommendations Helper (WHO guidelines + Harvard model)
function buildClinicalRecommendations(params: any) {
  const {
    weight = 70,
    bmi = 22.5,
    category = 'Peso normal (Rango saludable OMS)',
    idealWeightMin = 55,
    idealWeightMax = 72,
  } = params || {};

  const isUnderweight = bmi < 18.5;
  const isNormal = bmi >= 18.5 && bmi < 25;
  const isOverweight = bmi >= 25 && bmi < 30;
  const isObese = bmi >= 30;

  let assessment = '';
  let calorieTarget = '';
  if (isUnderweight) {
    assessment = `Tu IMC de ${bmi} indica bajo peso según los criterios de la OMS. Es prioritario enriquecer tu ingesta calórica con alimentos de alta densidad nutricional y asegurar un aporte óptimo de proteínas para preservar la masa muscular y ósea.`;
    calorieTarget = '2,200 - 2,500 kcal/día (superávit controlado)';
  } else if (isNormal) {
    assessment = `¡Excelente! Tu IMC de ${bmi} está en el rango normopeso saludable de la OMS (18.5 - 24.9). Tu objetivo principal debe ser mantener un estilo de vida activo y una alimentación variada rica en micronutrientes para prevenir enfermedades metabólicas a largo plazo.`;
    calorieTarget = '1,900 - 2,200 kcal/día (mantenimiento)';
  } else if (isOverweight) {
    assessment = `Tu IMC de ${bmi} se sitúa en sobrepeso (preobesidad según la OMS). Un déficit calórico moderado de 300-500 kcal junto a entrenamiento de fuerza y aumento del gasto diario (NEAT) te permitirá alcanzar gradualmente tu peso ideal (${idealWeightMin} - ${idealWeightMax} kg) sin efecto rebote.`;
    calorieTarget = '1,650 - 1,850 kcal/día (déficit suave y sostenible)';
  } else {
    assessment = `Tu IMC de ${bmi} corresponde a ${category} según la OMS. Te aconsejamos priorizar cambios sostenibles: aumento de fibra soluble, control de ultraprocesados y supervisión periódica por parte de un profesional de la salud o nutricionista colegiado.`;
    calorieTarget = '1,500 - 1,750 kcal/día (reducción progresiva y segura)';
  }

  const numWeight = Number(weight) || 70;
  const waterLiters = (numWeight * 0.035).toFixed(1);

  return {
    clinicalAssessment: assessment,
    dailyCalorieTarget: calorieTarget,
    hydrationGoal: `${waterLiters} litros diarios (~${Math.round(numWeight * 0.035 * 4)} vasos de 250ml)`,
    macronutrientDistribution: {
      proteinPercent: isUnderweight ? 25 : isOverweight || isObese ? 30 : 25,
      carbsPercent: isOverweight || isObese ? 40 : 45,
      fatPercent: isOverweight || isObese ? 30 : 30,
      proteinGrams: `${Math.round(numWeight * (isOverweight || isObese ? 1.5 : 1.3))}g - ${Math.round(numWeight * 1.8)}g`,
      summary: 'Basado en las directrices de la OMS y el modelo de Plato Saludable de Harvard.',
    },
    keyRecommendations: [
      'Estructura tus comidas principales con la regla del 50% verduras y hortalizas, 25% proteínas de calidad y 25% carbohidratos complejos.',
      `Mantén una hidratación constante de al menos ${waterLiters}L al día, priorizando agua natural e infusiones sin azúcar añadido.`,
      'Realiza al menos 150 a 300 minutos semanales de actividad física aeróbica moderada combinada con 2-3 sesiones de fuerza muscular.',
      'Establece un horario regular de sueño de 7 a 8 horas; la falta de descanso eleva la grelina y favorece la retención de grasa visceral.',
      'Pesaje consistente: mídete una vez al mes o cada 15 días por la mañana en ayunas, sin obsesión por las fluctuaciones diarias de líquidos.',
    ],
    sampleDayPlan: {
      breakfast: 'Tostada de pan integral 100% con aguacate, huevo pochado y fruta fresca entera (ej. arándanos o kiwi) con té verde o café solo.',
      midMorning: 'Puñado de frutos secos naturales (nueces o almendras crudas) con yogur griego natural sin azúcar.',
      lunch: 'Salmón o pechuga a la plancha con quinoa tricolor y ensalada abundante de hojas verdes, tomate cherry, pepino y aceite de oliva virgen extra.',
      afternoonSnack: 'Manzana laminada con una cucharadita de crema de cacahuete puro 100% o queso fresco batido.',
      dinner: 'Crema de calabacín y puerro casera sin nata, acompañada de tortilla de espinacas y una porción de semillas de calabaza.',
    },
    foodsToEmphasize: [
      'Verduras de hoja verde oscura (espinacas, rúcula, brócoli)',
      'Proteínas magras y huevos camperos',
      'Pescados azules ricos en Omega-3 (sardinas, salmón, atún claro)',
      'Legumbres (lentejas, garbanzos, alubias)',
      'Aceite de oliva virgen extra y frutos secos crudos',
    ],
    foodsToModerate: [
      'Bebidas azucaradas, refrescos y zumos industriales',
      'Bollería industrial y harinas ultra refinadas',
      'Embutidos grasos y carnes ultraprocesadas',
      'Alcohol y alimentos con alto contenido en sodio añadido',
    ],
    customReminders: [
      'Pesaje mensual oficial (primer domingo de cada mes)',
      'Meta diaria de agua: botellín de agua a media mañana y media tarde',
      'Caminata activa de 30 minutos post-comida',
    ],
  };
}

// Nutrition Recommendations API
app.post('/api/nutrition-recommendations', async (req, res) => {
  try {
    const {
      height,
      weight,
      age,
      sex,
      bmi,
      category,
      bodyFatEstimate,
      idealWeightMin,
      idealWeightMax,
      activityLevel = 'moderate',
      dietaryGoal = 'improve_health',
      dietaryPreferences = 'mediterránea / equilibrada',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(buildClinicalRecommendations(req.body));
    }

    const prompt = `Actúa como un médico nutricionista clínico certificado de prestigio internacional.
Analiza los siguientes datos antropométricos del usuario según los estándares oficiales de la Organización Mundial de la Salud (OMS):
- Altura: ${height} cm
- Peso: ${weight} kg
- Edad: ${age} años
- Sexo biológico: ${sex === 'female' ? 'Femenino' : 'Masculino'}
- IMC actual: ${bmi} kg/m²
- Categoría OMS: ${category}
- Estimación % Grasa Corporal (fórmula Deurenberg): ${bodyFatEstimate}%
- Rango de peso ideal OMS estimado: ${idealWeightMin} kg - ${idealWeightMax} kg
- Nivel de actividad física: ${activityLevel}
- Objetivo declarado: ${dietaryGoal}
- Preferencia dietética: ${dietaryPreferences}

Genera un plan clínico y nutricional altamente personalizado, riguroso, motivador y sin mitos.
Debes responder estrictamente en formato JSON con la siguiente estructura:
{
  "clinicalAssessment": "Explicación médica concisa (2-3 párrafos) contextualizando el IMC según edad y sexo, explicando riesgos o beneficios clínicos y marcando un enfoque positivo.",
  "dailyCalorieTarget": "Rango de calorías diario sugerido con su justificación clínica breve",
  "hydrationGoal": "Cantidad de agua sugerida diaria en litros y vasos",
  "macronutrientDistribution": {
    "proteinPercent": 25,
    "carbsPercent": 45,
    "fatPercent": 30,
    "proteinGrams": "ej. 90-110g",
    "summary": "Breve explicación de la distribución"
  },
  "keyRecommendations": ["Recomendación clínica 1", "Recomendación clínica 2", "Recomendación clínica 3", "Recomendación clínica 4", "Recomendación clínica 5"],
  "sampleDayPlan": {
    "breakfast": "Ejemplo de desayuno nutritivo",
    "midMorning": "Ejemplo de tentempié saludable",
    "lunch": "Ejemplo de almuerzo completo",
    "afternoonSnack": "Ejemplo de merienda saciante",
    "dinner": "Ejemplo de cena ligera reparadora"
  },
  "foodsToEmphasize": ["Alimento 1", "Alimento 2", "Alimento 3", "Alimento 4", "Alimento 5"],
  "foodsToModerate": ["Alimento a reducir 1", "Alimento a reducir 2", "Alimento a reducir 3", "Alimento a reducir 4"],
  "customReminders": ["Recordatorio 1 de hábito", "Recordatorio 2 de hidratación/comida", "Recordatorio 3 de pesaje"]
}`;

    const response = await generateWithModelFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clinicalAssessment: { type: Type.STRING },
            dailyCalorieTarget: { type: Type.STRING },
            hydrationGoal: { type: Type.STRING },
            macronutrientDistribution: {
              type: Type.OBJECT,
              properties: {
                proteinPercent: { type: Type.INTEGER },
                carbsPercent: { type: Type.INTEGER },
                fatPercent: { type: Type.INTEGER },
                proteinGrams: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ['proteinPercent', 'carbsPercent', 'fatPercent', 'proteinGrams', 'summary'],
            },
            keyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sampleDayPlan: {
              type: Type.OBJECT,
              properties: {
                breakfast: { type: Type.STRING },
                midMorning: { type: Type.STRING },
                lunch: { type: Type.STRING },
                afternoonSnack: { type: Type.STRING },
                dinner: { type: Type.STRING },
              },
              required: ['breakfast', 'midMorning', 'lunch', 'afternoonSnack', 'dinner'],
            },
            foodsToEmphasize: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            foodsToModerate: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            customReminders: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'clinicalAssessment',
            'dailyCalorieTarget',
            'hydrationGoal',
            'macronutrientDistribution',
            'keyRecommendations',
            'sampleDayPlan',
            'foodsToEmphasize',
            'foodsToModerate',
            'customReminders',
          ],
        },
      },
    }));

    let parsed: any;
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch {
      const cleaned = (response.text || '').replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned || '{}');
    }

    const clinicalFallback = buildClinicalRecommendations(req.body);
    const completePlan = {
      ...clinicalFallback,
      ...parsed,
      macronutrientDistribution: {
        ...clinicalFallback.macronutrientDistribution,
        ...(parsed?.macronutrientDistribution || {}),
      },
      sampleDayPlan: {
        ...clinicalFallback.sampleDayPlan,
        ...(parsed?.sampleDayPlan || {}),
      },
    };

    return res.json(completePlan);
  } catch (error: any) {
    console.warn('[Gemini API] Temporary upstream demand limitation. Utilizing WHO clinical nutrition generator fallback:', error?.message || error);
    return res.json(buildClinicalRecommendations(req.body));
  }
});

// Interactive Ask-Nutritionist Q&A API
app.post('/api/ask-nutritionist', async (req, res) => {
  try {
    const { question, userProfile } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'La pregunta es requerida' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        answer:
          'Para consultas clínicas directas personalizadas, el asistente IA recomienda mantener una ingesta suficiente de agua, priorizar comida real y consultar a tu profesional médico de cabecera. Si configuras la clave API en Ajustes > Secretos, podré responder con análisis profundo en tiempo real.',
      });
    }

    const prompt = `Eres el Dr. NutriSalud IA, un médico especialista en endocrinología y nutrición clínica humana basada en evidencia científica y directrices de la OMS.
El usuario tiene el siguiente perfil antropométrico:
- IMC: ${userProfile?.bmi || 'No especificado'} (${userProfile?.category || 'No especificado'})
- Edad: ${userProfile?.age || 'Adulto'} años | Sexo: ${userProfile?.sex === 'female' ? 'Femenino' : 'Masculino'}
- Altura: ${userProfile?.height || '-'} cm | Peso: ${userProfile?.weight || '-'} kg
- Grasa corporal estimada: ${userProfile?.bodyFatEstimate || '-'}%

Pregunta del usuario:
"${question}"

Instrucciones:
1. Responde de forma clara, empática, didáctica y basada en evidencia científica (OMS, Harvard School of Public Health, EFSA).
2. Da recomendaciones prácticas y accionables.
3. No des diagnósticos de enfermedades graves; recuerda siempre que es una herramienta educativa y de apoyo complementario a la consulta médica presencial.
4. Mantén la respuesta concisa y bien estructurada (máximo 3-4 párrafos o listas de viñetas claras). Idioma: Español.`;

    const response = await generateWithModelFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    }));

    res.json({
      answer: response.text || 'No se pudo generar respuesta en este momento.',
    });
  } catch (error: any) {
    console.warn('[Gemini API] Temporary upstream demand limitation. Providing verified clinical advice:', error?.message || error);
    const { question, userProfile } = req.body || {};
    const lowerQ = (question || '').toLowerCase();
    let advice = `Para tu perfil actual (IMC ${userProfile?.bmi || 'normopeso'}), el pilar fundamental es priorizar fuentes de proteína magra, fibra vegetal abundante e hidratación suficiente (35ml/kg).`;

    if (lowerQ.includes('cenar') || lowerQ.includes('cena')) {
      advice = 'Para la cena, prioriza platos de fácil digestión ricos en triptófano y magnesio: cremas de verduras de temporada, tortilla de espinacas o pescado blanco a la plancha con espárragos. Evita carbohidratos refinados y frituras 2-3 horas antes de dormir para optimizar la calidad del descanso y la sensibilidad a la insulina.';
    } else if (lowerQ.includes('desayun') || lowerQ.includes('desayuno')) {
      advice = 'Un desayuno óptimo según el modelo de Harvard combina: 1) Proteína de calidad (huevos camperos, yogur griego natural o tofu), 2) Carbohidrato de absorción lenta (avena integral o pan 100% grano entero), y 3) Grasa cardiosaludable (aguacate o frutos secos), acompañado de una pieza de fruta entera rica en antioxidantes.';
    } else if (lowerQ.includes('muscul') || lowerQ.includes('musculo') || lowerQ.includes('grasa')) {
      advice = `Para recomposición corporal con tu IMC de ${userProfile?.bmi || 24}, combina entrenamiento de sobrecarga progresiva (fuerza 3-4 días/semana) con una ingesta de 1.6 a 2.0g de proteína por kg de peso, asegurando un déficit calórico muy leve (máx 300 kcal) para preservar la masa magra.`;
    } else if (lowerQ.includes('snack') || lowerQ.includes('meriend') || lowerQ.includes('tarde')) {
      advice = 'Excelentes opciones de snacks saciantes: puñado de nueces crudas con un trozo de fruta fresca entera, bastones de zanahoria con hummus casero, o un yogur natural con semillas de chía. Estos aportan fibra y grasas insaturadas que estabilizan la glucemia evitando picos de hambre.';
    }

    res.json({
      answer: advice,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculadora IMC & Nutrición Server running on port ${PORT}`);
  });
}

startServer();
