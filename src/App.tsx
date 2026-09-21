import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  ProgressLogEntry,
  HealthReminder,
  NutritionPlan,
} from './types';
import {
  calculateClinicalMetrics,
  generateSeedMonthlyLogs,
  validateEmailFormat,
  isEmailValid,
} from './utils/clinicalFormulas';
import { Header } from './components/Header';
import { BmiCalculator } from './components/BmiCalculator';
import { MonthlyProgressChart } from './components/MonthlyProgressChart';
import { AiNutritionPlan } from './components/AiNutritionPlan';
import { HealthReminders } from './components/HealthReminders';
import { WhoScaleModal } from './components/WhoScaleModal';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { exportProgressLogsToCSV } from './utils/exportCsv';
import { CheckCircle2, X } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  email: '',
  height: 172,
  weight: 73.5,
  age: 34,
  sex: 'male',
  waistCircumference: 84,
  activityLevel: 'moderate',
  dietaryGoal: 'improve_health',
  dietaryPreferences: 'mediterranean',
};

const DEFAULT_REMINDERS: HealthReminder[] = [
  {
    id: 'rem-1',
    title: 'Pesaje oficial mensual (OMS)',
    description: 'Realizar la medición mensual en ayunas, tras evacuar y con ropa ligera.',
    type: 'weigh_in',
    frequency: 'monthly',
    time: '08:00',
    enabled: true,
  },
  {
    id: 'rem-2',
    title: 'Hidratación óptima (35ml/kg)',
    description: 'Completar tu meta diaria de agua e infusiones naturales sin azúcar.',
    type: 'water',
    frequency: 'daily',
    time: '11:00',
    enabled: true,
  },
  {
    id: 'rem-3',
    title: 'Preparación de comidas / Batch Cooking',
    description: 'Cocinar fuentes de proteína magra y verduras asadas para la semana.',
    type: 'meal_prep',
    frequency: 'weekly',
    time: '18:00',
    enabled: true,
  },
  {
    id: 'rem-4',
    title: '30 min de actividad física o paseo activo',
    description: 'Alcanzar los 150-300 min semanales recomendados por la OMS.',
    type: 'physical_activity',
    frequency: 'daily',
    time: '19:30',
    enabled: true,
  },
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('calculator');

  // Modals
  const [isWhoModalOpen, setIsWhoModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Server health & API key status
  const [hasApiKey, setHasApiKey] = useState(false);
  const [clearNotification, setClearNotification] = useState<string | null>(null);

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('who_imc_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PROFILE;
  });

  // Calculate clinical metrics memoized
  const calculations = useMemo(() => {
    return calculateClinicalMetrics(profile);
  }, [profile]);

  // Monthly Progress Logs
  const [logs, setLogs] = useState<ProgressLogEntry[]>(() => {
    const saved = localStorage.getItem('who_imc_logs');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return generateSeedMonthlyLogs(
      DEFAULT_PROFILE.weight,
      DEFAULT_PROFILE.height,
      DEFAULT_PROFILE.age,
      DEFAULT_PROFILE.sex
    );
  });

  // Health Reminders
  const [reminders, setReminders] = useState<HealthReminder[]>(() => {
    const saved = localStorage.getItem('who_imc_reminders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_REMINDERS;
  });

  // Nutrition Plan
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(() => {
    const saved = localStorage.getItem('who_imc_nutrition_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return null;
  });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Sync state to local storage - only persist profile if email has a valid format
  useEffect(() => {
    if (isEmailValid(profile.email)) {
      localStorage.setItem('who_imc_profile', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('who_imc_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('who_imc_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if (nutritionPlan) {
      localStorage.setItem('who_imc_nutrition_plan', JSON.stringify(nutritionPlan));
    }
  }, [nutritionPlan]);

  // Check health endpoint on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(!!data.hasApiKey);
      })
      .catch(() => {
        // server dev mode fallback
      });
  }, []);

  // Update Profile in-memory for active calculation
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Explicit Save Profile with format validation
  const handleSaveProfile = (profileToSave: UserProfile) => {
    const validation = validateEmailFormat(profileToSave.email);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'El formato del correo electrónico no es válido.',
      };
    }
    setProfile(profileToSave);
    localStorage.setItem('who_imc_profile', JSON.stringify(profileToSave));
    return { success: true, error: null };
  };

  // Check if today's measurement was already logged
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isLoggedForToday = logs.some((l) => l.date === todayDateStr);

  // Log current measurement
  const handleLogCurrentMeasurement = () => {
    const newEntry: ProgressLogEntry = {
      id: `log-${Date.now()}`,
      date: todayDateStr,
      weight: profile.weight,
      bmi: calculations.bmi,
      bodyFatPercentage: calculations.bodyFatPercentage,
      waistCircumference: profile.waistCircumference,
      notes: `Medición registrada: IMC ${calculations.bmi} (${calculations.category.shortName})`,
    };

    setLogs((prev) => {
      // Replace if today already exists, else append
      const filtered = prev.filter((l) => l.date !== todayDateStr);
      return [...filtered, newEntry];
    });
  };

  // Add custom log
  const handleAddLog = (newLog: Omit<ProgressLogEntry, 'id'>) => {
    setLogs((prev) => [
      ...prev,
      {
        ...newLog,
        id: `log-${Date.now()}`,
      },
    ]);
  };

  // Delete log
  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Reset seed logs
  const handleResetSeedLogs = () => {
    const freshSeeds = generateSeedMonthlyLogs(
      profile.weight,
      profile.height,
      profile.age,
      profile.sex
    );
    setLogs(freshSeeds);
  };

  // Clear all application data and restore pristine state
  const handleClearAllData = () => {
    // 1. Purge all localStorage keys
    localStorage.removeItem('who_imc_profile');
    localStorage.setItem('who_imc_logs', JSON.stringify([]));
    localStorage.removeItem('who_imc_nutrition_plan');
    localStorage.removeItem('who_imc_reminders');

    // 2. Reset profile state with empty email and default biometric values
    setProfile({
      email: '',
      height: 170,
      weight: 70,
      age: 30,
      sex: 'male',
      waistCircumference: undefined,
      activityLevel: 'moderate',
      dietaryGoal: 'improve_health',
      dietaryPreferences: 'mediterranean',
    });

    // 3. Clear logs, meal plan, and reminders
    setLogs([]);
    setNutritionPlan(null);
    setReminders([]);

    // 4. Notify user
    setClearNotification('Toda la información ha sido borrada exitosamente. El correo, formulario y registros han quedado completamente limpios.');
    setTimeout(() => {
      setClearNotification(null);
    }, 7000);
  };

  // Reminders actions
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleCompleteReminderToday = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, lastCompletedDate: todayDateStr } : r
      )
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (newRem: Omit<HealthReminder, 'id'>) => {
    setReminders((prev) => [
      ...prev,
      {
        ...newRem,
        id: `rem-${Date.now()}`,
      },
    ]);
  };

  // Fetch or generate AI Nutrition Plan
  const handleGenerateNutritionPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch('/api/nutrition-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: profile.height,
          weight: profile.weight,
          age: profile.age,
          sex: profile.sex,
          bmi: calculations.bmi,
          category: calculations.category.name,
          bodyFatEstimate: calculations.bodyFatPercentage,
          idealWeightMin: calculations.idealWeightRange.min,
          idealWeightMax: calculations.idealWeightRange.max,
          activityLevel: profile.activityLevel,
          dietaryGoal: profile.dietaryGoal,
          dietaryPreferences: profile.dietaryPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar recomendaciones nutricionales');
      }

      const planData = await response.json();
      setNutritionPlan(planData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Load plan initially if not present
  useEffect(() => {
    if (!nutritionPlan) {
      handleGenerateNutritionPlan();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportModalOpen(true)}
        onExportCsv={() => exportProgressLogsToCSV(logs, profile)}
        onClearAllData={handleClearAllData}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {clearNotification && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-xs transition-all">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{clearNotification}</span>
            </div>
            <button
              onClick={() => setClearNotification(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 hover:bg-emerald-100/60 rounded-lg transition-colors"
              title="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeTab === 'calculator' && (
          <BmiCalculator
            profile={profile}
            calculations={calculations}
            onUpdateProfile={handleUpdateProfile}
            onSaveProfile={handleSaveProfile}
            onLogCurrentMeasurement={handleLogCurrentMeasurement}
            onNavigateToNutrition={() => setActiveTab('nutrition')}
            onOpenWhoModal={() => setIsWhoModalOpen(true)}
            onOpenReport={() => setIsReportModalOpen(true)}
            onClearAllData={handleClearAllData}
            isLoggedForToday={isLoggedForToday}
          />
        )}

        {activeTab === 'progress' && (
          <MonthlyProgressChart
            logs={logs}
            profile={profile}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            onResetSeedLogs={handleResetSeedLogs}
          />
        )}

        {activeTab === 'nutrition' && (
          <AiNutritionPlan
            plan={nutritionPlan}
            isLoading={isGeneratingPlan}
            onRefreshPlan={handleGenerateNutritionPlan}
            profile={profile}
            calculations={calculations}
            onAddReminder={(title, type) => {
              handleAddReminder({
                title,
                description: 'Recordatorio sugerido por tu plan nutricional de la IA',
                type,
                frequency: 'daily',
                time: '09:00',
                enabled: true,
              });
              setActiveTab('reminders');
            }}
          />
        )}

        {activeTab === 'reminders' && (
          <HealthReminders
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onCompleteReminderToday={handleCompleteReminderToday}
            onDeleteReminder={handleDeleteReminder}
            onAddReminder={handleAddReminder}
          />
        )}
      </main>

      {/* Global Modals */}
      <WhoScaleModal
        isOpen={isWhoModalOpen}
        onClose={() => setIsWhoModalOpen(false)}
        userBmi={calculations.bmi}
      />

      <ClinicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        profile={profile}
        calculations={calculations}
        logs={logs}
        nutritionPlan={nutritionPlan}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>
            Calculadora IMC Clínico &amp; Nutrición IA &bull; Basada en los estándares de la <strong>Organización Mundial de la Salud (OMS)</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            Ajustes geriátricos (ESPEN/SEGG) y pediátricos &bull; Estimación de grasa de Deurenberg &bull; Asistente Nutricional con Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}
