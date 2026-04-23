import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function generateExcel(data, { title, subtitle, filename } = {}) {
  const workbook = new ExcelJS.Workbook();

  // Set default font untuk seluruh workbook
  workbook.creator = 'SIMONS';
  workbook.lastModifiedBy = 'SIMONS';

  const worksheet = workbook.addWorksheet('Data Surat', {
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9, // A4
    },
    properties: { defaultRowHeight: 18 },
  });

  // ─── 1. Definisi Kolom (lebar fixed, NO wrapText di data) ───
  const COLUMNS = [
    { header: 'TANGGAL',      key: 'issued_date',      width: 13, align: 'center' },
    { header: 'NOMOR SURAT',  key: 'formatted_number', width: 22, align: 'left'   },
    { header: 'URUT',         key: 'number',           width: 7,  align: 'center' },
    { header: 'KLASIFIKASI',  key: 'classification',   width: 28, align: 'left'   },
    { header: 'PERIHAL',      key: 'subject',          width: 38, align: 'left'   },
    { header: 'TUJUAN',       key: 'destination',      width: 22, align: 'left'   },
    { header: 'SIFAT',        key: 'sifat_surat',      width: 12, align: 'center' },
    { header: 'PEMOHON',      key: 'requested_by',     width: 20, align: 'left'   },
    { header: 'UNIT KERJA',   key: 'work_unit',        width: 22, align: 'left'   },
    { header: 'STATUS',       key: 'status',           width: 12, align: 'center' },
  ];

  worksheet.columns = COLUMNS.map(({ header, key, width }) => ({ header, key, width }));
  const colCount = COLUMNS.length;

  // ─── Helper: apply border ───
  const thinBorder = (color = 'FFCCCCCC') => ({
    top:    { style: 'thin', color: { argb: color } },
    left:   { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right:  { style: 'thin', color: { argb: color } },
  });

  // ─── 2. Row 1 — Judul Utama ───
  worksheet.spliceRows(1, 0, []);
  worksheet.mergeCells(1, 1, 1, colCount);
  const r1 = worksheet.getRow(1);
  r1.height = 32;
  const c1 = r1.getCell(1);
  c1.value = title?.toUpperCase() || 'SIMONS — SISTEM INFORMASI MANAJEMEN PENOMORAN SURAT';
  c1.font      = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1B2F6E' } };
  c1.alignment = { horizontal: 'center', vertical: 'middle' };
  c1.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF7' } };

  // ─── 3. Row 2 — Subjudul ───
  worksheet.spliceRows(2, 0, []);
  worksheet.mergeCells(2, 1, 2, colCount);
  const r2 = worksheet.getRow(2);
  r2.height = 20;
  const c2 = r2.getCell(1);
  c2.value     = subtitle || 'Laporan Data Nomor Surat';
  c2.font      = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };
  c2.alignment = { horizontal: 'center', vertical: 'middle' };
  c2.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF7' } };

  // ─── 4. Row 3 — Spacer ───
  worksheet.spliceRows(3, 0, []);
  worksheet.getRow(3).height = 6;

  // ─── 5. Row 4 — Header Kolom ───
  const headerRow = worksheet.getRow(4);
  headerRow.height = 28;
  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value     = col.header;
    cell.font      = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2F6E' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    cell.border    = thinBorder('FF1B2F6E');
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to:   { row: 4, column: colCount },
  };

  // ─── 6. Data Rows ───
  data.forEach((item, index) => {
    const isEven  = index % 2 === 1;
    const bgColor = isEven ? 'FFF5F7FB' : 'FFFFFFFF';

    const rowData = {
      issued_date:      item.issued_date,
      formatted_number: item.formatted_number || item.number,
      number:           item.number,
      classification:   item.classification,
      subject:          item.subject,
      destination:      item.destination,
      sifat_surat:      item.sifat_surat,
      requested_by:     item.requested_by,
      work_unit:        item.work_unit,
      status:           item.status?.toUpperCase(),
    };

    const row = worksheet.addRow(rowData);
    row.height = 18; // Fixed height, NO wrapText

    COLUMNS.forEach((col, i) => {
      const cell = row.getCell(i + 1);

      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.border = thinBorder();
      cell.font   = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };

      if (col.key === 'issued_date' && cell.value) {
        cell.value  = new Date(cell.value);
        cell.numFmt = 'dd/mm/yyyy';
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
      } else {
        // indent 1 untuk padding kiri, TANPA wrapText
        const indent = col.align === 'left' ? 1 : 0;
        cell.alignment = {
          horizontal: col.align,
          vertical: 'middle',
          wrapText: false,
          indent,
        };
      }
    });
  });

  // ─── 7. Footer ───
  const footerRow = worksheet.addRow([]);
  footerRow.height = 24;
  worksheet.mergeCells(footerRow.number, 1, footerRow.number, colCount);
  const fc = footerRow.getCell(1);
  fc.value     = `TOTAL RECORDS: ${data.length}`;
  fc.font      = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1B2F6E' } };
  fc.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF7' } };
  fc.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };

  // ─── 8. Freeze panes ───
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // ─── 9. Export ───
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename || 'laporan-surat.xlsx');
}