export async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Lỗi kết nối API: ${res.statusText}`);
  }
  return data;
}
