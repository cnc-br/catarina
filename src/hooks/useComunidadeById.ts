"use client";

import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/lib/utils";
import { Comunidade, ComunidadeEtapa } from "neocatecumenal";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface UseComunidadeByIdParams {
  id: string;
  routeRedirect?: string;
}

export function useComunidadeById({
  id,
  routeRedirect = "/dashboard/comunidades",
}: UseComunidadeByIdParams) {
  const router = useRouter();
  const { toast } = useToast();
  const [comunidade, setComunidade] = useState<Comunidade>();

  const fetchComunidade = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/ambrosio/comunidade/${id}`);

      if (res.status === 404) {
        toast({
          title: "Comunidade não encontrada",
          variant: "destructive",
          description: "Comunidade não encontrada. Tente novamente",
        });
        router.push(routeRedirect);
        return;
      }

      if (res.status === 401) {
        toast({
          title: "Sem permissão",
          variant: "destructive",
          description: "Você não tem permissão para ver essa comunidade",
        });
        router.push(routeRedirect);
        return;
      }

      const data = await res.json();
      const comunidadeNormalizada: Comunidade = {
        ...data,
        comunidadeEtapas: data.comunidadeEtapas?.map((ce: ComunidadeEtapa) => ({
          ...ce,
          dataInicio: ce?.dataInicio ? new Date(ce.dataInicio) : undefined,
        })),
      };

      setComunidade(comunidadeNormalizada);
    } catch (error: unknown) {
      toast({
        title: "Erro ao buscar comunidade",
        variant: "destructive",
        description: `Erro: ${error instanceof Error ? error.message : "Erro inesperado"}`,
      });
    }
  }, [id, toast, router, routeRedirect]);

  useEffect(() => {
    void (async () => {
      await fetchComunidade();
    })();
  }, [fetchComunidade]);

  return {
    comunidade,
    fetchComunidade,
  };
}