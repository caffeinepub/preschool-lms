import type { FormDefinition, EntityRecord } from '../backend';

// Load SheetJS from CDN dynamically
let XLSX: any = null;

async function loadXLSX() {
  if (XLSX) return XLSX;
  
  // Load from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  
  return new Promise((resolve, reject) => {
    script.onload = () => {
      XLSX = (window as any).XLSX;
      resolve(XLSX);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Creates an Excel workbook from entity records
 */
export async function createExportWorkbook(
  form: FormDefinition,
  entities: EntityRecord[],
): Promise<any> {
  const xlsx = await loadXLSX();
  const wb = xlsx.utils.book_new();

  // Sort fields by order
  const sortedFields = [...form.fields].sort((a, b) => Number(a.order) - Number(b.order));

  // Create headers: ID, Created At, field labels, Updated At
  const headers = [
    'Record ID',
    'Created At',
    ...sortedFields.map((field) => field.displayLabel || field.fieldName),
    'Updated At',
  ];

  // Create data rows
  const rows = entities.map((entity) => {
    const dataMap = new Map(entity.data);
    const row = [
      entity.id,
      formatTimestamp(entity.createdAt),
      ...sortedFields.map((field) => dataMap.get(field.fieldName) || ''),
      entity.updatedAt ? formatTimestamp(entity.updatedAt) : '',
    ];
    return row;
  });

  // Combine headers and data
  const sheetData = [headers, ...rows];

  const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

  // Auto-size columns (approximate)
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...rows.map((row) => String(row[i] || '').length),
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet['!cols'] = colWidths;

  xlsx.utils.book_append_sheet(wb, worksheet, form.formName.substring(0, 31));

  return wb;
}

/**
 * Downloads entity records as an Excel file
 */
export async function exportToExcel(
  form: FormDefinition,
  entities: EntityRecord[],
): Promise<void> {
  const wb = await createExportWorkbook(form, entities);
  const xlsx = await loadXLSX();
  const filename = `${form.formName.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  xlsx.writeFile(wb, filename);
}

function formatTimestamp(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const ms = Number(timestamp / BigInt(1000000));
  const date = new Date(ms);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}
