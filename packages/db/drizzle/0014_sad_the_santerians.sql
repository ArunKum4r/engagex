CREATE TABLE "contact_automation_pauses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"automation_id" uuid,
	"paused_by_user_id" uuid NOT NULL,
	"reason" text,
	"paused_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resume_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_automation_pauses_unique" UNIQUE("contact_id","automation_id")
);
--> statement-breakpoint
ALTER TABLE "contact_automation_pauses" ADD CONSTRAINT "contact_automation_pauses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_automation_pauses" ADD CONSTRAINT "contact_automation_pauses_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_automation_pauses" ADD CONSTRAINT "contact_automation_pauses_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_automation_pauses" ADD CONSTRAINT "contact_automation_pauses_paused_by_user_id_users_id_fk" FOREIGN KEY ("paused_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_automation_pauses_workspace_id_idx" ON "contact_automation_pauses" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "contact_automation_pauses_contact_id_idx" ON "contact_automation_pauses" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_automation_pauses_automation_id_idx" ON "contact_automation_pauses" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "contact_automation_pauses_resume_at_idx" ON "contact_automation_pauses" USING btree ("resume_at");