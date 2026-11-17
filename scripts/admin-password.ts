/**
 * scripts/admin-password.ts — membuat/mengganti kata sandi panel admin.
 * Jalankan: npm run admin:password
 *
 * Dipanggil oleh: pengguna (terminal).
 * Memanggil: server/lib/auth.ts (hashPassword), node:readline, node:fs.
 *
 * Yang disimpan di .env hanyalah HASH (scrypt), bukan kata sandi aslinya.
 * Script ini juga membuat IP_SALT acak bila belum ada. Setelah selesai, restart server.
 */
import { createInterface } from 'node:readline';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { hashPassword } from '../server/lib/auth.ts';

const ENV_PATH = resolve(import.meta.dirname, '..', '.env');
const EXAMPLE_PATH = resolve(import.meta.dirname, '..', '.env.example');
const MIN_LENGTH = 10;

/** Tanya tanpa menampilkan ketikan (diganti '*'). */
function askHidden(question: string): Promise<string> {
  return new Promise((done) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const internal = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    internal._writeToOutput = (s: string) => {
      internal.output.write(s.startsWith(question) || s === '\r\n' || s === '\n' ? s : '*');
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      done(answer);
    });
  });
}

/** Ganti (atau tambahkan) satu baris KEY=nilai di isi .env. */
function setEnvLine(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  return re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

const password = await askHidden(`Kata sandi admin baru (min. ${MIN_LENGTH} karakter): `);
if (password.length < MIN_LENGTH) {
  console.error(`Gagal: kata sandi minimal ${MIN_LENGTH} karakter.`);
  process.exit(1);
}
const confirm = await askHidden('Ulangi kata sandi: ');
if (confirm !== password) {
  console.error('Gagal: kedua kata sandi tidak sama.');
  process.exit(1);
}

let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : existsSync(EXAMPLE_PATH) ? readFileSync(EXAMPLE_PATH, 'utf8') : '';
env = setEnvLine(env, 'ADMIN_PASSWORD_HASH', hashPassword(password));
if (!/^IP_SALT=.+$/m.test(env)) env = setEnvLine(env, 'IP_SALT', randomBytes(16).toString('hex'));
writeFileSync(ENV_PATH, env, 'utf8');

console.log('Berhasil. Hash kata sandi disimpan di .env (ADMIN_PASSWORD_HASH).');
console.log('Restart server agar perubahan berlaku. Semua sesi admin lama tetap berlaku hingga 8 jam.');
