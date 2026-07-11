CREATE TABLE "application_contacts" (
	"application_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"relation_type" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "application_contacts_application_id_contact_id_pk" PRIMARY KEY("application_id","contact_id")
);
--> statement-breakpoint
DROP TABLE "application_contacts" CASCADE;--> statement-breakpoint
ALTER TABLE "application_contacts" ADD CONSTRAINT "application_contacts_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_contacts" ADD CONSTRAINT "application_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;