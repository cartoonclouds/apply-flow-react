import { db } from "@/db";
import type { CompanyFormValues } from "@/modules/companies/components/forms/CompanyForm";
import CompanyModal from "@/modules/companies/components/modal/CompanyModal";
import type { Company } from "@/modules/companies/types";
import type { ContactFormValues } from "@/modules/contacts/components/forms/ContactForm";
import ContactModal from "@/modules/contacts/components/modal/ContactModal";
import type { Contact } from "@/modules/contacts/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, MapPinned, Users } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

type MapItemKind = "company" | "contact";

type MapItem = {
  id: string;
  kind: MapItemKind;
  name: string;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
};

type MapPoint = MapItem & {
  position: [number, number];
};

type CompanyOption = {
  id: string;
  name: string;
};

function getItemIcon(kind: MapItemKind) {
  return kind === "company" ? Building2 : Users;
}

function getItemColors(kind: MapItemKind) {
  return kind === "company"
    ? "border-amber-300 bg-amber-100 text-amber-700"
    : "border-sky-300 bg-sky-100 text-sky-700";
}

function getMarkerIcon(kind: MapItemKind) {
  const Icon = getItemIcon(kind);
  const colors =
    kind === "company"
      ? { background: "#f59e0b", border: "#b45309" }
      : { background: "#38bdf8", border: "#0284c7" };

  return L.divIcon({
    className: "",
    html: renderToStaticMarkup(
      <div
        style={{
          alignItems: "center",
          background: colors.background,
          border: `2px solid ${colors.border}`,
          borderRadius: "9999px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
          color: "white",
          display: "flex",
          height: 40,
          justifyContent: "center",
          width: 40,
        }}
      >
        <Icon size={18} />
      </div>,
    ),
    iconAnchor: [20, 20],
    iconSize: [40, 40],
    popupAnchor: [0, -18],
  });
}

function MapBoundsController({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0].position, 8);
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => point.position));
    map.fitBounds(bounds.pad(0.2));
  }, [map, points]);

  return null;
}

function MapPage() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const [companyRows, contactRows] = await Promise.all([
          db.query.companies.findMany({
            columns: {
              id: true,
              name: true,
              websiteUrl: true,
              linkedinUrl: true,
              industry: true,
              size: true,
              locationLat: true,
              locationLng: true,
              locationText: true,
              notes: true,
            },
          }),
          db.query.contacts.findMany({
            columns: {
              id: true,
              companyId: true,
              fullName: true,
              email: true,
              phone: true,
              linkedinUrl: true,
              type: true,
              locationLat: true,
              locationLng: true,
              locationText: true,
              notes: true,
            },
          }),
        ]);

        if (!active) {
          return;
        }

        setItems([
          ...companyRows.map((company) => ({
            id: company.id,
            kind: "company" as const,
            name: company.name,
            locationText: company.locationText,
            locationLat: company.locationLat,
            locationLng: company.locationLng,
          })),
          ...contactRows.map((contact) => ({
            id: contact.id,
            kind: "contact" as const,
            name: contact.fullName,
            locationText: contact.locationText,
            locationLat: contact.locationLat,
            locationLng: contact.locationLng,
          })),
        ]);
        setCompanies(
          companyRows.map((company) => ({
            id: company.id,
            name: company.name,
          })),
        );
        setError(null);
      } catch (caught) {
        if (!active) {
          return;
        }

        setError(
          caught instanceof Error ? caught.message : "Failed to load map data",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      active = false;
    };
  }, []);

  const locatedPoints = useMemo(() => {
    return items.filter(
      (item): item is MapPoint =>
        item.locationLat !== null && item.locationLng !== null,
    );
  }, [items]);

  const mapPoints = useMemo(
    () =>
      locatedPoints.map((item) => ({
        ...item,
        position: [item.locationLat as number, item.locationLng as number] as [
          number,
          number,
        ],
      })),
    [locatedPoints],
  );

  const missingLocations = useMemo(
    () =>
      items.filter(
        (item) => item.locationLat === null || item.locationLng === null,
      ),
    [items],
  );

  const companyCount = items.filter((item) => item.kind === "company").length;
  const contactCount = items.filter((item) => item.kind === "contact").length;

  function closeAllModals() {
    setCompanyModalOpen(false);
    setContactModalOpen(false);
    setSelectedCompany(null);
    setSelectedContact(null);
  }

  async function openItemModal(point: MapPoint) {
    closeAllModals();

    if (point.kind === "company") {
      const company = await db.query.companies.findFirst({
        where: { id: point.id },
      });

      if (!company) {
        return;
      }

      setSelectedCompany(company as Company);
      setCompanyModalOpen(true);
      return;
    }

    const contact = await db.query.contacts.findFirst({
      where: { id: point.id },
    });

    if (!contact) {
      return;
    }

    setSelectedContact(contact as Contact);
    setContactModalOpen(true);
  }

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return <div>Failed to load map: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <MapPinned className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Map</h1>
            <p className="text-sm text-slate-600">
              {companyCount} companies and {contactCount} contacts loaded.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            Companies
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-500" />
            Contacts
          </span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="min-h-120 overflow-hidden rounded-2xl border border-slate-200">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={false}
              keyboard={false}
              className="min-h-120 h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapBoundsController points={mapPoints} />

              {mapPoints.map((point) => (
                <Marker
                  key={point.id}
                  position={point.position}
                  icon={getMarkerIcon(point.kind)}
                  eventHandlers={{
                    click: () => {
                      void openItemModal(point);
                    },
                  }}
                />
              ))}
            </MapContainer>
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Locations
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Items without coordinates are listed here.
            </p>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const Icon = getItemIcon(item.kind);

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${getItemColors(item.kind)}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-900">
                        {item.name}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                        {item.kind}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.locationText ?? "No location saved"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {missingLocations.length > 0 ? (
            <p className="text-xs text-slate-500">
              {missingLocations.length} item(s) still need coordinates before
              they can be plotted.
            </p>
          ) : null}
        </aside>
      </section>

      <CompanyModal
        open={companyModalOpen}
        mode="edit"
        company={selectedCompany}
        onOpenChange={(open) => {
          setCompanyModalOpen(open);

          if (!open) {
            setSelectedCompany(null);
          }
        }}
        onSubmit={async (_values: CompanyFormValues) => {
          return;
        }}
      />

      <ContactModal
        open={contactModalOpen}
        mode="edit"
        contact={selectedContact}
        companies={companies}
        onOpenChange={(open) => {
          setContactModalOpen(open);

          if (!open) {
            setSelectedContact(null);
          }
        }}
        onSubmit={async (_values: ContactFormValues) => {
          return;
        }}
      />
    </div>
  );
}

export default MapPage;
