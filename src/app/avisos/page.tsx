"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { IAviso } from "@/interfaces/IAviso";
import { BellRing, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

function formatarData(dataFim: string): string {
  const date = new Date(dataFim);
  if (Number.isNaN(date.getTime())) return dataFim;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function PublicAvisosPage() {
  const [avisos, setAvisos] = useState<IAviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarAvisos = async () => {
      try {
        const res = await fetch("/api/ambrosio/avisos", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Nao foi possivel carregar os avisos.");
        }

        const payload = await res.json();
        const lista = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (ativo) {
          setAvisos(lista);
          setErro("");
        }
      } catch (error) {
        console.error(error);
        if (ativo) {
          setErro("Nao foi possivel carregar os avisos.");
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    carregarAvisos();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-3xl font-bold">Avisos</h1>
          <p className="text-muted-foreground text-balance">
            Comunicados do Caminho Neocatecumenal
          </p>
        </div>

        {loading && <SkeletonLoading mensagem="Carregando avisos ..." />}

        {!loading && erro && (
          <Alert variant="destructive">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {!loading && !erro && (
          <div className="space-y-4">
            {avisos.map((aviso) => (
              <Card key={aviso.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BellRing className="h-5 w-5 text-primary" />
                    Aviso
                  </CardTitle>
                  <CardDescription>
                    Válido até {formatarData(aviso.dataFim)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{aviso.texto}</p>
                </CardContent>
              </Card>
            ))}

            {avisos.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Nenhum aviso no momento.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
