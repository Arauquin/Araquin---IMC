import React, { useState } from 'react';
import {
  UserProfile,
  ClinicalCalculations,
  ProgressLogEntry,
  NutritionPlan,
} from '../types';
import { Printer, X, HeartPulse, CheckCircle2, ShieldAlert, Download, Mail, AlertTriangle } from 'lucide-react';
import { exportProgressLogsToCSV } from '../utils/exportCsv';
import { isEmailValid, validateEmailFormat } from '../utils/clinicalFormulas';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  calculations: ClinicalCalculations;
  logs: ProgressLogEntry[];
  nutritionPlan: NutritionPlan | null;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  calculations,
  logs,
  nutritionPlan,
  onUpdateProfile,
}) => {
  const [modalEmail, setModalEmail] = useState(profile.email || '');
  const [emailSaved, setEmailSaved] = useState(false);
  const [modalEmailError, setModalEmailError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validEmail = isEmailValid(profile.email);

  const handleSaveModalEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEmailFormat(modalEmail);
    if (!validation.isValid) {
      setModalEmailError(validation.error);
      return;
    }

    setModalEmailError(null);
    if (onUpdateProfile) {
      onUpdateProfile({ email: modalEmail.trim() });
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Informe Antropométrico &amp; Clínico OMS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!validEmail) {
                  alert('Por favor ingresa tu correo electrónico para exportar el informe clínico.');
                  return;
                }
                exportProgressLogsToCSV(logs, profile);
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
              title="Descargar todos los registros en formato CSV para Excel o análisis nutricional"
            >
              <Download className="h-4 w-4 text-teal-600" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => {
                if (!validEmail) {
                  alert('Por favor ingresa tu correo electrónico para imprimir o generar el PDF del informe clínico.');
                  return;
                }
                handlePrint();
              }}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Email Warning / Input Banner */}
        {!validEmail ? (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 print:hidden shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Correo electrónico requerido para emitir el informe clínico
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Para que este informe clínico tenga validez antropométrica asociada al paciente, por favor ingresa tu correo:
                </p>
              </div>
            </div>
            <form onSubmit={handleSaveModalEmail} className="space-y-2">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={modalEmail}
                    onChange={(e) => {
                      setModalEmail(e.target.value);
                      if (modalEmailError) setModalEmailError(null);
                    }}
                    className={`w-full text-xs font-medium bg-white border rounded-xl py-2 px-3 pl-8 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                      modalEmailError
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-amber-300 focus:ring-teal-500'
                    }`}
                  />
                  <Mail className="h-4 w-4 text-amber-600 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 bg-teal-700 hover:bg-teal-800 text-white"
                >
                  Guardar Correo
                </button>
              </div>
              {modalEmailError && (
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  <span>{modalEmailError}</span>
                </div>
              )}
            </form>
          </div>
        ) : emailSaved ? (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 print:hidden">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Correo asociado exitosamente al informe clínico.</span>
          </div>
        ) : null}

        {/* Printable Document Content */}
        <div className="p-8 space-y-6 text-slate-800" id="printable-clinical-report">
          {/* Document Header */}
          <div className="border-b border-slate-300 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                INFORME DE EVALUACIÓN ANTROPOMÉTRICA &amp; IMC
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Criterios Oficiales de la Organización Mundial de la Salud (OMS)
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Fecha: <strong className="text-slate-700">{currentDate}</strong></div>
              <div>Versión clínica: 2026.1</div>
            </div>
          </div>

          {/* Patient Identification Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200/80 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-teal-600 text-white rounded-lg">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-800 block uppercase tracking-wider">
                  Paciente / Correo Electrónico
                </span>
                <span className="text-sm font-bold text-teal-950 font-mono">
                  {profile.email || 'No registrado (requerido para informe oficial)'}
                </span>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-teal-700 font-bold block uppercase tracking-wider">
                Protocolo Antropométrico
              </span>
              <span className="text-xs font-semibold text-teal-900">
                Estándares OMS &amp; Clínicos
              </span>
            </div>
          </div>

          {/* User Clinical Profile Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                Estatura / Altura
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {profile.height} cm
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                Peso Actual
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {profile.weight} kg
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                Edad &amp; Sexo
              </span>
              <span className="text-sm font-bold text-slate-900">
                {profile.age} años ({profile.sex === 'female' ? 'Mujer' : 'Hombre'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                Riesgo Cardiovascular
              </span>
              <span className="text-sm font-bold text-slate-900">
                {calculations.cardiovascularRisk || 'No evaluado'}
              </span>
            </div>
          </div>

          {/* Core WHO Classification Box */}
          <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Índice de Masa Corporal (IMC)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {calculations.bmi} kg/m²
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${calculations.category.color}15`,
                      color: calculations.category.color,
                      borderColor: `${calculations.category.color}40`,
                    }}
                  >
                    {calculations.category.name}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 sm:text-right">
                <div>Rango normopeso saludable OMS: <strong className="text-slate-900">{calculations.idealWeightRange.min} - {calculations.idealWeightRange.max} kg</strong></div>
                <div>Grasa corporal estimada (Deurenberg): <strong className="text-slate-900">{calculations.bodyFatPercentage}%</strong></div>
              </div>
            </div>

            <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
              <strong>Contexto clínico:</strong> {calculations.category.clinicalAdvice}
            </p>
          </div>

          {/* Monthly Progression Summary Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Historial de Progreso Mensual (Últimas mediciones)
              </h3>
              <button
                onClick={() => exportProgressLogsToCSV(logs, profile)}
                className="print:hidden text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 transition-colors"
                title="Descargar archivo CSV con todo el historial"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar CSV</span>
              </button>
            </div>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Peso</th>
                  <th className="py-2 px-3">IMC</th>
                  <th className="py-2 px-3">% Grasa</th>
                  <th className="py-2 px-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.slice(-6).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 px-3 font-medium">{log.date}</td>
                    <td className="py-2 px-3 font-mono font-bold">{log.weight} kg</td>
                    <td className="py-2 px-3 font-mono font-bold">{log.bmi}</td>
                    <td className="py-2 px-3 font-mono">{log.bodyFatPercentage}%</td>
                    <td className="py-2 px-3 text-slate-500">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Clinical Recommendations (if present) */}
          {nutritionPlan && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Plan de Nutrición Clínica &amp; Hábitos
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {nutritionPlan.clinicalAssessment}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Metas Nutricionales Clave:
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    <li>&bull; Ingesta energética: {nutritionPlan.dailyCalorieTarget}</li>
                    <li>&bull; Hidratación objetivo: {nutritionPlan.hydrationGoal}</li>
                    <li>&bull; Aporte proteico: {nutritionPlan.macronutrientDistribution.proteinGrams}</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Recomendaciones de Estilo de Vida:
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {nutritionPlan.keyRecommendations.slice(0, 3).map((rec, i) => (
                      <li key={i}>&bull; {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Footer Disclaimer */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 text-center leading-relaxed">
            Este informe es una herramienta digital de cálculo basada en las directrices antropométricas de la Organización Mundial de la Salud (OMS). No sustituye el diagnóstico clínico ni la prescripción facultativa individualizada realizada por un médico especialista o dietista-nutricionista colegiado.
          </div>
        </div>
      </div>
    </div>
  );
};
