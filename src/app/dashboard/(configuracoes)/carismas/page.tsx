"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import ListagemDeCarismas from "@/components/custom/dashboard/carismas/ListagemDeCarimas";
import { CarismaEditDialog } from "@/components/custom/dashboard/carismas/CarismaEditDialog";
import { useEffect, useState } from "react";
import { Carisma, TipoCarismaEnum } from "neocatecumenal";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface SituacaoReligiosa {
  id: number;
  descricao: string;
}

export default function CarismasPage() {
  const [carismas, setCarismas] = useState<Carisma[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [carismaEmEdicao, setCarismaEmEdicao] = useState<Carisma | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  useEffect(() => {
    let ativo = true;

    const fetchCarismas = async () => {
      try {
        const res = await fetch(`/api/ambrosio/configuracoes/carismas`);
        const data = await res.json();
        if (ativo) {
          setCarismas(data.data || []);
        }
      } catch {
        if (ativo) {
          setCarismas([]);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    fetchCarismas();

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const situacoesReligiosas: SituacaoReligiosa[] = [
    { id: 1, descricao: "Leigo" },
    { id: 2, descricao: "Seminarista" },
    { id: 3, descricao: "Religioso(a)" },
    { id: 4, descricao: "Diácono" },
    { id: 5, descricao: "Diácono Permanente" },
    { id: 6, descricao: "Presbítero" },
    { id: 7, descricao: "Bispo" },
    { id: 8, descricao: "Arcebispo" },
    { id: 9, descricao: "Cardeal" },
    { id: 10, descricao: "Papa" },
  ];

  if (loading) {
    return <SkeletonLoading mensagem="Carregando carismas cadastrados ..." />;
  }

  // Agrupar carismas por tipo
  const carismasPorTipo: { [key: string]: Carisma[] } = {
    Primitivos: carismas.filter((c) => c.tipo === TipoCarismaEnum.PRIMITIVO),
    Vinculados: carismas.filter((c) => c.tipo === TipoCarismaEnum.VINCULADO),
    Serviços: carismas.filter((c) => c.tipo === TipoCarismaEnum.SERVICO),
  };

  const handleEditar = (carisma: Carisma) => {
    setCarismaEmEdicao(carisma);
    setDialogAberto(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogAberto(open);
    if (!open) {
      setCarismaEmEdicao(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageSubtitle
        title="Carismas"
        subTitle="Primitivos, Serviços, Vinculados e Situações Religiosas"
      />

      <div>
        <Alert>
          <Terminal />
          <AlertTitle>Observação</AlertTitle>
          <AlertDescription>
            Há carismas que o casal são automaticamente vinculados. Esses estão
            marcados com &apos;Casal anda junto&apos;.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(carismasPorTipo).map(([tipo, carismasDoTipo]) => (
          <div key={tipo}>
            <ListagemDeCarismas
              carismas={carismasDoTipo}
              descricao={tipo}
              onEdit={handleEditar}
            />
          </div>
        ))}

        {/* Situações Religiosas */}
        <div>
          <ListagemDeCarismas
            carismas={situacoesReligiosas.map((s) => ({
              id: s.id,
              descricao: s.descricao,
              tipo: TipoCarismaEnum.PRIMITIVO, // fake
              casalAndaJunto: false,
            }))}
            descricao="Situações Religiosas"
          />
        </div>
      </div>

      <CarismaEditDialog
        carisma={carismaEmEdicao}
        open={dialogAberto}
        onOpenChange={handleDialogOpenChange}
        onSuccess={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
}
