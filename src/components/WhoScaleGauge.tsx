import React from 'react';
import { WHOCategoryInfo } from '../types';
import { WHO_CATEGORIES } from '../utils/clinicalFormulas';

interface WhoScaleGaugeProps {
  currentBmi: number;
  category: WHOCategoryInfo;
  isElderlyAdjusted?: boolean;
}

export const WhoScaleGauge: React.FC<WhoScaleGaugeProps> = ({
  currentBmi,
  category,
  isElderlyAdjusted,
}) => {
  // Map BMI 14 to 45 into percentage 0% to 100%
  const minScale = 14;
  const maxScale = 42;
  const clampedBmi = Math.max(minScale, Math.min(maxScale, currentBmi));
  const pointerPercent = ((clampedBmi - minScale) / (maxScale - minScale)) * 100;

  // Major WHO breakpoints normalized to percentage
  const normalStart = ((18.5 - minScale) / (maxScale - minScale)) * 100;
  const overweightStart = ((25.0 - minScale) / (maxScale - minScale)) * 100;
  const obeseStart = ((30.0 - minScale) / (maxScale - minScale)) * 100;
  const obese2Start = ((35.0 - minScale) / (maxScale - minScale)) * 100;

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Escala Oficial OMS (Organización Mundial de la Salud)
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Clasificación Antropométrica Internacional
          </h3>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold border"
             style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}50`, color: category.color }}>
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: category.color }} />
          <span>{category.shortName} ({category.range})</span>
        </div>
      </div>

      {/* Visual Bar Spectrum */}
      <div className="relative pt-6 pb-2">
        {/* Pointer Pin with animated pulse */}
        <div
          className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
          style={{ left: `${pointerPercent}%` }}
        >
          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-bold shadow-md whitespace-nowrap">
            {currentBmi} kg/m²
          </span>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-900 mt-0.5" />
        </div>

        {/* Gauge multi-band track */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
          {/* Bajo peso (<18.5) */}
          <div
            style={{ width: `${normalStart}%` }}
            className="bg-sky-400 h-full"
            title="Bajo peso (< 18.5)"
          />
          {/* Normopeso (18.5 - 24.9) */}
          <div
            style={{ width: `${overweightStart - normalStart}%` }}
            className="bg-emerald-500 h-full relative"
            title="Normopeso saludable (18.5 - 24.9)"
          >
            {isElderlyAdjusted && (
              <div
                className="absolute inset-y-0 bg-emerald-600/40 border-l border-r border-emerald-700"
                style={{
                  left: `${((22.0 - 18.5) / (24.9 - 18.5)) * 100}%`,
                  right: 0,
                }}
                title="Rango óptimo para adultos mayores (22 - 27)"
              />
            )}
          </div>
          {/* Sobrepeso (25.0 - 29.9) */}
          <div
            style={{ width: `${obeseStart - overweightStart}%` }}
            className="bg-amber-400 h-full"
            title="Sobrepeso (25.0 - 29.9)"
          />
          {/* Obesidad I (30.0 - 34.9) */}
          <div
            style={{ width: `${obese2Start - obeseStart}%` }}
            className="bg-orange-500 h-full"
            title="Obesidad Clase I (30.0 - 34.9)"
          />
          {/* Obesidad II y III (>= 35.0) */}
          <div
            style={{ width: `${100 - obese2Start}%` }}
            className="bg-rose-600 h-full"
            title="Obesidad Clase II y III (>= 35.0)"
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[11px] text-slate-700 font-medium mt-2 px-1">
          <span>16</span>
          <span style={{ marginLeft: `${normalStart - 10}%` }}>18.5</span>
          <span>25.0</span>
          <span>30.0</span>
          <span>35.0</span>
          <span>40+</span>
        </div>
      </div>

      {/* WHO Zone Legend Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
        <div className="p-2 rounded-xl bg-sky-50/70 border border-sky-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-xs font-semibold text-slate-700">Bajo Peso</span>
          </div>
          <span className="text-[11px] text-slate-500">&lt; 18.5 kg/m²</span>
        </div>

        <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Normopeso</span>
          </div>
          <span className="text-[11px] text-slate-500">18.5 - 24.9 kg/m²</span>
        </div>

        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-slate-700">Sobrepeso</span>
          </div>
          <span className="text-[11px] text-slate-500">25.0 - 29.9 kg/m²</span>
        </div>

        <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-xs font-semibold text-slate-700">Obesidad</span>
          </div>
          <span className="text-[11px] text-slate-500">&ge; 30.0 kg/m²</span>
        </div>
      </div>
    </div>
  );
};
