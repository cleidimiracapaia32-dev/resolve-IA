import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useOverview() {
  return useQuery(orpc.stats.overview.queryOptions({ staleTime: 10_000 }));
}
