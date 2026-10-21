"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, ChurchIcon, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { Paroquia } from "neocatecumenal";

type Cidade = {
  id: number;
  nome: string;
  estado: {
    sigla: string;
  };
};

type ParoquiasUsuarioProps = {
  userId: string;
  paroquias: Paroquia[];
  onSalvo?: () => void;
};

export function ParoquiasUsuario({
  userId,
  paroquias,
  onSalvo,
}: ParoquiasUsuarioProps) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadesLoading, setCidadesLoading] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
  const [paroquiasCidade, setParoquiasCidade] = useState<Paroquia[]>([]);
  const [paroquiasLoading, setParoquiasLoading] = useState(false);
  const [paroquiasError, setParoquiasError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    paroquias.map((paroquia) => paroquia.id),
  );
  const [prevParoquias, setPrevParoquias] = useState(paroquias);

  // Sincroniza a seleção quando a prop com as paróquias atuais muda
  // (o fetch do usuário na página é assíncrono). Ajuste em tempo de render
  // conforme recomendado pela documentação do React (evita efeito com setState).
  if (prevParoquias !== paroquias) {
    setPrevParoquias(paroquias);
    setSelectedIds(paroquias.map((paroquia) => paroquia.id));
  }
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleSelecionada = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchCidades = async () => {
      try {
        const response = await fetch("/api/ambrosio/cidades", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar cidades");
        }

        const body = await response.json();
        setCidades(Array.isArray(body?.data) ? body.data : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
      } finally {
        if (!controller.signal.aborted) {
          setCidadesLoading(false);
        }
      }
    };

    fetchCidades();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedCidade) return;

    const controller = new AbortController();

    const fetchParoquias = async () => {
      setParoquiasLoading(true);
      setParoquiasError(null);

      try {
        const response = await fetch(
          `/api/ambrosio/paroquia?cidadeId=${selectedCidade.id}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar paróquias");
        }

        const body = await response.json();
        setParoquiasCidade(Array.isArray(body?.data) ? body.data : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setParoquiasError(
          err instanceof Error ? err.message : "Erro desconhecido",
        );
        setParoquiasCidade([]);
      } finally {
        if (!controller.signal.aborted) {
          setParoquiasLoading(false);
        }
      }
    };

    fetchParoquias();
    return () => controller.abort();
  }, [selectedCidade]);

  const handleSalvar = async () => {
    if (selectedIds.length === 0 || saving) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const response = await fetch(
        `/api/ambrosio/user/${userId}/paroquias`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paroquiaIds: selectedIds }),
        },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          body?.message || "Erro ao salvar as paróquias",
        );
      }

      setSaveMessage(
        body?.message || "Paróquias salvas com sucesso",
      );
      onSalvo?.();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Erro desconhecido",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChurchIcon className="h-5 w-5" />
          Paróquias
        </CardTitle>
        <CardDescription>
          Selecione uma cidade para listar as paróquias
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboboxOpen}
              disabled={cidadesLoading}
              className="w-full justify-between"
            >
              {selectedCidade
                ? `${selectedCidade.nome}/${selectedCidade.estado.sigla}`
                : cidadesLoading
                  ? "Carregando cidades..."
                  : "Selecione uma cidade"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0">
            <Command>
              <CommandInput placeholder="Buscar cidade ..." />
              <CommandList>
                <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                <CommandGroup>
                  {cidades.map((cidade) => {
                    const label = `${cidade.nome}/${cidade.estado.sigla}`;
                    return (
                      <CommandItem
                        key={cidade.id}
                        value={label}
                        onSelect={() => {
                          setSelectedCidade(cidade);
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCidade?.id === cidade.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {!selectedCidade && (
          <p className="text-muted-foreground text-sm">
            Escolha uma cidade para começar.
          </p>
        )}

        {selectedCidade && paroquiasLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando paróquias...</span>
          </div>
        )}

        {selectedCidade && !paroquiasLoading && paroquiasError && (
          <p className="text-sm text-red-600">{paroquiasError}</p>
        )}

        {selectedCidade &&
          !paroquiasLoading &&
          !paroquiasError &&
          paroquiasCidade.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Nenhuma paróquia encontrada nessa cidade.
            </p>
          )}

        {selectedCidade &&
          !paroquiasLoading &&
          !paroquiasError &&
          paroquiasCidade.length > 0 && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Acesso</TableHead>
                    <TableHead>Paróquia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paroquiasCidade.map((paroquia) => (
                    <TableRow key={paroquia.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedIds.includes(paroquia.id)}
                          onChange={() => toggleSelecionada(paroquia.id)}
                        />
                      </TableCell>
                      <TableCell>{paroquia.descricao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {saveMessage && (
                <p className="text-sm text-green-600">{saveMessage}</p>
              )}
              {saveError && (
                <p className="text-sm text-red-600">{saveError}</p>
              )}

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

export default ParoquiasUsuario;
