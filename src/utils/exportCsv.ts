import { ProgressLogEntry, UserProfile } from '../types';
import { getWHOCategory } from './clinicalFormulas';

/**
 * Exports progress log entries to a well-formed CSV file with UTF-8 BOM,
 * ensuring seamless compatibility with Microsoft Excel, Google Sheets, and LibreOffice.
 */
export function exportProgressLogsToCSV(logs: ProgressLogEntry[], profile: UserProfile): void {
  if (!logs || logs.length === 0) {
    alert('No hay registros de progreso para exportar.');
    return;
  }

  // Sort logs chronologically
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // CSV headers with informative clinical columns
  const headers = [
    'Correo Paciente',
    'Fecha',
    'Peso (kg)',
    'Estatura (cm)',
    'IMC (kg/m²)',
    'Categoria OMS',
    'Grasa Corporal (%)',
    'Perimetro Cintura (cm)',
    'Edad al registro',
    'Sexo',
    'Notas y Observaciones',
  ];

  // Helper to escape values for CSV
  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sortedLogs.map((log) => {
    const whoCategory = getWHOCategory(log.bmi);
    return [
      escapeCsv(profile.email || 'No especificado'),
      escapeCsv(log.date),
      escapeCsv(log.weight),
      escapeCsv(profile.height),
      escapeCsv(log.bmi),
      escapeCsv(whoCategory.name),
      escapeCsv(log.bodyFatPercentage),
      escapeCsv(log.waistCircumference || profile.waistCircumference || '-'),
      escapeCsv(profile.age),
      escapeCsv(profile.sex === 'female' ? 'Femenino' : 'Masculino'),
      escapeCsv(log.notes || ''),
    ].join(';');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens Spanish accents/characters correctly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

  // Create downloadable blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const currentDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `IMC_Arauquin_progreso_${currentDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
