CREATE TYPE "public"."conversation_reminder_status" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "conversation_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"remind_at" timestamp with time zone NOT NULL,
	"status" "conversation_reminder_status" DEFAULT 'PENDING' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation_reminders" ADD CONSTRAINT "conversation_reminders_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_reminders" ADD CONSTRAINT "conversation_reminders_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_reminders_conversation_idx" ON "conversation_reminders" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_reminders_status_idx" ON "conversation_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_reminders_remind_at_idx" ON "conversation_reminders" USING btree ("remind_at");