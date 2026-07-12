CREATE TABLE "application_contacts" (
	"application_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"relation_type" text DEFAULT 'owner' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "application_contacts_application_id_contact_id_pk" PRIMARY KEY("application_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "application_documents" (
	"application_id" text NOT NULL,
	"document_id" text NOT NULL,
	"relation_type" text DEFAULT 'attachment' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "application_documents_application_id_document_id_pk" PRIMARY KEY("application_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text,
	"title" text NOT NULL,
	"url" text,
	"applied_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"location_text" text,
	"location_lat" real,
	"location_lng" real,
	"attendance_type" text,
	"employment_type" text,
	"salary_min" integer,
	"salary_max" integer,
	"currency" text,
	"description" text,
	"interview_process" text,
	"benefits" text,
	"priority" integer DEFAULT 3 NOT NULL,
	"is_archived" integer DEFAULT 0 NOT NULL,
	"deleted_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"linkedin_url" text,
	"industry" text,
	"size" text,
	"location_text" text,
	"location_lat" real,
	"location_lng" real,
	"notes" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"linkedin_url" text,
	"type" text NOT NULL,
	"location_text" text,
	"location_lat" real,
	"location_lng" real,
	"notes" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"kind" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"checksum" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
