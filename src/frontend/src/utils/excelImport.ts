import type { FormDefinition, FormField } from '../backend';

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

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

export interface ParseResult {
  validRows: ParsedRow[];
  invalidRows: ParsedRow[];
  totalRows: number;
}

/**
 * Parses an Excel file and validates rows against a form definition
 */
export async function parseExcelFile(
  file: File,
  form: FormDefinition,
): Promise<ParseResult> {
  const xlsx = await loadXLSX();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });

        // Get the first sheet (Data sheet)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (jsonData.length < 2) {
          reject(new Error('Excel file must contain at least a header row and one data row'));
          return;
        }

        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1);

        // Create field map by display label
        const fieldMap = new Map<string, FormField>();
        form.fields.forEach((field) => {
          fieldMap.set(field.displayLabel.toLowerCase(), field);
          fieldMap.set(field.fieldName.toLowerCase(), field);
        });

        const validRows: ParsedRow[] = [];
        const invalidRows: ParsedRow[] = [];

        dataRows.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because Excel is 1-indexed and we skip header
          const parsedRow: ParsedRow = {
            rowNumber,
            data: {},
            isValid: true,
            errors: [],
          };

          // Skip completely empty rows
          if (row.every((cell) => cell === undefined || cell === null || cell === '')) {
            return;
          }

          headers.forEach((header, colIndex) => {
            const field = fieldMap.get(header.toLowerCase());
            if (!field) {
              parsedRow.errors.push(`Unknown column: ${header}`);
              parsedRow.isValid = false;
              return;
            }

            const cellValue = row[colIndex];
            const stringValue = cellValue !== undefined && cellValue !== null ? String(cellValue).trim() : '';

            // Validate required fields
            if (field.required && !stringValue) {
              parsedRow.errors.push(`${field.displayLabel} is required`);
              parsedRow.isValid = false;
              return;
            }

            // Validate and coerce based on field type
            const fieldType = Object.keys(field.fieldType)[0];
            const validationResult = validateFieldValue(stringValue, field, fieldType, xlsx);

            if (!validationResult.isValid) {
              parsedRow.errors.push(`${field.displayLabel}: ${validationResult.error}`);
              parsedRow.isValid = false;
            } else {
              parsedRow.data[field.fieldName] = validationResult.value;
            }
          });

          // Check for missing required fields
          form.fields.forEach((field) => {
            if (field.required && !parsedRow.data[field.fieldName]) {
              const headerExists = headers.some(
                (h) => h.toLowerCase() === field.displayLabel.toLowerCase() || h.toLowerCase() === field.fieldName.toLowerCase(),
              );
              if (!headerExists) {
                parsedRow.errors.push(`Missing required field: ${field.displayLabel}`);
                parsedRow.isValid = false;
              }
            }
          });

          if (parsedRow.isValid) {
            validRows.push(parsedRow);
          } else {
            invalidRows.push(parsedRow);
          }
        });

        resolve({
          validRows,
          invalidRows,
          totalRows: dataRows.length,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

interface ValidationResult {
  isValid: boolean;
  value: string;
  error?: string;
}

function validateFieldValue(value: string, field: FormField, fieldType: string, xlsx: any): ValidationResult {
  // Empty values are handled by required check
  if (!value) {
    return { isValid: true, value: '' };
  }

  switch (fieldType) {
    case 'Number':
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { isValid: false, value, error: 'Must be a valid number' };
      }
      return { isValid: true, value: String(num) };

    case 'Date':
      const dateValue = parseDate(value, xlsx);
      if (!dateValue) {
        return { isValid: false, value, error: 'Invalid date format (use YYYY-MM-DD or MM/DD/YYYY)' };
      }
      return { isValid: true, value: dateValue };

    case 'Checkbox':
      const boolValue = parseBoolean(value);
      if (boolValue === null) {
        return { isValid: false, value, error: 'Must be true/false, yes/no, or 1/0' };
      }
      return { isValid: true, value: boolValue };

    case 'Dropdown':
      if (field.options && field.options.length > 0) {
        const normalizedValue = value.toLowerCase().trim();
        const matchingOption = field.options.find((opt) => opt.toLowerCase().trim() === normalizedValue);
        if (!matchingOption) {
          return {
            isValid: false,
            value,
            error: `Must be one of: ${field.options.join(', ')}`,
          };
        }
        return { isValid: true, value: matchingOption };
      }
      return { isValid: true, value };

    case 'Text':
    case 'Textarea':
    default:
      return { isValid: true, value };
  }
}

function parseDate(value: string, xlsx: any): string | null {
  // Try parsing various date formats
  const trimmed = value.trim();

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // US format: MM/DD/YYYY
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try parsing as Excel serial date
  const num = parseFloat(trimmed);
  if (!isNaN(num) && num > 0 && xlsx.SSF) {
    try {
      const date = xlsx.SSF.parse_date_code(num);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    } catch (e) {
      // Fall through to return null
    }
  }

  return null;
}

function parseBoolean(value: string): string | null {
  const normalized = value.toLowerCase().trim();
  if (['true', 'yes', '1', 'y'].includes(normalized)) {
    return 'true';
  }
  if (['false', 'no', '0', 'n'].includes(normalized)) {
    return 'false';
  }
  return null;
}
