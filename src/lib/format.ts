/** "Nguyễn Văn A" → "NGUYEN VAN A" (bỏ dấu, in hoa, giữ khoảng trắng). */
export function toUpperNoAccent(s: string): string {
  return (s || '')
    .toString()
    .replace(/[đĐ]/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('vi-VN').format(val || 0);
}

export function formatNumberWithDots(val: string | number): string {
  if (val === undefined || val === null) return '';
  const clean = val.toString().replace(/[^0-9]/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(clean));
}

export function parseNumberFromDots(val: string): string {
  return val.replace(/[^0-9]/g, '');
}
