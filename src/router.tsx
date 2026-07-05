import App from "@/App";
import { ApplicationCalendar } from "@/modules/applications/components/calendar/ApplicationCalendar";
import ApplicationsDatatable from "@/modules/applications/components/datatable/ApplicationsDatatable";
import InsightsSection from "@/modules/insights/components/InsightsSection";
import {
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import React from "react";

function DashboardPage() {
  return (
    <>
      <InsightsSection />
      <ApplicationsDatatable />
    </>
  );
}

const rootRoute = createRootRoute({
  component: App,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications",
  component: ApplicationsDatatable,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "calendar",
  component: ApplicationCalendar,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  applicationsRoute,
  calendarRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
