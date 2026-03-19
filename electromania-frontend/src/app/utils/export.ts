export function exportToCsv<T extends object>(data: T[], filename: string, headers: {
    key: keyof T;
    label: string;
}[]): void {
    if (data.length === 0)
        return;
    const headerRow = headers.map(h => h.label).join(',');
    const rows = data.map(item => headers.map(h => {
        const value = item[h.key];
        const stringValue = value === null || value === undefined ? '' : String(value);
        return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replaceAll('"', '""')}"`
            : stringValue;
    }).join(','));
    const csvContent = [headerRow, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

type ExcelJsNamespace = {
    Workbook: new () => {
        addWorksheet: (name: string) => {
            addRow: (values: (string | number)[]) => void;
            getColumn: (index: number) => { width: number; };
            mergeCells: (startRow: number, startColumn: number, endRow: number, endColumn: number) => void;
            autoFilter?: {
                from: { row: number; column: number; };
                to: { row: number; column: number; };
            };
        };
        xlsx: {
            writeBuffer: () => Promise<ArrayBuffer>;
        };
    };
};

declare global {
    interface Window {
        ExcelJS?: ExcelJsNamespace;
    }
}

const excelJsGlobal = globalThis as typeof globalThis & { ExcelJS?: ExcelJsNamespace };

async function ensureExcelJsLoaded(): Promise<void> {
    if (excelJsGlobal.ExcelJS) {
        return;
    }
    await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector('script[data-exceljs="true"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load ExcelJS script')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = '/vendor/exceljs.min.js';
        script.async = true;
        script.dataset['exceljs'] = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load ExcelJS script'));
        document.head.appendChild(script);
    });
}

export async function exportToXlsx<T extends object>(
    data: T[],
    filename: string,
    headers: { key: keyof T; label: string; }[],
    options?: { sheetName?: string; title?: string; exportDateLabel?: string; }
): Promise<void> {
    if (data.length === 0) {
        return;
    }
    await ensureExcelJsLoaded();
    if (!excelJsGlobal.ExcelJS) {
        throw new Error('ExcelJS is not available');
    }
    const ExcelJS = excelJsGlobal.ExcelJS;
    const sheetName = options?.sheetName || 'Export';
    const title = options?.title || filename;
    const exportDateLabel = options?.exportDateLabel || 'Export date';
    const exportDate = new Date().toLocaleString();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.addRow([title]);
    worksheet.addRow([exportDateLabel, exportDate]);
    worksheet.addRow([]);
    worksheet.addRow(headers.map(h => h.label));

    data.forEach(item => {
        const row = headers.map(h => {
            const value = item[h.key];
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'boolean') {
                return value ? 'true' : 'false';
            }
            return String(value);
        });
        worksheet.addRow(row);
    });

    headers.forEach((h, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = Math.max(14, h.label.length + 2);
    });

    worksheet.mergeCells(1, 1, 1, headers.length);

    const headerRowIndex = 4;
    worksheet.autoFilter = {
        from: { row: headerRowIndex, column: 1 },
        to: { row: headerRowIndex + data.length, column: headers.length }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
}