"use client";

import DioceseForm from "@/components/custom/dashboard/diocese/form-diocese";
import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import LabelData from "@/components/custom/dashboard/pessoa/label-data";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/lib/utils";
import { Diocese, Paroquia } from "neocatecumenal";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarDiocesePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const dioceseId = params.id;

  const [diocese, setDiocese] = useState<Diocese>();
  const [paroquias, setParoquias] = useState<Paroquia[]>([]);
  const [editar, setEditar] = useState<boolean>(false);
  const [redirectNotFound, setRedirectNotFound] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      async function getDiocese() {
        const res = await fetch(
          `${BASE_URL}/api/ambrosio/diocese/${dioceseId}`,
        );

        if (res.status === 404) {
          // TODO: esta dando erro no console log quando usa esse toast
          toast({
            title: `Diocese não encontrada`,
            variant: "destructive",
            description: `Diocese não encontrada. Tente novamente`,
          });
          setRedirectNotFound(true);
        }

        if (res.status === 401) {
          // TODO: esta dando erro no console log quando usa esse toast
          toast({
            title: `Sem permissão`,
            variant: "destructive",
            description: `Você não tem permissão para ver essa diocese`,
          });
          setRedirectNotFound(true);
        }

        return res.json();
      }

      try {
        const [resDiocese] = await Promise.all([getDiocese()]);
        setDiocese(resDiocese);
      } catch (error) {
        toast({
          title: `Erro ao buscar diocese`,
          variant: "destructive",
          description: `Erro: ${error}`,
        });
      }
    };

    fetchData();
  }, [dioceseId, toast]);

  useEffect(() => {
    const fetchParoquias = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/ambrosio/paroquia?dioceseId=${dioceseId}`,
        );
        if (!res.ok) {
          throw new Error("Erro ao buscar paróquias");
        }
        const data = await res.json();
        setParoquias(data.data);
      } catch (error) {
        toast({
          title: "Erro ao buscar paróquias",
          variant: "destructive",
          description: String(error),
        });
      }
    };

    if (dioceseId) {
      fetchParoquias();
    }
  }, [dioceseId, toast]);

  if (redirectNotFound) {
    router.push("/dashboard/dioceses");
  }

  if (!diocese) {
    return <SkeletonLoading mensagem="Buscando dados da diocese ..." />;
  }

  return (
    <div>
      <PageSubtitle
        title={`Editar ${diocese.descricao}`}
        subTitle={diocese.tipoDiocese.descricao}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/dioceses",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      {!editar && (
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{diocese.descricao}</CardTitle>
              <CardDescription>{diocese.tipoDiocese.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <LabelData
                titulo="Cidade"
                descricao={`${diocese.endereco.cidade.nome} - ${diocese.endereco.cidade.estado.sigla}`}
              />
              <LabelData
                titulo="Tipo"
                descricao={`${diocese.tipoDiocese.descricao}`}
              />
            </CardContent>
            <CardFooter className="space-x-2">
              <Button onClick={() => setEditar(!editar)}>Editar dados</Button>
              <Button
                onClick={() =>
                  router.push(
                    `/dashboard/paroquias/novo?dioceseId=${dioceseId}`,
                  )
                }
                variant="outline"
              >
                Cadastrar paroquias
              </Button>
            </CardFooter>
          </Card>
          <Separator className="my-4" />
          <Card>
            <CardHeader>
              <CardTitle>Paróquias {paroquias.length}</CardTitle>
            </CardHeader>
            <CardContent>
              {paroquias.length === 0 ? (
                <p>Nenhuma paróquia cadastrada.</p>
              ) : (
                <ul className="space-y-2">
                  {paroquias.map((paroquia) => (
                    <Link
                      key={paroquia.id}
                      href={`/dashboard/paroquias/${paroquia.id}`}
                    >
                      <li className="border p-2 rounded hover:bg-slate-200 transition mb-1">
                        <div className="font-semibold">
                          {paroquia.descricao}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {paroquia.id} - Cidade:{" "}
                          {paroquia.endereco?.cidade?.nome} -{" "}
                          {paroquia.endereco?.cidade?.estado?.sigla}
                        </div>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {editar && <DioceseForm urlBase={BASE_URL} diocese={diocese} />}
    </div>
  );
}
