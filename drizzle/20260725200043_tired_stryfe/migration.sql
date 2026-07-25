CREATE TABLE "application_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "stage_id" text;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_stage_id_application_stages_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "application_stages"("id") ON DELETE SET NULL;