/**
 * web/src/composables/api.ts — pembungkus fetch untuk memanggil API server.
 *
 * Dipanggil oleh: useGuest.ts, RsvpSection.vue, WishesSection.vue, panel admin.
 * Memanggil: fetch bawaan browser.
 *
 * - Batas waktu 15 dtk: di jaringan buruk, lebih baik gagal jelas + tombol "coba lagi"
 *   daripada tombol berputar selamanya.
 * - Semua kegagalan dijadikan ApiError berisi pesan yang aman ditampilkan ke tamu.
 */
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown> | null;
  constructor(message: string, status: number, data: Record<string, unknown> | null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api<T = Record<string, unknown>>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
  timeoutMs = 15_000,
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const { json, ...rest } = init;
  try {
    const res = await fetch(path, {
      ...rest,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      headers: { Accept: 'application/json', ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...rest.headers },
      credentials: 'same-origin',
      signal: ctrl.signal,
    });
    let data: Record<string, unknown> | null = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok || !data || data.ok !== true) {
      const msg = typeof data?.error === 'string' ? data.error : `Server sedang bermasalah (kode ${res.status}). Coba lagi sebentar lagi.`;
      throw new ApiError(msg, res.status, data);
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Koneksi terputus atau terlalu lambat. Periksa internet Anda, lalu coba lagi.', 0, null);
  } finally {
    clearTimeout(timer);
  }
}
