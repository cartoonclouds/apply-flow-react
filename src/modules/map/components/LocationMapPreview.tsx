import React from "react";

type LocationMapPreviewProps = {
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
};

function buildMapEmbedUrl(lat: number, lng: number): string {
  const delta = 0.03;
  const minLng = lng - delta;
  const minLat = lat - delta;
  const maxLng = lng + delta;
  const maxLat = lat + delta;

  const params = new URLSearchParams({
    bbox: `${minLng},${minLat},${maxLng},${maxLat}`,
    layer: "mapnik",
    marker: `${lat},${lng}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function LocationMapPreview({
  locationText,
  locationLat,
  locationLng,
}: LocationMapPreviewProps) {
  const hasCoordinates =
    typeof locationLat === "number" && typeof locationLng === "number";

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <span className="text-sm font-medium">Location Map</span>

      {hasCoordinates ? (
        <iframe
          title={locationText ? `Map for ${locationText}` : "Location map"}
          src={buildMapEmbedUrl(locationLat, locationLng)}
          className="h-56 w-full rounded-lg border border-input"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
          Save a valid location to preview it on the map.
        </div>
      )}
    </div>
  );
}

export default LocationMapPreview;
