import ApplicationsDatatable from "@/modules/applications/components/datatable/ApplicationsDatatable";
import InsightsSection from "@/modules/insights/components/InsightsSection";
import React from "react";

function DashboardPage() {
  return (
    <>
      <InsightsSection />
      <ApplicationsDatatable />
    </>
  );
}

export default DashboardPage;
