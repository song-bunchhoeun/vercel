import readXlsxFile, { CellValue, Row } from 'read-excel-file/web-worker';
import {
    CurrencyType,
    ShipmentImportData,
    TaskType
} from './bulk.form.service';

const cleanNumber = (val: CellValue): number | string => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number') return val;

    // Ensure we are working with a string for regex
    const strVal = String(val);
    const cleaned = strVal.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? strVal : num;
};

const cleanPhone = (val: CellValue): string => {
    if (val === null || val === undefined) return '';
    // Strip everything except numbers to satisfy Zod .max(10)
    return String(val).replace(/\D/g, '');
};

const mapToShipmentData = (row: Row): ShipmentImportData => ({
    warehouseId: String(row[WAREHOUSE_ID_COL] || "").trim(),
    customer: {
        name: String(row[0] || '').trim(),
        primaryPhone: cleanPhone(row[1])
    },
    address: { line: String(row[2] || '').trim() },
    item: {
        qty: cleanNumber(row[3]),
        amount: cleanNumber(row[5]),
        currencyType:
            (String(row[6] || '').trim() as CurrencyType) || CurrencyType.RIEL
    },
    taskType: (String(row[4] || '').trim() as TaskType) || TaskType.DROP_OFF,
    note: String(row[7] || '').trim()
});

addEventListener('message', async (event: MessageEvent<{ file: File }>) => {
    const { file } = event.data;
    try {
        const rows: Row[] = await readXlsxFile(file);

        // Check Limit
        if (rows.length > 101) {
            // 100 data rows + 1 header
            postMessage({ type: 'ERROR', payload: 'LIMIT_EXCEEDED' });
            return;
        }

        const dataRows = rows
            .slice(1)
            .filter((row) => row.some((cell) => cell !== null && cell !== ''));

        const parsed: ShipmentImportData[] = dataRows.map((row) =>
            mapToShipmentData(row)
        );

        postMessage({ type: 'SUCCESS', payload: parsed });
    } catch (error) {
        // Logging error details to console for debugging since we can't pass the object through postMessage
        console.error('Worker Excel Error:', error);
        postMessage({ type: 'ERROR', payload: 'INVALID_FILE' });
    }
});
