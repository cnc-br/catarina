"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { Carisma, Pessoa, TipoCarismaEnum } from "neocatecumenal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { BASE_URL } from "@/lib/utils";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";

interface CarismaData {
  primitivo: Carisma[];
  vinculado: Carisma[];
  servico: Carisma[];
}

interface CarismaGridProps {
  title: string;
  carismas: Carisma[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

function CarismaGrid({
  title,
  carismas,
  selectedIds,
  onToggle,
}: CarismaGridProps) {
  const isSelected = (id: number) => selectedIds.includes(id);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">
        {title} ({carismas.length})
      </h2>
      {carismas.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum carisma disponível
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {carismas.map((c) => (
            <div
              key={c.id}
              onClick={() => onToggle(c.id)}
              className={`border rounded-lg p-4 cursor-pointer flex items-center justify-between transition-colors ${
                isSelected(c.id)
                  ? "bg-blue-100 border-blue-500 dark:bg-blue-950"
                  : "bg-white hover:bg-gray-50 dark:bg-slate-950"
              }`}
            >
              <div className="flex-1">
                <span className="font-medium text-sm block">{c.descricao}</span>
                {c.casalAndaJunto && (
                  <span className="text-xs text-muted-foreground">
                    Casal anda junto
                  </span>
                )}
              </div>
              {isSelected(c.id) && (
                <CheckIcon className="text-blue-500 shrink-0 ml-2" size={18} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PessoaCarismaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const pessoaId = params.id as string;

  const [carismaData, setCarismaData] = useState<CarismaData>({
    primitivo: [],
    vinculado: [],
    servico: [],
  });
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Buscar carismas disponíveis (agora em uma única rota)
        const urlBase = BASE_URL + "/api/ambrosio/configuracoes/carismas";
        const resCarismas = await fetch(urlBase);
        const dataCarismas = await resCarismas.json();

        // Separar por tipo
        const todosCarismas = dataCarismas.data || [];
        const primitivos = todosCarismas.filter(
          (c: Carisma) => c.tipo === TipoCarismaEnum.PRIMITIVO,
        );
        const vinculados = todosCarismas.filter(
          (c: Carisma) => c.tipo === TipoCarismaEnum.VINCULADO,
        );
        const servicos = todosCarismas.filter(
          (c: Carisma) => c.tipo === TipoCarismaEnum.SERVICO,
        );

        setCarismaData({
          primitivo: primitivos,
          vinculado: vinculados,
          servico: servicos,
        });

        // Buscar pessoa
        const resPessoa = await fetch(
          `${BASE_URL}/api/ambrosio/pessoa/${pessoaId}`,
        );
        if (!resPessoa.ok) throw new Error("Erro ao buscar pessoa");
        const pessoaData = await resPessoa.json();

        setPessoa(pessoaData);
        // Carismas já vêm em um único array com tipo
        const selectedCarismas = (pessoaData.carismas || []).map(
          (c: Carisma) => c.id,
        );
        setSelectedIds(selectedCarismas);
      } catch (error) {
        toast({
          title: "Erro",
          variant: "destructive",
          description: "Erro ao carregar dados",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pessoaId, toast]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const salvar = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "Atenção",
        variant: "destructive",
        description: "Selecione pelo menos um carisma",
      });
      return;
    }

    setLoading(true);

    const payload = {
      carismaIds: selectedIds,
    };

    try {
      const res = await fetch(
        `${BASE_URL}/api/ambrosio/pessoa/${pessoa?.id}/carismas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        toast({
          title: "Sucesso",
          description: "Carismas atualizados com sucesso",
        });
        router.push(`/dashboard/pessoas/${pessoa?.id}`);
      } else {
        const resData = await res.json();
        toast({
          title: "Erro",
          variant: "destructive",
          description: `Erro ao atualizar carismas. ${resData.message || ""}`,
        });
      }
    } catch {
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Erro ao conectar",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoading mensagem="Carregando carismas ..." />;
  }

  if (!pessoa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Pessoa não encontrada</p>
      </div>
    );
  }

  return (
    <div>
      <PageSubtitle
        title={`Adicionar carismas de ${pessoa.nome}`}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: `/dashboard/pessoas/${pessoa.id}`,
            buttonShow: true,
          },
        ]}
      />

      <div className="p-4 max-w-4xl mx-auto">
        <CarismaGrid
          title="Carismas Primitivos"
          carismas={carismaData.primitivo}
          selectedIds={selectedIds}
          onToggle={toggle}
        />
        <Separator className="my-6" />
        <CarismaGrid
          title="Carismas Vinculados"
          carismas={carismaData.vinculado}
          selectedIds={selectedIds}
          onToggle={toggle}
        />
        <Separator className="my-6" />
        <CarismaGrid
          title="Carismas de Serviço"
          carismas={carismaData.servico}
          selectedIds={selectedIds}
          onToggle={toggle}
        />
        <Separator className="my-6" />

        <div className="flex gap-2">
          <Button onClick={salvar} disabled={loading} size="lg">
            {loading ? "Salvando..." : "Confirmar carismas"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/dashboard/pessoas/${pessoa.id}`)}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold mb-2">Resumo:</h3>
            <p className="text-sm">
              <strong>{selectedIds.length}</strong> carisma(s) selecionado(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
