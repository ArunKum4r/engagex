CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"platform_account_id" uuid NOT NULL,
	"external_comment_id" varchar(255) NOT NULL,
	"external_user_id" varchar(255) NOT NULL,
	"username" varchar(255),
	"text" text,
	"media_id" varchar(255),
	"media_type" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_platform_account_external_unique" UNIQUE("platform_account_id","external_comment_id")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_workspace_idx" ON "comments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "comments_platform_account_idx" ON "comments" USING btree ("platform_account_id");--> statement-breakpoint
CREATE INDEX "comments_external_user_idx" ON "comments" USING btree ("external_user_id");