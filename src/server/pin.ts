import "server-only";

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/session";

const KEY_LENGTH = 32;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

function peppered(pin: string) {
  return `${pin}:${getAuthSecret()}`;
}

function scryptAsync(password: string, salt: Buffer, keylen: number, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keylen, { N: n, r, p }, (error, derived) => {
      if (error || !derived) {
        reject(error ?? new Error("PIN hash failed."));
        return;
      }
      resolve(derived);
    });
  });
}

export async function hashPin(pin: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(peppered(pin), salt, KEY_LENGTH, SCRYPT_N, SCRYPT_R, SCRYPT_P);

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPinHash(pin: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4] ?? "", "base64url");
  const expected = Buffer.from(parts[5] ?? "", "base64url");

  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) || salt.length === 0 || expected.length === 0) {
    return false;
  }

  const actual = await scryptAsync(peppered(pin), salt, expected.length, n, r, p);
  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
