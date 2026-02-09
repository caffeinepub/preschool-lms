import type { FormDefinition } from '../backend';

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
 * Creates an Excel workbook with a data sheet and an instructions sheet
 * based on the provided form definition.
 */
export async function createTemplateWorkbook(form: FormDefinition): Promise<any> {
  const xlsx = await loadXLSX();
  const wb = xlsx.utils.book_new();

  // Create data sheet with headers
  const headers = form.fields
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((field) => field.displayLabel || field.fieldName);

  const dataSheet = xlsx.utils.aoa_to_sheet([headers]);
  xlsx.utils.book_append_sheet(wb, dataSheet, 'Data');

  // Create instructions sheet
  const instructions = [
    ['Excel Template Instructions'],
    [''],
    ['Form Name:', form.formName],
    [''],
    ['How to fill this template:'],
    ['1. Fill in the data rows below the header row in the "Data" sheet'],
    ['2. Do not modify or delete the header row'],
    ['3. Each column corresponds to a form field as described below'],
    [''],
    ['Field Descriptions:'],
    ['Field Name', 'Display Label', 'Type', 'Required', 'Notes'],
  ];

  form.fields
    .sort((a, b) => Number(a.order) - Number(b.order))
    .forEach((field) => {
      const fieldType = Object.keys(field.fieldType)[0] || 'Text';
      const notes =
        fieldType === 'Dropdown' && field.options
          ? `Options: ${field.options.join(', ')}`
          : fieldType === 'Date'
            ? 'Format: YYYY-MM-DD or MM/DD/YYYY'
            : fieldType === 'Number'
              ? 'Enter numeric values only'
              : fieldType === 'Checkbox'
                ? 'Enter: true, false, yes, no, 1, or 0'
                : 'Enter text';

      instructions.push([
        field.fieldName,
        field.displayLabel,
        fieldType,
        field.required ? 'Yes' : 'No',
        notes,
      ]);
    });

  instructions.push(
    [''],
    ['Important Notes:'],
    ['• Required fields must not be left empty'],
    ['• Date fields should use standard date formats (YYYY-MM-DD recommended)'],
    ['• Dropdown fields must match one of the allowed options exactly'],
    ['• Save the file and upload it through the "Upload Data" tab'],
  );

  const instructionsSheet = xlsx.utils.aoa_to_sheet(instructions);
  xlsx.utils.book_append_sheet(wb, instructionsSheet, 'Instructions');

  return wb;
}

/**
 * Downloads an Excel workbook as a file
 */
export async function downloadWorkbook(wb: any, filename: string): Promise<void> {
  const xlsx = await loadXLSX();
  xlsx.writeFile(wb, filename);
}

/**
 * Creates and downloads a template Excel file for the given form
 */
export async function downloadTemplate(form: FormDefinition): Promise<void> {
  const wb = await createTemplateWorkbook(form);
  const filename = `${form.formName.replace(/[^a-z0-9]/gi, '_')}_template.xlsx`;
  await downloadWorkbook(wb, filename);
}
