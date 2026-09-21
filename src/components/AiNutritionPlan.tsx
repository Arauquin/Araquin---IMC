import React, { useState } from 'react';
import {
  NutritionPlan,
  UserProfile,
  ClinicalCalculations,
} from '../types';
import {
  Sparkles,
  RefreshCw,
  Utensils,
  Droplets,
  Flame,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Apple,
  ShieldAlert,
  PlusCircle,
  ThumbsUp,
} from 'lucide-react';

interface AiNutritionPlanProps {
  plan: NutritionPlan | null;
  isLoading: boolean;
  onRefreshPlan: () => void;
  profile: UserProfile;
  calculations: ClinicalCalculations;
  onAddReminder: (title: string, type: 'weigh_in' | 'water' | 'meal_prep' | 'physical_activity') => void;
}

export const AiNutritionPlan: React.FC<AiNutritionPlanProps> = ({
  plan,
  isLoading,
  onRefreshPlan,
  profile,
  calculations,
  onAddReminder,
}) => {
  // Chat state with the AI Nutritionist
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([
    {
      role: 'assistant',
      text: `¡Hola! Soy tu asistente de nutrición clínica IA. He evaluado tu perfil (IMC ${calculations.bmi} - ${calculations.category.shortName}, ${profile.age} años, sexo ${profile.sex === 'female' ? 'femenino' : 'masculino'}). ¿Tienes alguna duda sobre tus porciones, recetas o cómo adaptar tu alimentación?`,
    },
  ]);

  const quickQuestions = [
    '¿Qué cenar para tener saciedad y descansar mejor?',
    'Ideas de desayunos ricos en proteína y fibra',
    '¿Cómo mantener la masa muscular si busco perder grasa?',
    'Snacks saludables y rápidos para media tarde',
  ];

  const handleAskQuestion = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || isAsking) return;

    const userMsg = textToSend.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    if (!queryText) setQuestion('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/ask-nutritionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          userProfile: {
            bmi: calculations.bmi,
            category: calculations.category.name,
            age: profile.age,
            sex: profile.sex,
            height: profile.height,
            weight: profile.weight,
            bodyFatEstimate: calculations.bodyFatPercentage,
          },
        }),
      });

      const data = await res.json();
      const reply = data.answer || 'Disculpa, no he podido procesar tu consulta en este momento.';
      setChatHistory((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Ha ocurrido un problema de conexión con el asistente clínico. Por favor, intenta de nuevo en unos segundos.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Trigger */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Inteligencia Artificial Clínica (Gemini 3.8 Flash)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Plan Nutricional Personalizado para IMC {calculations.bmi}
          </h2>
          <p className="text-xs text-slate-500">
            Estrategia clínica individualizada según directrices de la OMS y el Modelo de Harvard
          </p>
        </div>

        <button
          onClick={onRefreshPlan}
          disabled={isLoading}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analizando con IA...' : 'Actualizar Recomendaciones'}</span>
        </button>
      </div>

      {isLoading && !plan ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="inline-block p-4 rounded-2xl bg-teal-50 text-teal-700 animate-bounce mb-3">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Generando plan nutricional clínico...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Gemini está calculando la distribución óptima de macronutrientes y las directrices OMS para tu perfil.
          </p>
        </div>
      ) : plan ? (
        <>
          {/* Clinical Assessment Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Apple className="h-4 w-4 text-teal-600" />
              <span>Evaluación Clínica &amp; Contexto Metabólico</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {plan.clinicalAssessment}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-800">
                    Objetivo Calórico Sugerido
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {plan.dailyCalorieTarget}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-800">
                    Hidratación Diaria OMS
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {plan.hydrationGoal}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Utensils className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">
                    Proteína Recomendada
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {plan.macronutrientDistribution.proteinGrams} diarios
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Macronutrients & Healthy Plate Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Macro Distribution Cards */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Distribución de Macronutrientes
                </h3>
                <p className="text-xs text-slate-500">
                  {plan.macronutrientDistribution.summary}
                </p>
              </div>

              {/* Multi-segment progress bar */}
              <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                <div
                  style={{ width: `${plan.macronutrientDistribution.proteinPercent}%` }}
                  className="bg-teal-600 h-full"
                  title={`Proteínas ${plan.macronutrientDistribution.proteinPercent}%`}
                />
                <div
                  style={{ width: `${plan.macronutrientDistribution.carbsPercent}%` }}
                  className="bg-amber-500 h-full"
                  title={`Carbohidratos ${plan.macronutrientDistribution.carbsPercent}%`}
                />
                <div
                  style={{ width: `${plan.macronutrientDistribution.fatPercent}%` }}
                  className="bg-sky-500 h-full"
                  title={`Grasas saludables ${plan.macronutrientDistribution.fatPercent}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">
                    Proteínas
                  </span>
                  <span className="text-base font-extrabold text-teal-900 font-mono">
                    {plan.macronutrientDistribution.proteinPercent}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    Carbohidratos
                  </span>
                  <span className="text-base font-extrabold text-amber-900 font-mono">
                    {plan.macronutrientDistribution.carbsPercent}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">
                    Grasas Saludables
                  </span>
                  <span className="text-base font-extrabold text-sky-900 font-mono">
                    {plan.macronutrientDistribution.fatPercent}%
                  </span>
                </div>
              </div>

              {/* Foods to Emphasize vs Moderate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 mb-2">
                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                    Alimentos a Potenciar
                  </span>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    {plan.foodsToEmphasize.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1 mb-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                    Alimentos a Moderar
                  </span>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    {plan.foodsToModerate.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Clinical Recommendations */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Directrices Clave de Estilo de Vida
                </h3>
                <p className="text-xs text-slate-500">
                  Hábitos basados en consensos de medicina preventiva y la OMS
                </p>
              </div>

              <div className="space-y-2.5">
                {plan.keyRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                  >
                    <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              {/* Recommended Habit Reminders from AI */}
              {plan.customReminders && plan.customReminders.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    Recordatorios sugeridos por la IA para este plan:
                  </span>
                  <div className="space-y-1.5">
                    {plan.customReminders.map((rem, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-teal-50/60 border border-teal-100 text-xs"
                      >
                        <span className="text-slate-800 font-medium truncate mr-2">
                          {rem}
                        </span>
                        <button
                          onClick={() =>
                            onAddReminder(
                              rem,
                              idx === 0 ? 'weigh_in' : idx === 1 ? 'water' : 'physical_activity'
                            )
                          }
                          className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px] shrink-0"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Activar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample Full Day Meal Plan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ejemplo de Menú Diario Equilibrado
              </h3>
              <p className="text-xs text-slate-500">
                Propuesta de comida real rica en micronutrientes, saciedad y densidad nutricional
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                  1. Desayuno
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {plan.sampleDayPlan.breakfast}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                  2. Media Mañana
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {plan.sampleDayPlan.midMorning}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  3. Almuerzo Principal
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {plan.sampleDayPlan.lunch}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block mb-1">
                  4. Merienda Saciante
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {plan.sampleDayPlan.afternoonSnack}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-1">
                  5. Cena Reparadora
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {plan.sampleDayPlan.dinner}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Interactive Chat with the AI Nutritionist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-600 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Consulta Interactiva con el Nutricionista IA
            </h3>
            <p className="text-xs text-slate-500">
              Pregunta tus dudas sobre alimentos, recetas o adaptaciones a tu rutina
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 px-3 py-1.5 rounded-xl border border-slate-200/60 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat message bubbles */}
        <div className="bg-slate-50 rounded-2xl p-4 max-h-[320px] overflow-y-auto space-y-3 border border-slate-200/60">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white font-medium rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isAsking && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl p-3 text-xs flex items-center gap-2 shadow-2xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
                <span>Analizando con base de datos nutricional...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Escribe tu consulta al nutricionista..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isAsking}
            className="flex-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preguntar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
