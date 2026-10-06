import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

export function useTutorHistory() {
  return useQuery(orpc.tutor.list.queryOptions({ staleTime: 5_000 }));
}

async function uploadAndSolve(file: File, note?: string) {
  const contentType = file.type as "image/png" | "image/jpeg" | "image/webp";
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Formato não suportado — usa PNG, JPG ou WebP.");
  const { url, key } = await client.tutor.presign({ filename: file.name, contentType });
  const res = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
  if (!res.ok) throw new Error("Falha no upload da imagem.");
  return client.tutor.solve({ key, note: note?.trim() ? note.trim() : undefined });
}

export function useSolve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, note }: { file: File; note?: string }) => uploadAndSolve(file, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orpc.tutor.key() });
      qc.invalidateQueries({ queryKey: orpc.stats.key() });
    },
  });
}
