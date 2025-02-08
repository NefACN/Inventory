import * as XLSX from 'xlsx';

type ExportData<T> = T[];

const exportExcel = <T>(data: ExportData<T>, fileName: string): void => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export default exportExcel;