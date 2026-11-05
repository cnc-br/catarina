"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Comunidade, Paroquia } from "neocatecumenal";
import { NAO_FOI_CADASTRADO } from "@/constants";

type PessoaComunidadeProps = {
  pessoaId: number;
  triggerClassName?: string;
  onComunidadeVinculada?: () => void;
};

const getParoquiaLabel = (paroquia: Paroquia) => {
  const nomeParoquia = paroquia.descricao || "Paroquia sem nome";
  const cidade = paroquia.endereco?.cidade?.nome || "Cidade nao informada";

  return `${nomeParoquia} (${cidade} / ${paroquia.endereco?.cidade?.estado?.sigla || "UF nao informada"})`;
};

function renderResultadoComunidade(comunidadeEncontrada: Comunidade) {
  const etapaDaComunidade =
    comunidadeEncontrada.etapaAtual?.descricao || NAO_FOI_CADASTRADO;
  const responsavel =
    comunidadeEncontrada.carismas
      ?.find((carisma) => carisma.descricao === "Responsável")
      ?.pessoas?.[0]?.nome || NAO_FOI_CADASTRADO;

  return (
    <div className="space-y-1 font-light">
      <p>
        Comunidade <strong>{comunidadeEncontrada.numeroDaComunidade}</strong> da
        paróquia{" "}
        <strong>{getParoquiaLabel(comunidadeEncontrada.paroquia)}</strong>!
      </p>
      <p>
        Essa comunidade possui{" "}
        <strong>{comunidadeEncontrada.quantidadeMembros || 0} irmãos</strong> e
        está na etapa <strong>{etapaDaComunidade}</strong>.
      </p>
      <p>
        Responsável: <strong>{responsavel}</strong>
      </p>
    </div>
  );
}

export default function PessoaComunidade({
  pessoaId,
  triggerClassName,
  onComunidadeVinculada,
}: PessoaComunidadeProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [numeroComunidade, setNumeroComunidade] = useState("");
  const [paroquiaId, setParoquiaId] = useState("");
  const [resultadoPesquisa, setResultadoPesquisa] = useState<ReactNode>("");
  const [paroquias, setParoquias] = useState<Paroquia[]>([]);
  const [loadingParoquias, setLoadingParoquias] = useState(false);
  const [loadingPesquisa, setLoadingPesquisa] = useState(false);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [comunidade, setComunidade] = useState<Comunidade | null>(null);

  useEffect(() => {
    const getParoquias = async () => {
      setLoadingParoquias(true);

      try {
        const res = await fetch("/api/ambrosio/paroquia", {
          credentials: "include",
        });
        const data = await res.json();

        const lista = Array.isArray(data?.data) ? data.data : [];
        const ordenadas = [...lista].sort((a: Paroquia, b: Paroquia) =>
          getParoquiaLabel(a).localeCompare(getParoquiaLabel(b), "pt-BR", {
            sensitivity: "base",
          }),
        );

        setParoquias(ordenadas);
      } catch (error) {
        console.error("Erro ao listar paroquias", error);
        setParoquias([]);
      } finally {
        setLoadingParoquias(false);
      }
    };

    getParoquias();
  }, []);

  const resetForm = () => {
    setNumeroComunidade("");
    setParoquiaId("");
    setResultadoPesquisa("");
    setComunidade(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const handlePesquisar = async () => {
    const paroquiaSelecionada = paroquias.find(
      (paroquia) => String(paroquia.id) === paroquiaId,
    );

    if (!numeroComunidade || !paroquiaSelecionada) {
      setComunidade(null);
      setResultadoPesquisa(
        "Preencha o numero da comunidade e selecione uma paroquia.",
      );
      return;
    }

    setLoadingPesquisa(true);

    try {
      const res = await fetch(
        `/api/ambrosio/comunidade?paroquiaId=${paroquiaId}&numeroDaComunidade=${numeroComunidade}`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();

      const comunidadeEncontrada: Comunidade | null = Array.isArray(data?.data)
        ? data.data[0]
        : data?.data;

      if (res.ok && comunidadeEncontrada) {
        setComunidade(comunidadeEncontrada);
        setResultadoPesquisa(renderResultadoComunidade(comunidadeEncontrada));
      } else {
        setComunidade(null);
        setResultadoPesquisa(
          "Comunidade nao encontrada para os filtros informados.",
        );
      }
    } catch (error) {
      console.error("Erro ao pesquisar comunidade", error);
      setComunidade(null);
      setResultadoPesquisa("Erro ao pesquisar comunidade. Tente novamente.");
    } finally {
      setLoadingPesquisa(false);
    }
  };

  const handleSalvar = async () => {
    if (!comunidade) return;

    setLoadingSalvar(true);

    try {
      const res = await fetch(
        `/api/ambrosio/comunidade/${comunidade.id}/pessoa/${pessoaId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erro ao vincular pessoa na comunidade",
          description: data?.message || "Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vinculo realizado",
        description: "Pessoa vinculada a comunidade com sucesso.",
      });

      setOpen(false);
      resetForm();
      onComunidadeVinculada?.();
    } catch (error) {
      console.error("Erro ao salvar vinculo de comunidade", error);
      toast({
        title: "Erro ao vincular pessoa na comunidade",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingSalvar(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          Informar comunidade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Informar a comunidade</DialogTitle>
          <DialogDescription>
            Informe o numero da comunidade e a paróquia para pesquisar. Depois,
            clique em salvar para vincular a comunidade à pessoa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="numero-comunidade">Numero da comunidade</Label>
            <Input
              id="numero-comunidade"
              type="number"
              min={1}
              step={1}
              placeholder="Digite um numero inteiro"
              value={numeroComunidade}
              onChange={(event) => setNumeroComunidade(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paroquia">Paroquia</Label>
            <Select value={paroquiaId} onValueChange={setParoquiaId}>
              <SelectTrigger id="paroquia" className="w-full">
                <SelectValue
                  placeholder={
                    loadingParoquias
                      ? "Carregando paroquias..."
                      : "Selecione uma paroquia"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {paroquias.map((paroquia) => (
                  <SelectItem key={paroquia.id} value={String(paroquia.id)}>
                    {getParoquiaLabel(paroquia)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handlePesquisar}
            disabled={loadingPesquisa}
          >
            Pesquisar
          </Button>

          {resultadoPesquisa ? (
            <Alert className="bg-muted/40">
              {typeof resultadoPesquisa === "string" ? (
                <AlertDescription>{resultadoPesquisa}</AlertDescription>
              ) : (
                resultadoPesquisa
              )}
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSalvar}
            disabled={!comunidade || loadingSalvar}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
