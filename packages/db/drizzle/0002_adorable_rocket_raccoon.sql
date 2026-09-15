CREATE TABLE "subscription_usage_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"included_dms" integer DEFAULT 0 NOT NULL,
	"used_included_dms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_usage_periods_subscription_id_period_start_unique" UNIQUE("subscription_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "subscription_credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"credit_type" varchar(32) NOT NULL,
	"amount" integer NOT NULL,
	"consumed_amount" integer DEFAULT 0 NOT NULL,
	"addon_purchase_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_usage_periods" ADD CONSTRAINT "subscription_usage_periods_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_credit_ledger" ADD CONSTRAINT "subscription_credit_ledger_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_credit_ledger" ADD CONSTRAINT "subscription_credit_ledger_addon_purchase_id_subscription_addons_purchased_id_fk" FOREIGN KEY ("addon_purchase_id") REFERENCES "public"."subscription_addons_purchased"("id") ON DELETE set null ON UPDATE no action;