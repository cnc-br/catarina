"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { DialogEstadoCivil } from "@/components/custom/dashboard/estado-civil/dialog-estado-civil";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type EstadoCivil = {
  id: number;
  descricao: string;
};

export default function EstadoCivilPage() {
  const [estadosCivil, setEstadosCivil] = useState<EstadoCivil[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarEstadosCivil = useCallback(async () => {
    try {
      const res = await fetch("/api/ambrosio/configuracoes/estadoCivil", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Nao foi possivel carregar os estados civis.");
      }

      const payload = await res.json();
      const lista = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const estadosCivilNormalizados = lista
        .map((item: Partial<EstadoCivil>) => ({
          id: Number(item.id),
          descricao: String(item.descricao ?? ""),
        }))
        .filter(
          (item: EstadoCivil) => Number.isFinite(item.id) && item.descricao,
        );

      setEstadosCivil(estadosCivilNormalizados);
      setErro("");
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel carregar os estados civis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEstadosCivil();
  }, [carregarEstadosCivil]);

  const totalEstadosCivil = useMemo(
    () => estadosCivil.length,
    [estadosCivil],
  );

  return (
    <div className="space-y-6">
      <PageSubtitle
        title="Estado Civil"
        subTitle="Lista completa dos estados civis cadastrados"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
              Estados Civis
            </span>
            <DialogEstadoCivil onSuccess={carregarEstadosCivil} />
          </CardTitle>
          <CardDescription>
            Opcoes de estado civil disponiveis para as pessoas do Caminho
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <SkeletonLoading mensagem="Carregando estados civis ..." />
          )}

          {!loading && erro && (
            <div className="text-sm text-destructive">{erro}</div>
          )}

          {!loading && !erro && (
            <div className="space-y-3">
              {estadosCivil.map((estadoCivil) => (
                <div
                  key={estadoCivil.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="min-w-8 justify-center">
                      {estadoCivil.id}
                    </Badge>
                    <p className="text-base font-semibold leading-tight md:text-lg">
                      {estadoCivil.descricao}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}

              {estadosCivil.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nenhum estado civil encontrado.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Total de {totalEstadosCivil} estados civis cadastrados
      </div>
    </div>
  );
}
