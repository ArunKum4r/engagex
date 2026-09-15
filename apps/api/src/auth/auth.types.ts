import type { Request } from "express";
import type { users } from "@engagex/db";

export type AuthenticatedUser = typeof users.$inferSelect;

export type ImpersonationContext = {
  adminUserId: string;
  expiresAt: Date;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
  sessionId: string;
  impersonation: ImpersonationContext | null;
};