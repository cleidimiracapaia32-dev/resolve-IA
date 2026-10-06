import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import type { Category } from "../../api/lib/exercises";

export function useExam(id: number, refetchWhileRunning = false) {
  return useQuery({
    ...orpc.exams.get.queryOptions({ input: { id } }),
    refetchInterval: refetchWhileRunning ? false : false,
  });
}

export function useStartExam() {
  return useMutation(orpc.exams.start.mutationOptions());
}

export function useFinishExam() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.exams.finish.mutationOptions(),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: orpc.exams.get.queryOptions({ input: { id: vars.id } }).queryKey });
      qc.invalidateQueries({ queryKey: orpc.stats.key() });
      qc.invalidateQueries({ queryKey: orpc.exams.list.key() });
    },
  });
}

export function useExamList() {
  return useQuery(orpc.exams.list.queryOptions({ staleTime: 10_000 }));
}

export type { Category };
