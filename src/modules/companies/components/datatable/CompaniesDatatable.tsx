import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import React, { useEffect, useState } from "react";
import { CompanyRepository } from "../../repositories/CompanyRepository";
import type { Company } from "../../types";
import { columns } from "./CompaniesColumns";

function CompaniesDatatable() {
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const companyRepository = new CompanyRepository(db);

    void companyRepository
      .list()
      .then((data) => {
        setCompaniesData(data);
        setError(null);
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
  }, []);

  if (loading) {
    return <div>Loading companies...</div>;
  }

  if (error) {
    return <div>Failed to load companies: {error}</div>;
  }

  return <Datatable columns={columns} data={companiesData} />;
}

export default CompaniesDatatable;
