import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";
import type { Category } from "../../api/lib/exercises";

export function useAnswer() {
  const qc = useQueryClient();
  return useMutation(
    orpc.practice.answer.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.stats.key() });
      },
    }),
  );
}

export async function fetchNext(category: Category, difficulty: number) {
  return client.practice.next({ category, difficulty });
}
