/**
 * web/src/env.d.ts — deklarasi tipe agar TypeScript mengenali impor berkas .vue dan aset (SVG).
 * Dipanggil oleh: TypeScript / editor (bukan dijalankan).
 */
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
