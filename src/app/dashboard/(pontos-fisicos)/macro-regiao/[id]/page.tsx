"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import MacroRegiaoForm from "@/components/custom/dashboard/macro-regioes/form-macro-regiao";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/lib/utils";
import { MacroRegiao } from "neocatecumenal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarMacroRegiaoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const macroRegiaoId = String(params.id);
  const [macroRegiao, setMacroRegiao] = useState<MacroRegiao>();
  const [carregandoMacroRegiao, setCarregandoMacroRegiao] = useState(true);

  useEffect(() => {
    let ativo = true;

    const carregarMacroRegiao = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/ambrosio/macro-regiao/${macroRegiaoId}`,
        );
        const data = await res.json().catch(() => null);

        if (!ativo) {
          return;
        }

        if (res.status === 404) {
          toast({
            title: "Macro região não encontrada",
            variant: "destructive",
            description: "A macro região informada não existe.",
          });
          router.push("/dashboard/macro-regiao");
          return;
        }

        if (res.status === 401 || res.status === 403) {
          toast({
            title: "Sem permissão",
            variant: "destructive",
            description:
              "Você não tem permissão para acessar essa macro região.",
          });
          router.push("/dashboard/macro-regiao");
          return;
        }

        if (!res.ok) {
          toast({
            title: "Erro ao carregar macro região",
            variant: "destructive",
            description: data?.message ?? "Tente novamente.",
          });
          router.push("/dashboard/macro-regiao");
          return;
        }

        setMacroRegiao(data);
      } catch (error) {
        if (!ativo) {
          return;
        }
        console.error(error);
        toast({
          title: "Erro de conexão",
          variant: "destructive",
          description:
            "Não foi possível conectar ao servidor. Tente novamente.",
        });
        router.push("/dashboard/macro-regiao");
      } finally {
        if (ativo) {
          setCarregandoMacroRegiao(false);
        }
      }
    };

    carregarMacroRegiao();

    return () => {
      ativo = false;
    };
  }, [macroRegiaoId, router, toast]);

  if (carregandoMacroRegiao) {
    return <SkeletonLoading mensagem="Carregando macro região ..." />;
  }

  if (!macroRegiao) {
    return <SkeletonLoading mensagem="Carregando macro região ..." />;
  }

  return (
    <div>
      <PageSubtitle
        title={`Macro Região: ${macroRegiao.descricao}`}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/macro-regiao",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <MacroRegiaoForm urlBase={BASE_URL} macroRegiao={macroRegiao} />
    </div>
  );
}
