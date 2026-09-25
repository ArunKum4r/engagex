ALTER TABLE "automation_executions" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint

ALTER TABLE "automation_executions" ADD COLUMN "contact_id" uuid;
--> statement-breakpoint

ALTER TABLE "automation_executions" ADD COLUMN "conversation_id" uuid;
--> statement-breakpoint

ALTER TABLE "automation_executions" ADD COLUMN "current_step_id" uuid;
--> statement-breakpoint

ALTER TABLE "automation_executions" ADD COLUMN "resume_at" timestamp with time zone;
--> statement-breakpoint

ALTER TABLE "automation_executions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint

ALTER TABLE "automation_executions" ALTER COLUMN "error_message" SET DATA TYPE varchar(2000);
--> statement-breakpoint

ALTER TABLE "automations" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

ALTER TABLE "automations" ADD COLUMN "execution_policy" varchar(32) DEFAULT 'EXCLUSIVE' NOT NULL;
--> statement-breakpoint

ALTER TABLE "automations" ADD COLUMN "trigger_run_policy" varchar(32) DEFAULT 'EVERY_EVENT' NOT NULL;
--> statement-breakpoint

ALTER TABLE "automations" ADD COLUMN "cooldown_seconds" integer;
--> statement-breakpoint

UPDATE "automation_executions" e
SET "workspace_id" = a."workspace_id"
FROM "automations" a
WHERE e."automation_id" = a."id";
--> statement-breakpoint

ALTER TABLE "automation_executions" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint

CREATE INDEX "automation_executions_workspace_idx" ON "automation_executions" USING btree ("workspace_id");
--> statement-breakpoint

CREATE INDEX "automation_executions_automation_idx" ON "automation_executions" USING btree ("automation_id");
--> statement-breakpoint

CREATE INDEX "automation_executions_webhook_event_idx" ON "automation_executions" USING btree ("webhook_event_id");
--> statement-breakpoint

CREATE INDEX "automation_executions_contact_idx" ON "automation_executions" USING btree ("contact_id");
--> statement-breakpoint

CREATE INDEX "automation_executions_conversation_idx" ON "automation_executions" USING btree ("conversation_id");
--> statement-breakpoint

CREATE INDEX "automation_executions_resume_at_idx" ON "automation_executions" USING btree ("resume_at");
--> statement-breakpoint

CREATE INDEX "automation_executions_current_step_idx" ON "automation_executions" USING btree ("current_step_id");