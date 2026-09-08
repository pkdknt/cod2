import type { BhytCustomerData } from '@/services/BhytService';

/**
 * Helper to dynamically load ExcelJS and export BHYT customers to .xlsx format,
 * embedding CCCD/BHYT images directly into worksheet cells.
 */
export async function exportBhytCustomersToExcel(
  customers: BhytCustomerData[],
  filenamePrefix: string = 'Danh_sach_BHYT',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nhơn Tâm Management';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Danh sách BHYT', {
    views: [{ showGridLines: true }]
  });

  // Setup Column Definitions
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Họ và tên', key: 'name', width: 24 },
    { header: 'Mã BHXH / Thẻ BHYT', key: 'bhxh', width: 18 },
    { header: 'Số CCCD', key: 'cccd', width: 15 },
    { header: 'Ngày sinh', key: 'dob', width: 12 },
    { header: 'Giới tính', key: 'gender', width: 10 },
    { header: 'Nơi khai sinh', key: 'birthPlace', width: 22 },
    { header: 'Nơi KCB ban đầu', key: 'kcb', width: 30 },
    { header: 'Điện thoại', key: 'phone', width: 14 },
    { header: 'Hạn thẻ', key: 'expiry', width: 14 },
    { header: 'Trạng thái xử lý', key: 'workflowStatus', width: 18 },
    { header: 'Ghi chú', key: 'note', width: 28 },
    { header: 'Hình ảnh CCCD', key: 'cccdImage', width: 18 },
  ];

  // Format Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0D9488' } // Teal-600
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '0F766E' } },
      bottom: { style: 'medium', color: { argb: '0F766E' } },
      left: { style: 'thin', color: { argb: '0F766E' } },
      right: { style: 'thin', color: { argb: '0F766E' } }
    };
  });

  const total = customers.length;

  // Process rows
  for (let i = 0; i < total; i++) {
    const cust = customers[i];
    const rowIndex = i + 2; // Row 1 is header

    const rowData = {
      stt: i + 1,
      name: cust.name || '',
      bhxh: cust.bhxh || '',
      cccd: cust.cccd || '',
      dob: cust.dob || '',
      gender: cust.gender || '',
      birthPlace: cust.birthPlace || '',
      kcb: cust.kcb || '',
      phone: cust.phone || '',
      expiry: cust.expiry || '',
      workflowStatus: cust.workflowStatus || 'Chưa liên hệ',
      note: cust.note || '',
      cccdImage: '' // Placeholder for image cell
    };

    const row = worksheet.addRow(rowData);
    const hasImage = Boolean(cust.cccdImage && cust.cccdImage.trim().length > 0);

    // Set row height based on image presence
    row.height = hasImage ? 60 : 24;

    // Apply borders and alignment to cells
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };

      // Alignment rules
      if (colNumber === 1 || colNumber === 5 || colNumber === 6 || colNumber === 9 || colNumber === 10) {
        // STT, Dob, Gender, Phone, Expiry centered
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 3 || colNumber === 4 || colNumber === 11) {
        // BHXH, CCCD, WorkflowStatus centered
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        // Text left aligned
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });

    // Embed CCCD Image if present
    if (hasImage && cust.cccdImage) {
      try {
        const rawImgStr = cust.cccdImage.trim();
        let extension: 'jpeg' | 'png' | 'gif' = 'jpeg';
        let base64Data = rawImgStr;

        if (rawImgStr.startsWith('data:image/')) {
          const match = rawImgStr.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
          if (match) {
            const rawExt = match[1].toLowerCase();
            extension = rawExt === 'png' ? 'png' : 'jpeg';
            base64Data = match[2];
          }
        }

        const imageId = workbook.addImage({
          base64: base64Data,
          extension
        });

        // Add image to column 13 (Column M) of current row
        worksheet.addImage(imageId, {
          tl: { col: 12, row: rowIndex - 1 },
          ext: { width: 90, height: 55 },
          editAs: 'oneCell'
        });
      } catch (imgErr) {
        console.warn(`Lỗi chèn ảnh Excel cho KH ${cust.name}:`, imgErr);
      }
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
