import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { config } from "../config";
import { prisma } from "../prisma/client";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export function signAccessToken(userId: string, email: string): string {
  const payload = { sub: userId, email, type: "access" as const };
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtlSeconds,
  });
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlSeconds * 1000);
  await prisma.refreshToken.create({
    data: { userId, token: rawToken, expiresAt },
  });
  return rawToken;
}

export async function rotateRefreshToken(
  oldToken: string,
  userId: string
): Promise<string> {
  await prisma.refreshToken.update({
    where: { token: oldToken },
    data: { revokedAt: new Date() },
  });
  return issueRefreshToken(userId);
}

export async function revokeUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function buildAuthCookies(tokens: Tokens) {
  const common = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: false,
    path: "/",
    // Don't set domain for localhost
  };
  return {
    access: {
      name: "access_token",
      value: tokens.accessToken,
      options: { ...common, maxAge: config.accessTokenTtlSeconds * 1000 },
    },
    refresh: {
      name: "refresh_token",
      value: tokens.refreshToken,
      options: { ...common, maxAge: config.refreshTokenTtlSeconds * 1000 },
    },
  };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwtAccessSecret) as {
    sub: string;
    email: string;
    type: "access";
  };
}
