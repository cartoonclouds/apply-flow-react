import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "@/modules/applications/enums";
import type { Application } from "@/modules/applications/types";
import React, { useEffect, useMemo, useState } from "react";

type CompanyOption = {
  id: string;
  name: string;
};

export type ApplicationFormValues = {
  title: string;
  companyId: string | null;
  url: string | null;
  locationText: string | null;
  attendanceType: Application["attendanceType"];
  employmentType: Application["employmentType"];
  description: string | null;
  priority: number;
  isArchived: boolean;
};

type ApplicationFormProps = {
  mode: "create" | "edit";
  companies: CompanyOption[];
  initialApplication?: Application | null;
  onSubmit: (values: ApplicationFormValues) => Promise<void> | void;
  onCancel: () => void;
};

function ApplicationForm({
  mode,
  companies,
  initialApplication,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const initialValues = useMemo<ApplicationFormValues>(
    () => ({
      title: initialApplication?.title ?? "",
      companyId: initialApplication?.companyId ?? null,
      url: initialApplication?.url ?? null,
      locationText: initialApplication?.locationText ?? null,
      attendanceType: initialApplication?.attendanceType ?? null,
      employmentType: initialApplication?.employmentType ?? null,
      description: initialApplication?.description ?? null,
      priority: initialApplication?.priority ?? 3,
      isArchived: initialApplication?.isArchived ?? false,
    }),
    [initialApplication],
  );

  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({ value: company.id, label: company.name })),
    [companies],
  );

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex h-full flex-col" onSubmit={handleSubmit}>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <Input
              className=""
              type="text"
              value={values.title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Senior Frontend Engineer"
              required
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Company</span>
            <SearchableSelect
              className=""
              value={values.companyId ?? ""}
              options={companyOptions}
              placeholder="No company"
              searchPlaceholder="Search companies..."
              emptyOptionLabel="No company"
              onValueChange={(nextValue: string) =>
                setValues((current) => ({
                  ...current,
                  companyId: nextValue || null,
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Priority</span>
            <Input
              className=""
              type="number"
              min={1}
              max={5}
              value={String(values.priority)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  priority: Number(event.target.value || 3),
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Job URL</span>
            <Input
              className=""
              type="text"
              value={values.url ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  url: event.target.value || null,
                }))
              }
              placeholder="https://jobs.example.com/role"
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Location</span>
            <Input
              className=""
              type="text"
              value={values.locationText ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({
                  ...current,
                  locationText: event.target.value || null,
                }))
              }
              placeholder="Remote"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Attendance Type</span>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={values.attendanceType ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  attendanceType:
                    (event.target.value as Application["attendanceType"]) ||
                    null,
                }))
              }
            >
              <option value="">Not set</option>
              <option value={ApplicationAttendanceType.Remote}>Remote</option>
              <option value={ApplicationAttendanceType.Hybrid}>Hybrid</option>
              <option value={ApplicationAttendanceType.OnSite}>Onsite</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Employment Type</span>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={values.employmentType ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  employmentType:
                    (event.target.value as Application["employmentType"]) ||
                    null,
                }))
              }
            >
              <option value="">Not set</option>
              <option value={ApplicationEmploymentType.FullTime}>
                Full Time
              </option>
              <option value={ApplicationEmploymentType.PartTime}>
                Part Time
              </option>
              <option value={ApplicationEmploymentType.Contract}>
                Contract
              </option>
              <option value={ApplicationEmploymentType.Internship}>
                Internship
              </option>
              <option value={ApplicationEmploymentType.Volunteer}>
                Volunteer
              </option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea
              className=""
              value={values.description ?? ""}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value || null,
                }))
              }
              placeholder="Role description, notes, and requirements"
            />
          </label>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={values.isArchived}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  isArchived: event.target.checked,
                }))
              }
            />
            <span className="text-sm">Archived</span>
          </label>

          {error ? (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 border-t p-4">
        <Button
          className=""
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button className="" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Application"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default ApplicationForm;
