import { Request, Response } from "express";
import argon2 from "argon2";
import { prisma } from "../prisma/client";
import { loginSchema, registerSchema } from "./types";
import {
  buildAuthCookies,
  issueRefreshToken,
  revokeUserTokens,
  rotateRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens";

export async function registerHandler(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });
  return res
    .status(201)
    .json({ id: user.id, email: user.email, name: user.name });
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken(user.id, user.email);
  const refreshToken = await issueRefreshToken(user.id);
  const cookies = buildAuthCookies({ accessToken, refreshToken });
  res.cookie(
    cookies.access.name,
    cookies.access.value,
    cookies.access.options as any
  );
  res.cookie(
    cookies.refresh.name,
    cookies.refresh.value,
    cookies.refresh.options as any
  );
  return res
    .status(200)
    .json({ id: user.id, email: user.email, name: user.name });
}

export async function meHandler(req: Request, res: Response) {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });
    if (!user) return res.status(401).json({ error: "Unauthenticated" });
    return res.json(user);
  } catch {
    return res.status(401).json({ error: "Unauthenticated" });
  }
}

export async function refreshHandler(req: Request, res: Response) {
  const refreshToken = req.cookies?.refresh_token as string | undefined;
  if (!refreshToken) return res.status(401).json({ error: "Unauthenticated" });
  const record = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return res.status(401).json({ error: "Unauthenticated" });
  const newAccessToken = signAccessToken(user.id, user.email);
  const newRefreshToken = await rotateRefreshToken(refreshToken, user.id);
  const cookies = buildAuthCookies({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
  res.cookie(
    cookies.access.name,
    cookies.access.value,
    cookies.access.options as any
  );
  res.cookie(
    cookies.refresh.name,
    cookies.refresh.value,
    cookies.refresh.options as any
  );
  return res.json({ ok: true });
}

export async function logoutHandler(req: Request, res: Response) {
  const userId = req.body?.userId as string | undefined;
  if (userId) {
    await revokeUserTokens(userId);
  }
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return res.status(204).send();
}

export async function updateProfileHandler(req: Request, res: Response) {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const payload = verifyAccessToken(accessToken);
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updateData: { name?: string; email?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Check if email is already in use by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: payload.sub } },
      });
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: updateData,
      select: { id: true, email: true, name: true },
    });

    return res.json(user);
  } catch {
    return res.status(401).json({ error: "Unauthenticated" });
  }
}

export async function updatePasswordHandler(req: Request, res: Response) {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const payload = verifyAccessToken(accessToken);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters long" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const validPassword = await argon2.verify(
      user.passwordHash,
      currentPassword
    );
    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newPasswordHash = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({ message: "Password updated successfully" });
  } catch {
    return res.status(401).json({ error: "Unauthenticated" });
  }
}
