/**
 * useNearbyListings.js — TanStack Query hook for fetching nearby listings
 *
 * Fetches listings from GET /api/listings/nearby?lng=...&lat=...
 * Uses the existing fetchData helper from serviceApi for consistency.
 *
 * Usage:
 *   const { data, isLoading, isError, error } = useNearbyListings(lng, lat);
 */

import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../config/ServiceApi/serviceApi";

/**
 * Fetch nearby listings based on coordinates
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} [radius=10000] - Search radius in meters (default: 10km)
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
const useNearbyListings = (lng, lat, radius = 10000) => {
  return useQuery({
    // Query key includes coordinates so it refetches on location change
    queryKey: ["nearbyListings", lng, lat, radius],

    // Query function — uses existing fetchData helper
    queryFn: () =>
      fetchData(`api/listings/nearby?lng=${lng}&lat=${lat}&radius=${radius}`),

    // Only run when we have valid coordinates
    enabled: !!lng && !!lat,

    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Keep previous data while fetching new data (smoother UX on map pan)
    keepPreviousData: true,

    // Don't refetch on window focus for map data
    refetchOnWindowFocus: false,

    // Select the results array from the response
    select: (data) => data?.results || [],
  });
};

export default useNearbyListings;
