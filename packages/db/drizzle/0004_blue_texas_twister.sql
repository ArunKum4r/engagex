ALTER TABLE "sessions" ADD COLUMN "impersonated_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "impersonation_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_admin_id_admin_users_id_fk" FOREIGN KEY ("impersonated_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_impersonated_by_admin_id_idx" ON "sessions" USING btree ("impersonated_by_admin_id");