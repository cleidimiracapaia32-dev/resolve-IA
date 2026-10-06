import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function usePlans() {
  return useQuery(orpc.billing.plans.queryOptions({ staleTime: 10_000 }));
}

export function useSetPlan() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.billing.setPlan.mutationOptions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orpc.billing.key() });
      qc.invalidateQueries({ queryKey: orpc.stats.key() });
    },
  });
}
