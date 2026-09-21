import React from 'react';
import { Activity, Sparkles, HeartPulse, ShieldCheck, Printer, Download, Trash2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  onExportCsv?: () => void;
  onClearAllData?: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onExportCsv,
  onClearAllData,
  hasApiKey,
}) => {
  const tabs = [
    { id: 'calculator', label: 'Calculadora & IMC', icon: Activity },
    { id: 'progress', label: 'Gráficas Mensuales', icon: HeartPulse },
    { id: 'nutrition', label: 'Nutrición IA', icon: Sparkles },
    { id: 'reminders', label: 'Recordatorios', icon: ShieldCheck },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Brand & Standards Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                    IMC_Arauquin
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Estándar OMS
                  </span>
                </div>
                <p className="text-xs text-slate-700 hidden sm:block">
                  Precisión clínica ajustada por sexo, edad y grasa corporal
                </p>
              </div>
            </div>

            {/* Quick print and export on mobile */}
            <div className="flex items-center gap-1 md:hidden">
              {onExportCsv && (
                <button
                  onClick={onExportCsv}
                  className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Exportar CSV"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onOpenReport}
                className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Informe Clínico"
              >
                <Printer className="h-5 w-5" />
              </button>
              {onClearAllData && (
                <button
                  onClick={onClearAllData}
                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Borrar información y dejar todo limpio"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto pb-1 md:pb-0">
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-teal-800 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              {onExportCsv && (
                <button
                  id="btn-export-csv-header"
                  onClick={onExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-teal-800 bg-teal-50 border border-teal-200/80 rounded-xl hover:bg-teal-100/80 transition-all shadow-2xs"
                  title="Descargar historial completo en archivo CSV (Excel)"
                >
                  <Download className="h-4 w-4 text-teal-600" />
                  <span>Exportar CSV</span>
                </button>
              )}

              <button
                id="btn-open-report"
                onClick={onOpenReport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-teal-700 hover:border-teal-300 transition-all shadow-2xs"
              >
                <Printer className="h-4 w-4 text-slate-500" />
                <span>Informe Clínico</span>
              </button>

              {onClearAllData && (
                <button
                  id="btn-header-clear-data"
                  onClick={onClearAllData}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl hover:bg-rose-100 hover:border-rose-300 transition-all shadow-2xs"
                  title="Borrar información y dejar todo limpio"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Borrar información</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
