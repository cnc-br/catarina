"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Paroquia, Regiao } from "neocatecumenal";

type RegioesUsuarioProps = {
  userId: string;
  regioes?: Regiao[];
  paroquias?: Paroquia[];
  onSalvo?: () => void;
};

const idsDasRegioes = (regioes?: Regiao[]) =>
  Array.isArray(regioes) ? regioes.map((regiao) => regiao.id) : [];

const idsDasParoquias = (paroquias?: Paroquia[]) => {
  if (!Array.isArray(paroquias)) return [];

  const ids = paroquias
    .map((paroquia) => paroquia.setor?.regiao?.id)
    .filter((id): id is number => typeof id === "number");

  return Array.from(new Set(ids));
};

const regioesIniciais = (regioes?: Regiao[], paroquias?: Paroquia[]) => {
  if (regioes !== undefined) return idsDasRegioes(regioes);

  return idsDasParoquias(paroquias);
};

export function RegioesUsuario({
  userId,
  regioes,
  paroquias,
  onSalvo,
}: RegioesUsuarioProps) {
  const [regioesDisponiveis, setRegioesDisponiveis] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    regioesIniciais(regioes, paroquias),
  );
  const [prevRegioes, setPrevRegioes] = useState(regioes);
  const [prevParoquias, setPrevParoquias] = useState(paroquias);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sincroniza a seleção quando o usuário carregado na página muda.
  if (prevRegioes !== regioes || prevParoquias !== paroquias) {
    setPrevRegioes(regioes);
    setPrevParoquias(paroquias);
    setSelectedIds(regioesIniciais(regioes, paroquias));
  }

  useEffect(() => {
    const controller = new AbortController();

    const fetchRegioes = async () => {
      try {
        const response = await fetch("/api/ambrosio/regiao", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar regiões");
        }

        const body = await response.json();
        setRegioesDisponiveis(Array.isArray(body?.data) ? body.data : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setLoadError(
          err instanceof Error ? err.message : "Erro ao carregar regiões",
        );
        setRegioesDisponiveis([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRegioes();
    return () => controller.abort();
  }, []);

  const toggleSelecionada = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSalvar = async () => {
    if (selectedIds.length === 0 || saving) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const response = await fetch(
        `/api/ambrosio/user/${userId}/regioes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regiaoIds: selectedIds }),
        },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message || "Erro ao salvar as regiões");
      }

      setSaveMessage(body?.message || "Regiões salvas com sucesso");
      onSalvo?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  };

  const semRegioes = !loading && !loadError && regioesDisponiveis.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Regiões
        </CardTitle>
        <CardDescription>
          Selecione as regiões sob responsabilidade do usuário
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando regiões...</span>
          </div>
        )}

        {!loading && loadError && (
          <p className="text-sm text-red-600">{loadError}</p>
        )}

        {semRegioes && (
          <p className="text-muted-foreground text-sm">
            Nenhuma região cadastrada.
          </p>
        )}

        {!loading && !loadError && regioesDisponiveis.length > 0 && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Acesso</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Macro Região</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regioesDisponiveis.map((regiao) => (
                  <TableRow key={regiao.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedIds.includes(regiao.id)}
                        onChange={() => toggleSelecionada(regiao.id)}
                      />
                    </TableCell>
                    <TableCell>{regiao.descricao}</TableCell>
                    <TableCell>{regiao.macroRegiao?.descricao ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {saveMessage && (
              <p className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {saveMessage}
              </p>
            )}
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            <Button
              className="w-full"
              disabled={selectedIds.length === 0 || saving}
              onClick={handleSalvar}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RegioesUsuario;
