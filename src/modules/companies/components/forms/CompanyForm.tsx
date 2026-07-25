import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationSearchDropdown from "@/components/ui/location-search-dropdown";
import { Textarea } from "@/components/ui/textarea";
import type { Company } from "@/modules/companies/types";
import LocationMapPreview from "@/modules/map/components/LocationMapPreview";
import React, { useEffect, useMemo, useState } from "react";

export type CompanyFormValues = {
  name: string;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  industry: string | null;
  size: string | null;
  locationText: string | null;
  notes: string | null;
};

type CompanyFormProps = {
  mode: "create" | "edit";
  initialCompany?: Company | null;
  onSubmit: (values: CompanyFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onCancel: () => void;
};

function CompanyForm({
  mode,
  initialCompany,
  onSubmit,
  onDelete,
  onCancel,
}: CompanyFormProps) {
  const initialValues = useMemo<CompanyFormValues>(
    () => ({
      name: initialCompany?.name ?? "",
      websiteUrl: initialCompany?.websiteUrl ?? null,
      linkedinUrl: initialCompany?.linkedinUrl ?? null,
      industry: initialCompany?.industry ?? null,
      size: initialCompany?.size ?? null,
      locationText: initialCompany?.locationText ?? null,
      notes: initialCompany?.notes ?? null,
    }),
    [initialCompany],
  );

  const [values, setValues] = useState<CompanyFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim()) {
      setError("Company name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
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
            <span className="text-sm font-medium">Company Name</span>
            <Input
              className=""
              type="text"
              value={values.name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Acme Inc"
              required
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Website URL</span>
            <Input
              className=""
              type="text"
              value={values.websiteUrl ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  websiteUrl: event.target.value || null,
                }))
              }
              placeholder="https://company.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
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
              placeholder="https://linkedin.com/company/..."
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Industry</span>
            <Input
              className=""
              type="text"
              value={values.industry ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  industry: event.target.value || null,
                }))
              }
              placeholder="Software"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Size</span>
            <Input
              className=""
              type="text"
              value={values.size ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  size: event.target.value || null,
                }))
              }
              placeholder="51-200"
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
              placeholder="New York, NY"
            />
          </label>

          {mode === "edit" ? (
            <LocationMapPreview
              locationText={values.locationText}
              locationLat={initialCompany?.locationLat ?? null}
              locationLng={initialCompany?.locationLng ?? null}
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
              placeholder="Any helpful context"
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
            {isDeleting ? "Deleting..." : "Delete Company"}
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
                ? "Create Company"
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default CompanyForm;
