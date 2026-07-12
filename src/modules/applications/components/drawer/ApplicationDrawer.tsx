import type { Application } from "@/modules/applications/types";
import React from "react";
import ApplicationForm, {
    type ApplicationFormValues,
} from "../forms/ApplicationForm";

type CompanyOption = {
  id: string;
  name: string;
};

type ApplicationDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  application: Application | null;
  companies: CompanyOption[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
};

function ApplicationDrawer({
  open,
  mode,
  application,
  companies,
  onOpenChange,
  onSubmit,
}: ApplicationDrawerProps) {
  const title = mode === "create" ? "Create Application" : "Edit Application";
  const description =
    mode === "create"
      ? "Add a new application to your pipeline."
      : "Update details for this application.";

  async function handleSubmit(values: ApplicationFormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close application drawer"
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={() => onOpenChange(false)}
      />

      <section className="relative z-10 flex w-[min(48rem,calc(100vw-2rem))] max-h-[85dvh] flex-col overflow-y-auto rounded-xl border bg-popover text-popover-foreground shadow-xl">
        <header className="border-b p-4">
          <h2 className="font-heading text-base font-medium text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </header>

        <ApplicationForm
          mode={mode}
          companies={companies}
          initialApplication={application}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </section>
    </div>
  );
}

export default ApplicationDrawer;
