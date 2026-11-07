"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { AvisoFormDialog } from "@/components/custom/dashboard/avisos/aviso-form-dialog";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import UnauthorizedAccessAlert from "@/components/custom/ui/AlertSemCadastroOuPermissao";
import { useUser } from "@/app/context/user-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IAviso } from "@/interfaces/IAviso";
import { ROLE_ADMIN } from "@/constants";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";

function formatarData(dataFim: string): string {
  const date = new Date(dataFim);
  if (Number.isNaN(date.getTime())) return dataFim;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AvisosPage() {
  const { user } = useUser();
  const [avisos, setAvisos] = useState<IAviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [avisoEmEdicao, setAvisoEmEdicao] = useState<IAviso | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

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
  }, [refreshKey]);

  if (user?.role !== ROLE_ADMIN) {
    return <UnauthorizedAccessAlert title="Avisos" />;
  }

  const handleNovoAviso = () => {
    setAvisoEmEdicao(null);
    setDialogAberto(true);
  };

  const handleEditar = (aviso: IAviso) => {
    setAvisoEmEdicao(aviso);
    setDialogAberto(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogAberto(open);
    if (!open) {
      setAvisoEmEdicao(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageSubtitle
        title="Avisos"
        subTitle="Gerencie os avisos exibidos no site público"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>Avisos cadastrados</span>
            <Button size="sm" onClick={handleNovoAviso}>
              Novo aviso <Plus className="ml-2" />
            </Button>
          </CardTitle>
          <CardDescription>
            Avisos vencidos são removidos automaticamente pelo sistema. A
            listagem é exibida sem necessidade de login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <SkeletonLoading mensagem="Carregando avisos ..." />
          )}

          {!loading && erro && (
            <div className="text-sm text-destructive">{erro}</div>
          )}

          {!loading && !erro && (
            <div className="space-y-3">
              {avisos.map((aviso) => (
                <div
                  key={aviso.id}
                  className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-base font-semibold leading-tight">
                      {aviso.texto}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Válido até {formatarData(aviso.dataFim)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">#{aviso.id}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditar(aviso)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {avisos.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nenhum aviso cadastrado.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AvisoFormDialog
        aviso={avisoEmEdicao}
        open={dialogAberto}
        onOpenChange={handleDialogOpenChange}
        onSuccess={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
}
