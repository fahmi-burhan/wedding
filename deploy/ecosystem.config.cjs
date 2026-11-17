/**
 * deploy/ecosystem.config.cjs — konfigurasi pm2 untuk menjalankan server undangan di VPS.
 *
 * Dipanggil oleh: pm2 (di VPS):  pm2 start deploy/ecosystem.config.cjs && pm2 save
 * Memanggil: node server/index.ts (TypeScript dijalankan langsung oleh Node 24) dengan .env proyek.
 *
 * Berkas .cjs karena package.json memakai "type": "module", sedangkan pm2 membaca konfigurasi CommonJS.
 * `interpreter: 'node'` wajib ditulis eksplisit agar pm2 tidak mencoba memakai ts-node untuk berkas .ts.
 */
const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'wedding',
      cwd: path.resolve(__dirname, '..'),
      script: 'server/index.ts',
      interpreter: 'node',
      node_args: '--env-file=.env',
      instances: 1, // rate limit disimpan di memori → cukup satu proses
      exec_mode: 'fork',
      max_memory_restart: '300M',
      time: true, // cap waktu di log
    },
  ],
};
