import React, { useState } from 'react';
import { ProgressLogEntry, UserProfile, WHOCategoryInfo } from '../types';
import { getWHOCategory, calculateDeurenbergBodyFat } from '../utils/clinicalFormulas';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Trash2,
  Calendar,
  Scale,
  Sparkles,
  Info,
  RotateCcw,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { exportProgressLogsToCSV } from '../utils/exportCsv';

interface MonthlyProgressChartProps {
  logs: ProgressLogEntry[];
  profile: UserProfile;
  onAddLog: (log: Omit<ProgressLogEntry, 'id'>) => void;
  onDeleteLog: (id: string) => void;
  onResetSeedLogs: () => void;
}

export const MonthlyProgressChart: React.FC<MonthlyProgressChartProps> = ({
  logs,
  profile,
  onAddLog,
  onDeleteLog,
  onResetSeedLogs,
}) => {
  const [metricMode, setMetricMode] = useState<'weight' | 'bmi' | 'bodyFat'>('weight');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState(profile.weight);
  const [newNotes, setNewNotes] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort logs chronologically
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Net statistics calculation
  const firstLog = sortedLogs[0];
  const lastLog = sortedLogs[sortedLogs.length - 1];

  const weightChange =
    firstLog && lastLog ? Math.round((lastLog.weight - firstLog.weight) * 10) / 10 : 0;
  const bmiChange =
    firstLog && lastLog ? Math.round((lastLog.bmi - firstLog.bmi) * 10) / 10 : 0;
  const fatChange =
    firstLog && lastLog
      ? Math.round((lastLog.bodyFatPercentage - firstLog.bodyFatPercentage) * 10) / 10
      : 0;

  // Chart plotting variables
  const dataPoints = sortedLogs.map((log) => ({
    date: log.date,
    label: new Date(log.date).toLocaleDateString('es-ES', {
      month: 'short',
      year: '2-digit',
    }),
    value:
      metricMode === 'weight'
        ? log.weight
        : metricMode === 'bmi'
        ? log.bmi
        : log.bodyFatPercentage,
    rawLog: log,
  }));

  const values = dataPoints.map((d) => d.value);
  const minVal = values.length ? Math.min(...values) : 50;
  const maxVal = values.length ? Math.max(...values) : 80;
  const padding = (maxVal - minVal) * 0.15 || 5;
  const domainMin = Math.max(0, Math.floor(minVal - padding));
  const domainMax = Math.ceil(maxVal + padding);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 240;
  const margin = { top: 25, right: 30, bottom: 40, left: 55 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const getX = (index: number) => {
    if (dataPoints.length <= 1) return margin.left + innerWidth / 2;
    return margin.left + (index / (dataPoints.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (domainMax === domainMin) return margin.top + innerHeight / 2;
    return (
      margin.top +
      innerHeight -
      ((val - domainMin) / (domainMax - domainMin)) * innerHeight
    );
  };

  // Generate SVG path line
  const pathD = dataPoints.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.value);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Area under curve
  const areaD = dataPoints.length
    ? `${pathD} L ${getX(dataPoints.length - 1)} ${margin.top + innerHeight} L ${getX(
        0
      )} ${margin.top + innerHeight} Z`
    : '';

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const heightM = profile.height / 100;
    const calculatedBmi = Math.round((newWeight / (heightM * heightM)) * 10) / 10;
    const { percentage: fatVal } = calculateDeurenbergBodyFat(
      calculatedBmi,
      profile.age,
      profile.sex
    );

    onAddLog({
      date: newDate,
      weight: Number(newWeight),
      bmi: calculatedBmi,
      bodyFatPercentage: fatVal,
      notes: newNotes.trim() || undefined,
    });

    setNewNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Metric Header & Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Weight Change */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Variación de Peso Neta
            </span>
            <Scale className="h-4 w-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold font-mono ${
                weightChange < 0
                  ? 'text-teal-700'
                  : weightChange > 0
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}
            >
              {weightChange > 0 ? `+${weightChange}` : weightChange} kg
            </span>
            <span className="text-xs text-slate-700 font-medium">
              en {sortedLogs.length} meses
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1">
            {weightChange < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-teal-600" />
            ) : weightChange > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>
              Inicial: {firstLog ? `${firstLog.weight} kg` : '-'} &rarr; Actual:{' '}
              {lastLog ? `${lastLog.weight} kg` : '-'}
            </span>
          </div>
        </div>

        {/* Net BMI Change */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Evolución de IMC
            </span>
            <span className="text-xs font-bold text-slate-700 font-mono">OMS</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold font-mono ${
                bmiChange < 0
                  ? 'text-teal-700'
                  : bmiChange > 0
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}
            >
              {bmiChange > 0 ? `+${bmiChange}` : bmiChange}
            </span>
            <span className="text-xs text-slate-700 font-medium">puntos IMC</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            {lastLog ? getWHOCategory(lastLog.bmi).shortName : '-'}
          </div>
        </div>

        {/* Body Fat Change */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Grasa Corporal
            </span>
            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
              Deurenberg
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold font-mono ${
                fatChange < 0
                  ? 'text-teal-700'
                  : fatChange > 0
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}
            >
              {fatChange > 0 ? `+${fatChange}` : fatChange}%
            </span>
            <span className="text-xs text-slate-700 font-medium">estimado</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Ajustado para {profile.age} años y sexo {profile.sex === 'female' ? 'mujer' : 'hombre'}
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Curva de Progreso Mensual
            </h3>
            <p className="text-xs text-slate-700">
              Seguimiento cronológico con escalas oficiales de la OMS
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMetricMode('weight')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  metricMode === 'weight'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peso (kg)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('bmi')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  metricMode === 'bmi'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                IMC (kg/m²)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('bodyFat')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  metricMode === 'bodyFat'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                % Grasa
              </button>
            </div>

            <button
              onClick={() => exportProgressLogsToCSV(logs, profile)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/80 shadow-2xs"
              title="Descargar historial de progreso en formato CSV (compatible con Excel y Google Sheets)"
            >
              <Download className="h-3.5 w-3.5 text-teal-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Añadir Registro</span>
            </button>
          </div>
        </div>

        {/* SVG Chart or Empty State */}
        {dataPoints.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 my-2">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-slate-800">El historial está limpio</h4>
              <p className="text-xs text-slate-500">
                No hay mediciones guardadas. Guarda tus registros desde la calculadora o añade una nueva medición aquí.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Añadir Registro Manual</span>
              </button>
              <button
                onClick={onResetSeedLogs}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Cargar datos de ejemplo
              </button>
            </div>
          </div>
        ) : (
        <div className="relative overflow-x-auto w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px] select-none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = margin.top + innerHeight * ratio;
              const dataVal = Math.round(domainMax - (domainMax - domainMin) * ratio);
              return (
                <g key={i}>
                  <line
                    x1={margin.left}
                    y1={yVal}
                    x2={svgWidth - margin.right}
                    y2={yVal}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={margin.left - 8}
                    y={yVal + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {dataVal}
                  </text>
                </g>
              );
            })}

            {/* In BMI mode, highlight WHO Normopeso boundary (18.5 - 24.9) */}
            {metricMode === 'bmi' && (
              <g>
                <rect
                  x={margin.left}
                  y={getY(24.9)}
                  width={innerWidth}
                  height={Math.max(0, getY(18.5) - getY(24.9))}
                  fill="#10b981"
                  fillOpacity="0.08"
                />
                <line
                  x1={margin.left}
                  y1={getY(24.9)}
                  x2={svgWidth - margin.right}
                  y2={getY(24.9)}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1={margin.left}
                  y1={getY(18.5)}
                  x2={svgWidth - margin.right}
                  y2={getY(18.5)}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={svgWidth - margin.right - 6}
                  y={getY(24.9) + 12}
                  textAnchor="end"
                  className="text-[9px] fill-emerald-600 font-semibold"
                >
                  Zona Saludable OMS (18.5 - 24.9)
                </text>
              </g>
            )}

            {/* Area under curve */}
            {areaD && <path d={areaD} fill="url(#curveGradient)" />}

            {/* The main progress path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points & X axis labels */}
            {dataPoints.map((point, idx) => {
              const cx = getX(idx);
              const cy = getY(point.value);
              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Vertical hover guide */}
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={margin.top}
                      x2={cx}
                      y2={margin.top + innerHeight}
                      stroke="#0d9488"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 4.5}
                    fill="#ffffff"
                    stroke="#0d9488"
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />

                  {/* Date label at bottom */}
                  <text
                    x={cx}
                    y={margin.top + innerHeight + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-medium ${
                      isHovered ? 'fill-teal-700 font-bold' : 'fill-slate-500'
                    }`}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        )}

        {/* Hover info box if a point is selected */}
        {hoveredIndex !== null && dataPoints[hoveredIndex] && (
          <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-slate-800">
                {new Date(dataPoints[hoveredIndex].date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-700">
              <span>
                Peso:{' '}
                <strong className="text-slate-900 font-mono">
                  {dataPoints[hoveredIndex].rawLog.weight} kg
                </strong>
              </span>
              <span>
                IMC:{' '}
                <strong className="text-slate-900 font-mono">
                  {dataPoints[hoveredIndex].rawLog.bmi}
                </strong>{' '}
                ({getWHOCategory(dataPoints[hoveredIndex].rawLog.bmi).shortName})
              </span>
              <span>
                Grasa:{' '}
                <strong className="text-slate-900 font-mono">
                  {dataPoints[hoveredIndex].rawLog.bodyFatPercentage}%
                </strong>
              </span>
            </div>
            {dataPoints[hoveredIndex].rawLog.notes && (
              <span className="italic text-teal-800">
                &ldquo;{dataPoints[hoveredIndex].rawLog.notes}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add New Entry Modal / Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Añadir Medición Mensual
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra un nuevo pesaje para visualizar tu progreso histórico
            </p>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de pesaje
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peso corporal (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas u observaciones (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Ajuste de dieta, vuelta al gimnasio..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                >
                  Guardar Medición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Measurement History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Historial de Registros
            </h3>
            <p className="text-xs text-slate-500">
              {logs.length} mediciones almacenadas localmente
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportProgressLogsToCSV(logs, profile)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-xl border border-teal-200/60 flex items-center gap-1.5 transition-colors"
              title="Descargar historial en formato CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onResetSeedLogs}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              title="Restaurar datos de muestra de 6 meses"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reiniciar muestra</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Peso</th>
                <th className="py-2.5 px-3">IMC</th>
                <th className="py-2.5 px-3">Estado OMS</th>
                <th className="py-2.5 px-3">% Grasa</th>
                <th className="py-2.5 px-3">Notas</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay mediciones registradas. El historial está limpio.
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => {
                  const cat = getWHOCategory(log.bmi);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {new Date(log.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {log.weight} kg
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {log.bmi}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            borderColor: `${cat.color}35`,
                            color: cat.color,
                          }}
                        >
                          {cat.shortName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {log.bodyFatPercentage}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[200px] truncate">
                        {log.notes || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
