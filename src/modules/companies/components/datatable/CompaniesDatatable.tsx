import { Button } from "@/components/ui/button";
import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import { useToast } from "@/modules/notifications/context/ToastContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CompanyRepository } from "../../repositories/CompanyRepository";
import type { Company } from "../../types";
import type { CompanyFormValues } from "../forms/CompanyForm";
import CompanyModal from "../modal/CompanyModal";
import { getCompanyColumns } from "./CompaniesColumns";

function CompaniesDatatable() {
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { notify } = useToast();

  const companyRepository = useMemo(() => new CompanyRepository(db), []);

  const columns = useMemo(
    () =>
      getCompanyColumns({
        onOpenCompany: (company) => {
          setSelectedCompany(company);
          setModalMode("edit");
          setModalOpen(true);
        },
        onDeleteCompany: (company) => {
          void handleDelete(company);
        },
      }),
    [],
  );

  const loadCompanies = useCallback(async () => {
    const data = await companyRepository.list();
    setCompaniesData(data);
    setError(null);
  }, [companyRepository]);

  useEffect(() => {
    void loadCompanies()
      .then((data) => {
        return data;
      })
      .catch((caught) => {
        const message =
          caught instanceof Error ? caught.message : "Failed to load data";
        setError(message);
        console.error(caught);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadCompanies]);

  function openCreateModal() {
    setModalMode("create");
    setSelectedCompany(null);
    setModalOpen(true);
  }

  async function handleSubmit(values: CompanyFormValues) {
    try {
      if (modalMode === "create") {
        await companyRepository.create({
          id: crypto.randomUUID(),
          name: values.name,
          websiteUrl: values.websiteUrl,
          linkedinUrl: values.linkedinUrl,
          industry: values.industry,
          size: values.size,
          locationText: values.locationText,
          notes: values.notes,
        } as any);

        notify({
          title: "Company created",
          description: `${values.name} was added successfully.`,
          variant: "success",
        });
      } else if (selectedCompany) {
        await companyRepository.update(selectedCompany.id, {
          name: values.name,
          websiteUrl: values.websiteUrl,
          linkedinUrl: values.linkedinUrl,
          industry: values.industry,
          size: values.size,
          locationText: values.locationText,
          notes: values.notes,
        } as any);

        notify({
          title: "Company updated",
          description: `${values.name} was saved successfully.`,
          variant: "success",
        });
      }

      await loadCompanies();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      notify({
        title: "Could not save company",
        description: message,
        variant: "error",
      });

      throw caught;
    }
  }

  async function handleDelete(company: Company, rethrow = false) {
    const shouldDelete = window.confirm(
      `Delete company \"${company.name}\"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await companyRepository.delete(company.id);
      await loadCompanies();

      notify({
        title: "Company deleted",
        description: `${company.name} was removed.`,
        variant: "success",
      });

      setSelectedCompany((current) => {
        if (current?.id !== company.id) {
          return current;
        }

        setModalOpen(false);
        setModalMode("create");
        return null;
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      notify({
        title: "Could not delete company",
        description: message,
        variant: "error",
      });

      if (rethrow) {
        throw caught;
      }
    }
  }

  if (loading) {
    return <div>Loading companies...</div>;
  }

  if (error) {
    return <div>Failed to load companies: {error}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          className=""
          type="button"
          variant="outline"
          size="sm"
          onClick={openCreateModal}
        >
          New Company
        </Button>
      </div>

      <Datatable
        columns={columns}
        data={companiesData}
        onRowClick={(company) => {
          setSelectedCompany(company);
          setModalMode("edit");
          setModalOpen(true);
        }}
      />

      <CompanyModal
        open={modalOpen}
        mode={modalMode}
        company={selectedCompany}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        onDelete={async () => {
          if (!selectedCompany) {
            return;
          }

          await handleDelete(selectedCompany, true);
        }}
      />
    </div>
  );
}

export default CompaniesDatatable;
