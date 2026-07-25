import App from "@/App";
import { ApplicationCalendar } from "@/modules/applications/components/calendar/ApplicationCalendar";
import ApplicationsDatatable from "@/modules/applications/components/datatable/ApplicationsDatatable";
import CompaniesDatatable from "@/modules/companies/components/datatable/CompaniesDatatable";
import ContactsDatatable from "@/modules/contacts/components/datatable/ContactsDatatable";
import DashboardPage from "@/modules/insights/components/DashboardPage";
import MapPage from "@/modules/map/components/MapPage";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

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

const companiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "companies",
  component: CompaniesDatatable,
});

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "contacts",
  component: ContactsDatatable,
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "map",
  component: MapPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  applicationsRoute,
  calendarRoute,
  companiesRoute,
  contactsRoute,
  mapRoute,
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
