CREATE TABLE "admin_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"invited_by_admin_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "admin_invitations" ADD CONSTRAINT "admin_invitations_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_invitations" ADD CONSTRAINT "admin_invitations_invited_by_admin_id_admin_users_id_fk" FOREIGN KEY ("invited_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_invitations_email_idx" ON "admin_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "admin_invitations_expires_at_idx" ON "admin_invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "admin_invitations_invited_by_admin_id_idx" ON "admin_invitations" USING btree ("invited_by_admin_id");