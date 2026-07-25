import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import {
  consumePendingCreateApplicationModalRequest,
  subscribeOpenCreateApplicationModal,
} from "@/modules/applications/events";
import { useToast } from "@/modules/notifications/context/ToastContext";
import React, { useCallback, useEffect, useState } from "react";
import { ApplicationRepository } from "../../repositories/ApplicationRepository";
import type { Application } from "../../types";
import type { ApplicationFormValues } from "../forms/ApplicationForm";
import ApplicationModal from "../modal/ApplicationModal";
import { getApplicationColumns } from "./ApplicationColumns";

type CompanyOption = {
  id: string;
  name: string;
};

function ApplicationsDatatable() {
  const [applicationsData, setApplicationsData] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const { notify } = useToast();

  const applicationRepository = React.useMemo(
    () => new ApplicationRepository(db),
    [],
  );

  const columns = React.useMemo(
    () =>
      getApplicationColumns({
        onOpenApplication: (application) => {
          setSelectedApplication(application);
          setModalMode("edit");
          setModalOpen(true);
        },
      }),
    [],
  );

  const loadApplications = useCallback(async () => {
    const data = await applicationRepository.list();
    setApplicationsData(data);
    setError(null);
  }, [applicationRepository]);

  const loadCompanies = useCallback(async () => {
    const companyRows = await db.query.companies.findMany();
    setCompanies(
      companyRows.map((company) => ({ id: company.id, name: company.name })),
    );
  }, []);

  useEffect(() => {
    void Promise.all([loadApplications(), loadCompanies()])
      .catch((caught) => {
        const message =
          caught instanceof Error ? caught.message : "Failed to load data";
        setError(message);
        console.error(caught);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadApplications, loadCompanies]);

  useEffect(() => {
    if (consumePendingCreateApplicationModalRequest()) {
      openCreateModal();
    }

    return subscribeOpenCreateApplicationModal(() => {
      openCreateModal();
    });
  }, []);

  function openCreateModal() {
    setModalMode("create");
    setSelectedApplication(null);
    setModalOpen(true);
  }

  async function handleSubmit(values: ApplicationFormValues) {
    try {
      if (modalMode === "create") {
        await applicationRepository.create({
          id: crypto.randomUUID(),
          title: values.title,
          companyId: values.companyId,
          url: values.url,
          locationText: values.locationText,
          attendanceType: values.attendanceType,
          employmentType: values.employmentType,
          description: values.description,
          priority: values.priority,
          isArchived: values.isArchived,
        } as any);

        notify({
          title: "Application created",
          description: `${values.title} was added successfully.`,
          variant: "success",
        });
      } else if (selectedApplication) {
        await applicationRepository.update(selectedApplication.id, {
          title: values.title,
          companyId: values.companyId,
          url: values.url,
          locationText: values.locationText,
          attendanceType: values.attendanceType,
          employmentType: values.employmentType,
          description: values.description,
          priority: values.priority,
          isArchived: values.isArchived,
        } as any);

        notify({
          title: "Application updated",
          description: `${values.title} was saved successfully.`,
          variant: "success",
        });
      }

      await loadApplications();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      notify({
        title: "Could not save application",
        description: message,
        variant: "error",
      });

      throw caught;
    }
  }

  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return <div>Failed to load applications: {error}</div>;
  }

  return (
    <div className="space-y-3">
      <Datatable
        columns={columns}
        data={applicationsData}
        onRowClick={(application) => {
          setSelectedApplication(application);
          setModalMode("edit");
          setModalOpen(true);
        }}
      />

      <ApplicationModal
        open={modalOpen}
        mode={modalMode}
        application={selectedApplication}
        companies={companies}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ApplicationsDatatable;
