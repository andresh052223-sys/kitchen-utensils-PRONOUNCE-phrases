import { jsPDF } from 'jspdf';
import { PracticeAttempt, Student } from '../types/culinary';

/**
 * Exports practice attempts to CSV format with UTF-8 BOM for Excel compatibility
 */
export function exportToCSV(attempts: PracticeAttempt[], student?: Student | null) {
  if (attempts.length === 0) {
    alert('No hay intentos registrados para exportar.');
    return;
  }

  const headers = [
    'ID Intento',
    'Fecha',
    'Hora',
    'Aprendiz',
    'Carné / ID',
    'Utensilio / Área',
    'Categoría Culinaria',
    'Frase Solicitada',
    'Transcripción de Voz',
    'Precisión (%)',
    'Resultado',
    'Duración (seg)',
  ];

  const rows = attempts.map(att => {
    const dateObj = new Date(att.timestamp);
    const dateStr = dateObj.toLocaleDateString('es-ES');
    const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return [
      `"${att.id}"`,
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${att.studentName.replace(/"/g, '""')}"`,
      `"${student?.identification || 'N/A'}"`,
      `"${att.utensilName.replace(/"/g, '""')}"`,
      `"${att.category.replace(/"/g, '""')}"`,
      `"${att.targetPhrase.replace(/"/g, '""')}"`,
      `"${att.spokenText.replace(/"/g, '""')}"`,
      `"${att.accuracyScore}%"`,
      `"${att.isSuccess ? 'Acierto' : 'Reintento'}"`,
      `"${att.durationSeconds}s"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const studentSlug = student ? student.name.toLowerCase().replace(/\s+/g, '_') : 'todos';
  link.setAttribute('href', url);
  link.setAttribute('download', `evaluacion_culinaria_${studentSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a formatted PDF report with jsPDF
 */
export function exportToPDF(attempts: PracticeAttempt[], student?: Student | null) {
  if (attempts.length === 0) {
    alert('No hay intentos para generar el reporte PDF.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const studentAttempts = student
    ? attempts.filter(a => a.studentId === student.id)
    : attempts;

  const totalAttempts = studentAttempts.length;
  const successfulAttempts = studentAttempts.filter(a => a.isSuccess).length;
  const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;
  const avgAccuracy = totalAttempts > 0
    ? Math.round(studentAttempts.reduce((acc, curr) => acc + curr.accuracyScore, 0) / totalAttempts)
    : 0;

  // Header banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CULINARYVOICE · REPORTE DE EVALUACIÓN ORAL TÉCNICA', 14, 12);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Validación de Pronunciación, Comprensión y Nomenclatura Culinaria', 14, 18);

  // Student details box
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INFORMACIÓN DEL APRENDIZ EVALUADO', 14, 34);

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 37, 182, 22, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${student?.name || 'Consolidado General'}`, 18, 44);
  doc.text(`Carné / ID: ${student?.identification || 'Múltiples'}`, 18, 51);
  doc.text(`Programa: ${student?.group || 'Técnico en Cocina Profesional'}`, 100, 44);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 100, 51);

  // Stats KPI cards
  const kpis = [
    { label: 'Total Intentos', val: totalAttempts.toString() },
    { label: 'Aciertos Válidos', val: `${successfulAttempts} / ${totalAttempts}` },
    { label: 'Tasa de Éxito', val: `${successRate}%` },
    { label: 'Precisión Media', val: `${avgAccuracy}%` },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * 47;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, 64, 43, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, 71);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 4, 79);
  });

  // Table title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('REGISTRO HISTÓRICO DE PRONUNCIACIÓN Y COMPRENSIÓN', 14, 93);

  // Table header
  let y = 98;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FECHA/HORA', 16, y + 5);
  doc.text('UTENSILIO / ÁREA', 46, y + 5);
  doc.text('TRANSCRIPCIÓN DE VOZ', 95, y + 5);
  doc.text('SCORE', 162, y + 5);
  doc.text('ESTADO', 178, y + 5);

  y += 7;

  // Rows (limit to first 18 to fit cleanly with footer, or add pages if needed)
  doc.setFont('helvetica', 'normal');
  const attemptsToPrint = studentAttempts.slice(0, 16);

  attemptsToPrint.forEach((att) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const dateStr = new Date(att.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(att.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    
    // Background alternating
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 8.5, 196, y + 8.5);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(dateStr, 16, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    const shortUtensil = att.utensilName.length > 25 ? att.utensilName.substring(0, 24) + '...' : att.utensilName;
    doc.text(shortUtensil, 46, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const shortSpoken = att.spokenText.length > 36 ? att.spokenText.substring(0, 35) + '...' : att.spokenText;
    doc.text(`"${shortSpoken || 'Sin voz captada'}"`, 95, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`${att.accuracyScore}%`, 164, y + 5.5);

    if (att.isSuccess) {
      doc.setTextColor(16, 185, 129); // green
      doc.text('Acierto', 178, y + 5.5);
    } else {
      doc.setTextColor(239, 68, 68); // red
      doc.text('Reintento', 178, y + 5.5);
    }

    y += 8.5;
  });

  // Instructor signature block
  const signY = 255;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, signY, 80, signY);
  doc.line(130, signY, 190, signY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Firma del Instructor / Chef Evaluador', 24, signY + 5);
  doc.text('Firma del Aprendiz de Cocina', 138, signY + 5);

  const studentSlug = student ? student.name.toLowerCase().replace(/\s+/g, '_') : 'consolidado';
  doc.save(`reporte_culinario_${studentSlug}.pdf`);
}

/**
 * Generates an official Certificate of Evidence (Certificado de Evidencia de Aprendizaje) in PDF
 * including student name, academic program, and list of correctly pronounced phrases (>=80%).
 */
export function exportCertificatePDF(student: Student, attempts: PracticeAttempt[]) {
  // Filter successful attempts for this student
  const studentSuccessAttempts = attempts.filter(
    a => a.studentId === student.id && a.isSuccess
  );

  if (studentSuccessAttempts.length === 0) {
    alert(`El aprendiz ${student.name} aún no tiene frases aprobadas (≥ 80% de precisión). Realiza prácticas orales exitosas antes de descargar el certificado.`);
    return;
  }

  // De-duplicate: get best attempt per utensil
  const bestAttemptsMap = new Map<string, PracticeAttempt>();
  studentSuccessAttempts.forEach(att => {
    const existing = bestAttemptsMap.get(att.utensilId);
    if (!existing || att.accuracyScore > existing.accuracyScore) {
      bestAttemptsMap.set(att.utensilId, att);
    }
  });

  const uniqueApproved = Array.from(bestAttemptsMap.values());
  const avgAccuracy = Math.round(
    uniqueApproved.reduce((acc, c) => acc + c.accuracyScore, 0) / uniqueApproved.length
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Certificate Outer Border (Double frame with amber/gold & dark slate)
  doc.setDrawColor(180, 83, 9); // amber-700
  doc.setLineWidth(1.2);
  doc.rect(8, 8, 194, 281);

  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.4);
  doc.rect(10.5, 10.5, 189, 276);

  // Top Decorative Header
  doc.setFillColor(30, 41, 59);
  doc.rect(11, 11, 188, 22, 'F');

  doc.setTextColor(245, 158, 11); // amber-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ACADEMIA DE GASTRONOMÍA & ARTES CULINARIAS', 105, 19, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('DEPARTAMENTO DE EVALUACIÓN ORAL Y BILINGÜISMO TÉCNICO', 105, 26, { align: 'center' });

  // Certificate Title
  doc.setTextColor(180, 83, 9); // amber-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('CERTIFICADO DE EVIDENCIA DE APRENDIZAJE', 105, 43, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Constancia de Competencia en Nomenclatura Culinaria y Pronunciación en Inglés', 105, 49, { align: 'center' });

  // Thin separator line
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.6);
  doc.line(40, 52, 170, 52);

  // Preamble
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.text('Por medio del presente documento, se certifica formalmente que el aprendiz:', 105, 60, { align: 'center' });

  // Student Name (Prominent Callout)
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(student.name.toUpperCase(), 105, 69, { align: 'center' });

  // Student Details Box (ID & Programa)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(20, 74, 170, 16, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Documento / Carné:', 26, 81);
  doc.setFont('helvetica', 'normal');
  doc.text(student.identification, 62, 81);

  doc.setFont('helvetica', 'bold');
  doc.text('Programa Académico:', 26, 86.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 83, 9);
  doc.text(student.group, 65, 86.5);

  // Certification body text
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.text(
    'Ha superado satisfactoriamente los estándares de precisión oral (mínimo 80%) en las siguientes frases técnicas:',
    20,
    97
  );

  // Table of Approved Phrases
  let y = 102;
  doc.setFillColor(30, 41, 59);
  doc.rect(20, y, 170, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', 23, y + 4.5);
  doc.text('UTENSILIO / EQUIPO', 30, y + 4.5);
  doc.text('FRASE TÉCNICA EN INGLÉS VALIDADA', 80, y + 4.5);
  doc.text('PRECISIÓN', 170, y + 4.5, { align: 'right' });

  y += 6.5;

  // Render items (display up to 14 rows, or add pagination)
  doc.setFont('helvetica', 'normal');
  const itemsToRender = uniqueApproved.slice(0, 14);

  itemsToRender.forEach((item, index) => {
    // Alternating background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(20, y, 170, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y + 8, 190, y + 8);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text((index + 1).toString(), 23, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const shortName = item.utensilName.length > 24 ? item.utensilName.substring(0, 23) + '..' : item.utensilName;
    doc.text(shortName, 30, y + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const shortPhrase = item.targetPhrase.length > 56 ? item.targetPhrase.substring(0, 54) + '...' : item.targetPhrase;
    doc.text(`"${shortPhrase}"`, 80, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`${item.accuracyScore}%`, 170, y + 5.2, { align: 'right' });

    y += 8;
  });

  if (uniqueApproved.length > 14) {
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`... y ${uniqueApproved.length - 14} frases adicionales validadas con éxito en el catálogo técnico.`, 20, y + 5);
    y += 6;
  }

  // Summary KPI box in Certificate
  y = Math.max(y + 3, 222);
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(20, y, 170, 15, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de Frases Aprobadas: ${uniqueApproved.length}`, 26, y + 6);
  doc.text(`Precisión Media Lograda: ${avgAccuracy}%`, 85, y + 6);
  doc.text('Dictamen: COMPETENTE', 145, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  doc.text(`Fecha de Certificación: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} · Código de Evidencia: EVID-${student.identification}-${new Date().getFullYear()}`, 26, y + 11);

  // Signatures
  const signY = 257;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(26, signY, 86, signY);
  doc.line(124, signY, 184, signY);

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('CHEF INSTRUCTOR EVALUADOR', 56, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Firma y Sello de Validación Docente', 56, signY + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('APRENDIZ CERTIFICADO', 154, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, 154, signY + 7.5, { align: 'center' });

  // Save the Certificate PDF
  const studentSlug = student.name.toLowerCase().replace(/\s+/g, '_');
  doc.save(`certificado_evidencia_${studentSlug}.pdf`);
}

