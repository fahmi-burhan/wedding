/**
 * tests/helpers.ts — pembuat aplikasi uji dengan database :memory: dan jam yang bisa diatur.
 * Dipanggil oleh: tests/*.test.ts.
 * Memanggil: server/db.ts, server/app.ts, server/lib/auth.ts.
 */
import { randomUUID } from 'node:crypto';
import { openDb } from '../server/db.ts';
import { createApp } from '../server/app.ts';
import { hashPassword } from '../server/lib/auth.ts';

export const ADMIN_PASSWORD = 'kata-sandi-uji-123';
const ADMIN_HASH = hashPassword(ADMIN_PASSWORD);

/** Waktu "sekarang" default di test: 1 Desember 2026 (sebelum tenggat 20 Desember). */
export const BEFORE_DEADLINE = Date.parse('2026-12-01T10:00:00+07:00');

export function makeApp(start = BEFORE_DEADLINE, dbPath = ':memory:') {
  const clock = { now: start };
  const db = openDb(dbPath);
  const app = createApp({
    db,
    now: () => clock.now,
    adminPasswordHash: ADMIN_HASH,
    publicBaseUrl: 'https://undangan.contoh.test',
  });
  return { app, db, clock };
}

/** Body RSVP valid; field bisa ditimpa. renderedAt 10 dtk sebelum "sekarang". */
export function rsvpBody(now: number, over: Record<string, unknown> = {}) {
  return {
    submissionId: randomUUID(),
    name: 'Budi Santoso',
    attendance: 'hadir',
    pax: 2,
    sessions: ['akad', 'walimah'],
    message: 'Barakallahu lakuma.',
    showMessage: true,
    website: '',
    renderedAt: now - 10_000,
    ...over,
  };
}
