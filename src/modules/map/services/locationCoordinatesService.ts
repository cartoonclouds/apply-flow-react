type GeocodeResult = {
  lat: string;
  lon: string;
};

type LocationData = {
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

function parseCoordinate(value: string): number | null {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function resolveLocationCoordinates(
  locationText?: string | null,
): Promise<{
  locationLat: number | null;
  locationLng: number | null;
}> {
  const normalizedLocation = locationText?.trim();

  if (!normalizedLocation) {
    return {
      locationLat: null,
      locationLng: null,
    };
  }

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      limit: "1",
      q: normalizedLocation,
    });

    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`);

    if (!response.ok) {
      return {
        locationLat: null,
        locationLng: null,
      };
    }

    const rows = (await response.json()) as GeocodeResult[];
    const first = rows[0];

    if (!first) {
      return {
        locationLat: null,
        locationLng: null,
      };
    }

    return {
      locationLat: parseCoordinate(first.lat),
      locationLng: parseCoordinate(first.lon),
    };
  } catch {
    return {
      locationLat: null,
      locationLng: null,
    };
  }
}

export async function withResolvedLocationCoordinates<T extends LocationData>(
  data: T,
): Promise<T> {
  const coordinates = await resolveLocationCoordinates(data.locationText);

  return {
    ...data,
    locationLat: coordinates.locationLat,
    locationLng: coordinates.locationLng,
  };
}
