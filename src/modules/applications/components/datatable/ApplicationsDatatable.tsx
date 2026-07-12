import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import {
  consumePendingCreateApplicationDrawerRequest,
  subscribeOpenCreateApplicationDrawer,
} from "@/modules/applications/events";
import React, { useEffect, useState } from "react";
import { ApplicationRepository } from "../../repositories/ApplicationRepository";
import type { Application } from "../../types";
import ApplicationDrawer from "../drawer/ApplicationDrawer";
import type { ApplicationFormValues } from "../forms/ApplicationForm";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const applicationRepository = React.useMemo(
    () => new ApplicationRepository(db),
    [],
  );

  const columns = React.useMemo(
    () =>
      getApplicationColumns({
        onOpenApplication: (application) => {
          setSelectedApplication(application);
          setDrawerMode("edit");
          setDrawerOpen(true);
        },
      }),
    [],
  );

  async function loadApplications() {
    const data = await applicationRepository.list();
    setApplicationsData(data);
    setError(null);
  }

  async function loadCompanies() {
    const companyRows = await db.query.companies.findMany();
    setCompanies(
      companyRows.map((company) => ({ id: company.id, name: company.name })),
    );
  }

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
  }, []);

  useEffect(() => {
    if (consumePendingCreateApplicationDrawerRequest()) {
      openCreateDrawer();
    }

    return subscribeOpenCreateApplicationDrawer(() => {
      openCreateDrawer();
    });
  }, []);

  function openCreateDrawer() {
    setDrawerMode("create");
    setSelectedApplication(null);
    setDrawerOpen(true);
  }

  async function handleSubmit(values: ApplicationFormValues) {
    if (drawerMode === "create") {
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
    }

    await loadApplications();
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
          setDrawerMode("edit");
          setDrawerOpen(true);
        }}
      />

      <ApplicationDrawer
        open={drawerOpen}
        mode={drawerMode}
        application={selectedApplication}
        companies={companies}
        onOpenChange={setDrawerOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ApplicationsDatatable;
