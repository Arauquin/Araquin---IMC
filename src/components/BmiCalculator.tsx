import React, { useState } from 'react';
import {
  UserProfile,
  ClinicalCalculations,
} from '../types';
import { WhoScaleGauge } from './WhoScaleGauge';
import { isEmailValid, validateEmailFormat } from '../utils/clinicalFormulas';
import {
  Scale,
  User,
  Calendar,
  Flame,
  Droplets,
  Heart,
  ChevronRight,
  Sparkles,
  BookmarkPlus,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Mail,
  Trash2,
  FileText,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BmiCalculatorProps {
  profile: UserProfile;
  calculations: ClinicalCalculations;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onSaveProfile?: (profile: UserProfile) => { success: boolean; error: string | null } | void;
  onLogCurrentMeasurement: () => void;
  onNavigateToNutrition: () => void;
  onOpenWhoModal: () => void;
  onOpenReport?: () => void;
  onClearAllData?: () => void;
  isLoggedForToday: boolean;
}

export const BmiCalculator: React.FC<BmiCalculatorProps> = ({
  profile,
  calculations,
  onUpdateProfile,
  onSaveProfile,
  onLogCurrentMeasurement,
  onNavigateToNutrition,
  onOpenWhoModal,
  onOpenReport,
  onClearAllData,
  isLoggedForToday,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const hasValidEmail = isEmailValid(profile.email);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailTouched(true);

    const validation = validateEmailFormat(profile.email);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'El correo electrónico no es válido.';
      setEmailError(errorMsg);
      setSaveFeedback({
        type: 'error',
        message: `No se puede guardar el perfil: ${errorMsg}`,
      });
      const inputEl = document.getElementById('input-email');
      inputEl?.focus();
      return false;
    }

    setEmailError(null);

    if (onSaveProfile) {
      const res = onSaveProfile(profile);
      if (res && !res.success) {
        setSaveFeedback({
          type: 'error',
          message: res.error || 'Error al guardar el perfil.',
        });
        return false;
      }
    } else {
      onUpdateProfile(profile);
    }

    setSaveFeedback({
      type: 'success',
      message: '¡Perfil guardado con éxito! Tus datos antropométricos y correo electrónico han sido validados y guardados.',
    });

    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setSaveFeedback((prev) => (prev?.type === 'success' ? null : prev));
    }, 4500);

    return true;
  };

  const handleLogClick = () => {
    const validation = validateEmailFormat(profile.email);
    if (!validation.isValid) {
      setEmailTouched(true);
      setEmailError(validation.error);
      setSaveFeedback({
        type: 'error',
        message: `No se puede registrar la medición: ${validation.error}`,
      });
      const inputEl = document.getElementById('input-email');
      inputEl?.focus();
      return;
    }

    onLogCurrentMeasurement();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Age-specific WHO adjustments */}
      {calculations.isElderlyAdjusted ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Ajuste Geriátrico Clínico (OMS/ESPEN):</span>{' '}
            {calculations.ageContextMessage}
          </div>
        </div>
      ) : profile.age < 18 ? (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Ajuste Pediátrico:</span> {calculations.ageContextMessage}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Anthropometric Input Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Datos Antropométricos
              </h2>
              <p className="text-xs text-slate-700">
                Introduce tus medidas para una evaluación de alta precisión
              </p>
            </div>
            <button
              onClick={onOpenWhoModal}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Ver Escalas OMS</span>
            </button>
          </div>

          {/* Correo Electrónico (Requerido para cálculos e informe) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="input-email" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-teal-600" />
                <span>Correo Electrónico</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              {hasValidEmail ? (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Formato válido
                </span>
              ) : (
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Requerido para guardar perfil
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="input-email"
                type="email"
                required
                aria-required="true"
                aria-invalid={!hasValidEmail && (emailTouched || !!emailError)}
                aria-describedby={!hasValidEmail && (emailTouched || !!emailError) ? 'email-format-error' : undefined}
                placeholder="ejemplo@correo.com"
                value={profile.email || ''}
                onBlur={() => {
                  setEmailTouched(true);
                  const validation = validateEmailFormat(profile.email);
                  setEmailError(validation.isValid ? null : validation.error);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmailTouched(true);
                  onUpdateProfile({ email: val });
                  const validation = validateEmailFormat(val);
                  setEmailError(validation.isValid ? null : validation.error);
                  if (saveFeedback) setSaveFeedback(null);
                }}
                className={`w-full text-xs sm:text-sm font-medium bg-white border rounded-xl py-2 px-3 pr-8 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  (emailTouched || !!emailError) && !hasValidEmail
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400 text-rose-900'
                    : hasValidEmail
                    ? 'border-emerald-300 focus:ring-emerald-400'
                    : 'border-slate-300 focus:ring-teal-500'
                }`}
              />
              <Mail className="h-4 w-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            {(emailTouched || !!emailError) && !hasValidEmail ? (
              <div id="email-format-error" role="alert" className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-rose-900 block">Error en correo electrónico:</span>
                  <p className="text-rose-700 leading-snug">{emailError || 'Ingresa un formato de correo válido (ej. tu@correo.com)'}</p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500">
                Se requiere un correo válido para guardar tu perfil, procesar mediciones y generar tu informe clínico oficial OMS.
              </p>
            )}
          </div>

          {/* Sex Biológico */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Sexo Biológico
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-sex-female"
                onClick={() => onUpdateProfile({ sex: 'female' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  profile.sex === 'female'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-400/20 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Mujer</span>
              </button>

              <button
                type="button"
                id="btn-sex-male"
                onClick={() => onUpdateProfile({ sex: 'male' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  profile.sex === 'male'
                    ? 'bg-sky-50 border-sky-300 text-sky-700 ring-2 ring-sky-400/20 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Hombre</span>
              </button>
            </div>
          </div>

          {/* Edad */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="input-age" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Edad
              </label>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {profile.age} años
              </span>
            </div>
            <input
              id="input-age"
              type="range"
              min="14"
              max="95"
              step="1"
              value={profile.age}
              onChange={(e) => onUpdateProfile({ age: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Altura */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="input-height" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Estatura / Altura
              </label>
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-slate-900 font-mono">
                  {profile.height}
                </span>
                <span className="text-xs text-slate-500 font-medium">cm</span>
              </div>
            </div>
            <input
              id="input-height"
              type="range"
              min="120"
              max="220"
              step="1"
              value={profile.height}
              onChange={(e) => onUpdateProfile({ height: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>120 cm</span>
              <span>170 cm</span>
              <span>220 cm</span>
            </div>
          </div>

          {/* Peso */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="input-weight" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Peso Corporal
              </label>
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-slate-900 font-mono">
                  {profile.weight}
                </span>
                <span className="text-xs text-slate-500 font-medium">kg</span>
              </div>
            </div>
            <input
              id="input-weight"
              type="range"
              min="35"
              max="180"
              step="0.5"
              value={profile.weight}
              onChange={(e) => onUpdateProfile({ weight: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>35 kg</span>
              <span>75 kg</span>
              <span>180 kg</span>
            </div>
          </div>

          {/* Toggle Advanced Clinical Metrics */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between w-full py-1"
            >
              <span>Parámetros avanzados (Cintura, Actividad, Dieta)</span>
              <span className="text-teal-600">{showAdvanced ? 'Ocultar' : 'Añadir'}</span>
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-3 mt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                {/* Perímetro de Cintura */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      Perímetro de cintura (cm)
                    </label>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {profile.waistCircumference || 80} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={profile.waistCircumference || 80}
                    onChange={(e) =>
                      onUpdateProfile({ waistCircumference: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <span className="text-[10px] text-slate-700">
                    Evalúa la grasa abdominal y el riesgo cardiovascular según la OMS.
                  </span>
                </div>

                {/* Nivel de actividad */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nivel de actividad diaria
                  </label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) =>
                      onUpdateProfile({
                        activityLevel: e.target.value as UserProfile['activityLevel'],
                      })
                    }
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="sedentary">Sedentario (Poco o ningún ejercicio)</option>
                    <option value="light">Ligero (1-3 días de ejercicio a la semana)</option>
                    <option value="moderate">Moderado (3-5 días de ejercicio a la semana)</option>
                    <option value="active">Activo (6-7 días de entrenamiento intenso)</option>
                    <option value="very_active">Muy activo (Atleta / Trabajo físico pesado)</option>
                  </select>
                </div>

                {/* Objetivo */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Objetivo personal
                  </label>
                  <select
                    value={profile.dietaryGoal}
                    onChange={(e) =>
                      onUpdateProfile({
                        dietaryGoal: e.target.value as UserProfile['dietaryGoal'],
                      })
                    }
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="improve_health">Mejorar salud metabólica general</option>
                    <option value="lose_weight">Pérdida de grasa gradual y sostenible</option>
                    <option value="maintain">Mantenimiento y recomposición corporal</option>
                    <option value="gain_muscle">Aumento de masa muscular magra</option>
                  </select>
                </div>

                {/* Preferencia dietética */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferencia dietética
                  </label>
                  <select
                    value={profile.dietaryPreferences}
                    onChange={(e) =>
                      onUpdateProfile({
                        dietaryPreferences: e.target.value as UserProfile['dietaryPreferences'],
                      })
                    }
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="mediterranean">Mediterránea (Equilibrada en grasas saludables y fibra)</option>
                    <option value="balanced">Estándar / Plato Saludable</option>
                    <option value="vegetarian">Vegetariana (Ovolactovegetariana)</option>
                    <option value="vegan">Vegana (100% origen vegetal)</option>
                    <option value="low_carb">Baja en carbohidratos refinados</option>
                    <option value="hyperproteic">Alta en proteínas (Enfoque fitness)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Guardar Perfil, Log to Monthly History & Clear Info */}
          <div className="pt-2 space-y-2.5">
            {saveFeedback && (
              <div
                id="profile-save-feedback"
                role="alert"
                className={`p-3 rounded-2xl text-xs font-semibold flex items-start gap-2.5 shadow-2xs border ${
                  saveFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {saveFeedback.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-snug">
                  <span>{saveFeedback.message}</span>
                </div>
              </div>
            )}

            {/* Botón Principal: Guardar Perfil */}
            <button
              id="btn-save-profile"
              type="button"
              onClick={handleSaveProfile}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                hasValidEmail
                  ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20 active:scale-[0.99]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
              title={hasValidEmail ? 'Guardar datos antropométricos y correo del perfil' : 'Ingresa un correo válido antes de guardar el perfil'}
            >
              <Save className="h-4 w-4" />
              <span>Guardar Perfil</span>
            </button>

            {/* Registrar en Historial Mensual */}
            <button
              id="btn-log-measurement"
              type="button"
              onClick={handleLogClick}
              className={`w-full py-2.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                !hasValidEmail
                  ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                  : isLoggedForToday
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100/70 shadow-2xs'
              }`}
            >
              {!hasValidEmail ? (
                <>
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>Introduce tu correo para registrar en el historial</span>
                </>
              ) : isLoggedForToday ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Medición registrada en el historial mensual</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Guardar en mi seguimiento mensual</span>
                </>
              )}
            </button>

            {onClearAllData && (
              <button
                id="btn-clear-all-info"
                type="button"
                onClick={() => setShowClearModal(true)}
                className="w-full py-2 px-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-2xs"
                title="Borrar correo, datos antropométricos e historial para dejar la aplicación limpia"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span>Borrar información</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Clinical Results & Indicators */}
        <div className="lg:col-span-7 space-y-6">
          {/* Email Gate / Verification Notice */}
          {!hasValidEmail ? (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-300/80 text-amber-950 flex items-start gap-3.5 shadow-xs">
              <div className="p-2 bg-amber-100/80 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-950">
                  Introduce tu correo para habilitar los cálculos y emitir el informe
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Para guardar tus registros de IMC, asociar tu evaluación oficial y generar tu informe clínico oficial OMS, es necesario ingresar tu correo electrónico en el campo superior.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-teal-950 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-700" />
                <span>
                  Evaluación activa para el paciente: <strong className="font-mono">{profile.email}</strong>
                </span>
              </div>
              {onOpenReport && (
                <button
                  type="button"
                  id="btn-open-report-banner"
                  onClick={onOpenReport}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs shrink-0"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Ver Informe Clínico</span>
                </button>
              )}
            </div>
          )}
          {/* Main BMI Result Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Índice de Masa Corporal Calculado
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {calculations.bmi}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">kg/m²</span>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: `${calculations.category.color}15`,
                      borderColor: `${calculations.category.color}40`,
                      color: calculations.category.color,
                    }}
                  >
                    {calculations.category.name}
                  </div>
                </div>
              </div>

              {/* Difference to Ideal Weight Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[200px]">
                <div className="text-[11px] font-semibold text-slate-700 uppercase">
                  Rango OMS saludable para ti
                </div>
                <div className="text-sm font-bold text-slate-800 mt-0.5 font-mono">
                  {calculations.idealWeightRange.min} - {calculations.idealWeightRange.max} kg
                </div>
                <div className="text-xs mt-1">
                  {calculations.weightDifferenceToNormal === 0 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> En rango óptimo
                    </span>
                  ) : calculations.weightDifferenceToNormal > 0 ? (
                    <span className="text-sky-700 font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" /> +{calculations.weightDifferenceToNormal} kg para rango normopeso
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5" /> {calculations.weightDifferenceToNormal} kg para rango normopeso
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* WHO Visual Gauge */}
            <div className="mt-5">
              <WhoScaleGauge
                currentBmi={calculations.bmi}
                category={calculations.category}
                isElderlyAdjusted={calculations.isElderlyAdjusted}
              />
            </div>

            {/* Clinical Health Guidance Quote */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Orientación médica oficial: </span>
              {calculations.category.clinicalAdvice}
            </div>
          </div>

          {/* Grid of Clinical Complementary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Body Fat % Deurenberg */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Grasa Corporal
                </span>
                <Scale className="h-4 w-4 text-teal-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {calculations.bodyFatPercentage}%
                </span>
                <span className="text-[10px] text-slate-700 font-medium">Deurenberg</span>
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1 truncate" title={calculations.bodyFatCategory}>
                {calculations.bodyFatCategory}
              </div>
              <div className="text-[10px] text-slate-700 mt-0.5">
                Ajustado por sexo ({profile.sex === 'female' ? 'mujer' : 'hombre'}) y {profile.age} años
              </div>
            </div>

            {/* Caloric Expenditure (TDEE / BMR) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Gasto Calórico
                </span>
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {calculations.tdee}
                </span>
                <span className="text-[11px] text-slate-700 font-medium">kcal/día</span>
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">
                Metabolismo basal: {calculations.bmr} kcal
              </div>
              <div className="text-[10px] text-slate-700 mt-0.5">
                Mifflin-St Jeor según nivel de actividad
              </div>
            </div>

            {/* Hydration / Water Goal */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Hidratación OMS
                </span>
                <Droplets className="h-4 w-4 text-sky-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {calculations.recommendedWaterLiters}
                </span>
                <span className="text-[11px] text-slate-700 font-medium">Litros/día</span>
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">
                ~{Math.round(calculations.recommendedWaterLiters * 4)} vasos de 250ml
              </div>
              <div className="text-[10px] text-slate-700 mt-0.5">
                Estándar clínico de 35 ml por kg de peso
              </div>
            </div>
          </div>

          {/* Waist / Cardiovascular Risk Card (If entered) */}
          {calculations.cardiovascularRisk && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    calculations.cardiovascularRisk === 'Bajo'
                      ? 'bg-emerald-50 text-emerald-600'
                      : calculations.cardiovascularRisk === 'Aumentado'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Riesgo Cardiovascular (Ratio Cintura-Estatura: {calculations.waistToHeightRatio})
                  </div>
                  <div className="text-xs text-slate-600">
                    Cintura {profile.waistCircumference} cm:{' '}
                    <span className="font-semibold text-slate-800">
                      Riesgo {calculations.cardiovascularRisk}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-700 hidden sm:block">
                Criterio epidemiológico OMS
              </span>
            </div>
          )}

          {/* Call-to-Action to AI Nutrition Plan */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 text-teal-200 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                <span>Asistente Nutricional Gemini</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Recomendaciones Nutricionales Personalizadas
              </h3>
              <p className="text-xs text-slate-300 max-w-md">
                Genera tu menú adaptado a tu IMC ({calculations.bmi}), macronutrientes calculados y consulta dudas clínicas a la IA.
              </p>
            </div>
            <button
              onClick={onNavigateToNutrition}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Ver Plan Nutricional</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Borrar Información */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Borrar toda la información?</h3>
                <p className="text-xs text-slate-500">Esta acción dejará el sistema completamente limpio</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              Se eliminarán tu <strong>correo electrónico</strong>, las <strong>mediciones actuales</strong>, todo el <strong>historial mensual</strong> y los <strong>planes de nutrición</strong>. Todos los datos almacenados serán borrados para que quede limpio.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-clear-data"
                onClick={() => {
                  setShowClearModal(false);
                  if (onClearAllData) {
                    onClearAllData();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Sí, borrar y dejar limpio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
