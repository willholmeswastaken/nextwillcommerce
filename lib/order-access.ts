import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createOrderAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function orderAccessTokensEqual(a: string, b: string): boolean {
  const left = new Uint8Array(createHash("sha256").update(a).digest());
  const right = new Uint8Array(createHash("sha256").update(b).digest());
  return timingSafeEqual(left, right);
}
