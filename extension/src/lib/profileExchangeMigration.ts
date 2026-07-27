import { PROFILE_IMPORT_SCHEMA_VERSION } from "./const";

const LEGACY_EXPORTED_ARRAY_FILTER_KEYS = [
  "resourceTypes",
  "excludedResourceTypes",
  "requestMethods",
  "excludedRequestMethods",
] as const;

export function migrateLegacyProfileExchange(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value;
  }

  const exchange = value as Record<string, unknown>;
  if (exchange.version !== 1 || !Array.isArray(exchange.profiles)) {
    return value;
  }

  return {
    ...exchange,
    version: PROFILE_IMPORT_SCHEMA_VERSION,
    profiles: exchange.profiles.map((profile) => {
      if (typeof profile !== "object" || profile === null || Array.isArray(profile)) {
        return profile;
      }

      const profileRecord = profile as Record<string, unknown>;
      const filters = profileRecord.filters;
      if (typeof filters !== "object" || filters === null || Array.isArray(filters)) {
        return profile;
      }

      const migratedFilters = { ...filters } as Record<string, unknown>;
      for (const key of LEGACY_EXPORTED_ARRAY_FILTER_KEYS) {
        const filter = migratedFilters[key];
        if (Array.isArray(filter)) {
          migratedFilters[key] = {
            type: "radio",
            items: filter,
          };
        }
      }

      return {
        ...profileRecord,
        filters: migratedFilters,
      };
    }),
  };
}
