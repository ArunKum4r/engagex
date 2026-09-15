import type { Request } from "express";
import type { adminUsers } from "@engagex/db";

export type AuthenticatedAdmin = typeof adminUsers.$inferSelect;

export type AdminAuthenticatedRequest = Request & {
  adminUser: AuthenticatedAdmin;
  adminSessionId: string;
};