import React from 'react';
import { X, ShieldAlert, CheckCircle2, Info, BookOpen } from 'lucide-react';
import { WHO_CATEGORIES } from '../utils/clinicalFormulas';

interface WhoScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBmi: number;
}

export const WhoScaleModal: React.FC<WhoScaleModalProps> = ({
  isOpen,
  onClose,
  userBmi,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Clasificación Oficial OMS del IMC
              </h3>
              <p className="text-xs text-slate-700">
                Directrices antropométricas de la Organización Mundial de la Salud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Nota clínica importante:</span> El IMC es un indicador poblacional de adiposidad. Aunque es la herramienta epidemiológica de referencia de la OMS, no distingue directamente entre masa muscular magra y tejido adiposo. Por este motivo, nuestro sistema clínico complementa el IMC con la <span className="font-semibold text-slate-800">edad, sexo biológico, porcentaje graso de Deurenberg</span> y perímetro de cintura.
          </div>

          <div className="space-y-3">
            {WHO_CATEGORIES.map((cat) => {
              const isUserCategory = userBmi >= cat.min && userBmi <= cat.max;
              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUserCategory
                      ? `${cat.bgColor} ${cat.borderColor} ring-2 ring-offset-1 ring-teal-500`
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h4 className="font-bold text-sm text-slate-900">
                        {cat.name}
                      </h4>
                      {isUserCategory && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-teal-600 text-white">
                          Tu clasificación actual
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                      {cat.range} kg/m²
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 mt-2">
                    <div className="flex items-start gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-700">Riesgo en salud:</strong> {cat.healthRisk}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-700">Consejo clínico:</strong> {cat.clinicalAdvice}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
