import type { Company } from "@/modules/companies/types";
import React from "react";
import CompanyForm, { type CompanyFormValues } from "../forms/CompanyForm";

type CompanyModalProps = {
  open: boolean;
  mode: "create" | "edit";
  company: Company | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CompanyFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function CompanyModal({
  open,
  mode,
  company,
  onOpenChange,
  onSubmit,
  onDelete,
}: CompanyModalProps) {
  const title = mode === "create" ? "Create Company" : "Edit Company";
  const description =
    mode === "create"
      ? "Add a new company to your network."
      : "Update details for this company.";

  async function handleSubmit(values: CompanyFormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  if (!open) {
    return null;
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-1100 m-0 h-full w-full bg-transparent"
      aria-modal="true"
    >
      <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          aria-label="Close company modal"
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

          <CompanyForm
            mode={mode}
            initialCompany={company}
            onSubmit={handleSubmit}
            onDelete={onDelete}
            onCancel={() => onOpenChange(false)}
          />
        </section>
      </div>
    </dialog>
  );
}

export default CompanyModal;
