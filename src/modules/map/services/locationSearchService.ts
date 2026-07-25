export type LocationSuggestion = {
  label: string;
  value: string;
};

type NominatimSearchResult = {
  display_name?: string;
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export async function searchLocationSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      limit: "8",
      q: normalizedQuery,
    });

    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      return [];
    }

    const rows = (await response.json()) as NominatimSearchResult[];
    const seen = new Set<string>();

    return rows
      .map((row) => row.display_name?.trim() ?? "")
      .filter((label) => Boolean(label))
      .filter((label) => {
        if (seen.has(label)) {
          return false;
        }

        seen.add(label);
        return true;
      })
      .map((label) => ({
        label,
        value: label,
      }));
  } catch {
    return [];
  }
}
