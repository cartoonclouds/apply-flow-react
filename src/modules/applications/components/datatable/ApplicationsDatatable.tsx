import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import React, { useEffect, useState } from "react";
import { ApplicationRepository } from "../../repositories/ApplicationRepository";
import type { Application } from "../../types";
import { columns } from "./columns";

function ApplicationsDatatable() {
  const [applicationsData, setApplicationsData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const applicationRepository = new ApplicationRepository(db as any);

    void applicationRepository
      .list()
      .then((data) => {
        setApplicationsData(data);
        setError(null);
      })
      .catch((caught) => {
        const message =
          caught instanceof Error ? caught.message : "Failed to load data";
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return <div>Failed to load applications: {error}</div>;
  }

  return <Datatable columns={columns} data={applicationsData} />;
}

export default ApplicationsDatatable;
