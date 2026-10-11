const ACCENT_MAP: Record<string, string> = {
  a: '[aAáàảãạăắằẳẵặâấầẩẫậÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]',
  e: '[eEéèẻẽẹêếềểễệÉÈẺẼẸÊẾỀỂỄỆ]',
  i: '[iIíìỉĩịÍÌỈĨỊ]',
  o: '[oOóòỏõọôốồổỗộơớờởỡợÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]',
  u: '[uUúùủũụưứừửữựÚÙỦŨỤƯỨỪỬỮỰ]',
  y: '[yYýỳỷỹỵÝỲỶỸỴ]',
  d: '[dDđĐ]',
};

/**
 * Build a case- and accent-insensitive RegExp for Vietnamese text search.
 * NOTE: this is intentionally a substring (unanchored) match — it cannot use a
 * B-tree index, so callers must keep result sets bounded via pagination.
 */
export function createUnaccentRegex(str: string): RegExp {
  let result = '';
  const noAccentStr = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  for (const char of noAccentStr) {
    if (ACCENT_MAP[char]) {
      result += ACCENT_MAP[char];
    } else {
      result += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(result, 'i');
}
