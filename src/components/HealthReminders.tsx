import React, { useState } from 'react';
import { HealthReminder } from '../types';
import {
  Bell,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Droplets,
  Scale,
  Utensils,
  Dumbbell,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HealthRemindersProps {
  reminders: HealthReminder[];
  onToggleReminder: (id: string) => void;
  onCompleteReminderToday: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<HealthReminder, 'id'>) => void;
}

export const HealthReminders: React.FC<HealthRemindersProps> = ({
  reminders,
  onToggleReminder,
  onCompleteReminderToday,
  onDeleteReminder,
  onAddReminder,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<HealthReminder['type']>('weigh_in');
  const [newFreq, setNewFreq] = useState<HealthReminder['frequency']>('monthly');
  const [newTime, setNewTime] = useState('08:30');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleComplete = (id: string) => {
    onCompleteReminderToday(id);
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Hábito saludable personalizado',
      type: newType,
      frequency: newFreq,
      time: newTime,
      enabled: true,
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const getTypeIcon = (type: HealthReminder['type']) => {
    switch (type) {
      case 'weigh_in':
        return <Scale className="h-4 w-4 text-teal-600" />;
      case 'water':
        return <Droplets className="h-4 w-4 text-sky-500" />;
      case 'meal_prep':
        return <Utensils className="h-4 w-4 text-amber-500" />;
      case 'physical_activity':
        return <Dumbbell className="h-4 w-4 text-indigo-500" />;
      default:
        return <HeartPulse className="h-4 w-4 text-rose-500" />;
    }
  };

  const getFrequencyLabel = (freq: HealthReminder['frequency']) => {
    switch (freq) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'biweekly':
        return 'Quincenal';
      case 'monthly':
        return 'Mensual';
    }
  };

  const completedTodayCount = reminders.filter(
    (r) => r.enabled && r.lastCompletedDate === todayStr
  ).length;

  const totalActiveCount = reminders.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header & Status Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Bell className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Gestor de Hábitos Clínicos
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Recordatorios de Salud &amp; Pesaje
          </h2>
          <p className="text-xs text-slate-500">
            La adherencia regular es el factor predictor más alto para el éxito a largo plazo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-teal-600" />
            <span>
              {completedTodayCount} de {totalActiveCount} completados hoy
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Recordatorio</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((reminder) => {
          const isDoneToday = reminder.lastCompletedDate === todayStr;

          return (
            <div
              key={reminder.id}
              className={`p-5 rounded-3xl border transition-all duration-200 bg-white ${
                reminder.enabled
                  ? isDoneToday
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                  : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200/60 mt-0.5">
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {reminder.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {reminder.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{reminder.time}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{getFrequencyLabel(reminder.frequency)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enable Toggle Switch */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      reminder.enabled ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                    title={reminder.enabled ? 'Desactivar recordatorio' : 'Activar recordatorio'}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        reminder.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                {reminder.enabled ? (
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                      isDoneToday
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
                    }`}
                  >
                    <CheckCircle className={`h-4 w-4 ${isDoneToday ? 'text-emerald-600' : 'text-teal-600'}`} />
                    <span>{isDoneToday ? '¡Cumplido hoy!' : 'Marcar como completado'}</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">Desactivado</span>
                )}

                <button
                  onClick={() => onDeleteReminder(reminder.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Eliminar recordatorio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nuevo Recordatorio Personalizado
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configura un hábito saludable según las recomendaciones de tu plan
            </p>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del recordatorio
                </label>
                <input
                  type="text"
                  placeholder="ej. Pesaje mensual en ayunas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción u objetivo
                </label>
                <input
                  type="text"
                  placeholder="ej. Medición mensual consistente antes del desayuno"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de hábito
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as HealthReminder['type'])}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2.5 text-slate-800"
                  >
                    <option value="weigh_in">Pesaje / Medición</option>
                    <option value="water">Hidratación</option>
                    <option value="meal_prep">Alimentación / Comida</option>
                    <option value="physical_activity">Ejercicio Físico</option>
                    <option value="clinical_review">Revisión Clínica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value as HealthReminder['frequency'])}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2.5 text-slate-800"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora sugerida
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                >
                  Guardar Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
