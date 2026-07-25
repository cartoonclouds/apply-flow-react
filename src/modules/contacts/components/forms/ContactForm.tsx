import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationSearchDropdown from "@/components/ui/location-search-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_TYPE_VALUES } from "@/constants/enum-values";
import type { Contact } from "@/modules/contacts/types";
import LocationMapPreview from "@/modules/map/components/LocationMapPreview";
import React, { useEffect, useMemo, useState } from "react";

type CompanyOption = {
  id: string;
  name: string;
};

export type ContactFormValues = {
  fullName: string;
  companyId: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  type: Contact["type"];
  locationText: string | null;
  notes: string | null;
};

type ContactFormProps = {
  mode: "create" | "edit";
  companies: CompanyOption[];
  initialContact?: Contact | null;
  onSubmit: (values: ContactFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onCancel: () => void;
};

function ContactForm({
  mode,
  companies,
  initialContact,
  onSubmit,
  onDelete,
  onCancel,
}: ContactFormProps) {
  const initialValues = useMemo<ContactFormValues>(
    () => ({
      fullName: initialContact?.fullName ?? "",
      companyId: initialContact?.companyId ?? null,
      email: initialContact?.email ?? null,
      phone: initialContact?.phone ?? null,
      linkedinUrl: initialContact?.linkedinUrl ?? null,
      type: initialContact?.type ?? CONTACT_TYPE_VALUES[0],
      locationText: initialContact?.locationText ?? null,
      notes: initialContact?.notes ?? null,
    }),
    [initialContact],
  );

  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...values,
        fullName: values.fullName.trim(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onDelete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form className="flex h-full flex-col" onSubmit={handleSubmit}>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Full Name</span>
            <Input
              className=""
              type="text"
              value={values.fullName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              placeholder="Jane Doe"
              required
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Company</span>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={values.companyId ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  companyId: event.target.value || null,
                }))
              }
            >
              <option value="">No company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Type</span>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={values.type}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  type: event.target.value as Contact["type"],
                }))
              }
            >
              {CONTACT_TYPE_VALUES.map((contactType) => (
                <option key={contactType} value={contactType}>
                  {contactType.charAt(0).toUpperCase() + contactType.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <Input
              className=""
              type="email"
              value={values.email ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  email: event.target.value || null,
                }))
              }
              placeholder="jane@company.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Phone</span>
            <Input
              className=""
              type="text"
              value={values.phone ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  phone: event.target.value || null,
                }))
              }
              placeholder="+1 555 123 4567"
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">LinkedIn URL</span>
            <Input
              className=""
              type="text"
              value={values.linkedinUrl ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  linkedinUrl: event.target.value || null,
                }))
              }
              placeholder="https://linkedin.com/in/..."
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Location</span>
            <LocationSearchDropdown
              className=""
              value={values.locationText ?? ""}
              onValueChange={(nextLocationText: string) =>
                setValues((current) => ({
                  ...current,
                  locationText: nextLocationText || null,
                }))
              }
              placeholder="Remote"
            />
          </label>

          {mode === "edit" ? (
            <LocationMapPreview
              locationText={values.locationText}
              locationLat={initialContact?.locationLat ?? null}
              locationLng={initialContact?.locationLng ?? null}
            />
          ) : null}

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <Textarea
              className=""
              value={values.notes ?? ""}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setValues((current) => ({
                  ...current,
                  notes: event.target.value || null,
                }))
              }
              placeholder="Any context about this contact"
            />
          </label>

          {error ? (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t p-4">
        {mode === "edit" && onDelete ? (
          <Button
            className="text-destructive"
            type="button"
            variant="outline"
            onClick={() => {
              void handleDelete();
            }}
            disabled={isSubmitting || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Contact"}
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            className=""
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting || isDeleting}
          >
            Cancel
          </Button>
          <Button
            className=""
            type="submit"
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Contact"
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ContactForm;
