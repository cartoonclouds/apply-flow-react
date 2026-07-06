CREATE TYPE "public"."attendance_type" AS ENUM('remote', 'hybrid', 'on-site');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('company', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('part-time', 'contract', 'internship', 'full-time', 'volunteer');--> statement-breakpoint
CREATE TABLE "application_contacts" (
	"application_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"relation_type" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "application_contacts_application_id_contact_id_pk" PRIMARY KEY("application_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "application_documents" (
	"application_id" text NOT NULL,
	"document_id" text NOT NULL,
	"relation_type" text DEFAULT 'attachment' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "application_documents_application_id_document_id_pk" PRIMARY KEY("application_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text,
	"title" text NOT NULL,
	"url" text,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"location_text" text,
	"location_lat" double precision,
	"location_lng" double precision,
	"attendance_type" "attendance_type",
	"employment_type" "employment_type",
	"salary_min" integer,
	"salary_max" integer,
	"currency" text,
	"description" text,
	"interview_process" text,
	"benefits" text,
	"priority" integer DEFAULT 3 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"location_lat" double precision,
	"location_lng" double precision,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"linkedin_url" text,
	"type" "contact_type" NOT NULL,
	"location_text" text,
	"location_lat" double precision,
	"location_lng" double precision,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_contacts" ADD CONSTRAINT "application_contacts_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_contacts" ADD CONSTRAINT "application_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;