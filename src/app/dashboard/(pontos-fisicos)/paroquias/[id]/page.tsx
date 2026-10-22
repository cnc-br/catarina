"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import ParoquiaForm from "@/components/custom/dashboard/paroquias/form-paroquia";
import LabelData from "@/components/custom/dashboard/pessoa/label-data";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/lib/utils";
import { ArrowUpRightIcon, TriangleAlertIcon } from "lucide-react";
import { Comunidade, Paroquia } from "neocatecumenal";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarParoquiaPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const paroquiaId = params.id;

  const [paroquia, setParoquia] = useState<Paroquia>();
  const [editar, setEditar] = useState<boolean>(false);
  const [redirectNotFound, setRedirectNotFound] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/ambrosio/paroquia/${paroquiaId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        toast({
          title: `Paróquia excluída`,
          variant: "default",
          description: `Paróquia excluída com sucesso!`,
        });
        router.push("/dashboard/paroquias");
        return;
      }

      let message = "Não foi possível excluir a paróquia.";
      try {
        const data = await res.json();
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Corpo vazio ou não-JSON: mantém a mensagem padrão
      }

      toast({
        title: `Paróquia não foi excluída!`,
        variant: "destructive",
        description: message,
      });
      setDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Erro de conexão",
        variant: "destructive",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
      });
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      async function getParoquia() {
        const res = await fetch(
          `${BASE_URL}/api/ambrosio/paroquia/${paroquiaId}`,
        );

        if (res.status === 404) {
          // TODO: esta dando erro no console log quando usa esse toast
          toast({
            title: `Paróquia não encontrada`,
            variant: "destructive",
            description: `Paróquia não encontrada. Tente novamente`,
          });
          setRedirectNotFound(true);
        }

        if (res.status === 401) {
          // TODO: esta dando erro no console log quando usa esse toast
          toast({
            title: `Sem permissão`,
            variant: "destructive",
            description: `Você não tem permissão para ver essa paróquia`,
          });
          setRedirectNotFound(true);
        }

        return res.json();
      }

      try {
        const [resParoquia] = await Promise.all([getParoquia()]);
        setParoquia(resParoquia);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast({
          title: `Erro ao buscar diocese`,
          variant: "destructive",
          description: `Erro: ${error}`,
        });
      }
    };

    fetchData();
  }, [paroquiaId, toast]);

  if (redirectNotFound) {
    router.push("/dashboard/paroquias");
  }

  if (!paroquia) {
    return <SkeletonLoading mensagem="Carregando paróquia ..." />;
  }

  return (
    <div>
      <PageSubtitle
        title={`Paróquia: ${paroquia.descricao}`}
        subTitle={`${paroquia.diocese.tipoDiocese.descricao}: ${paroquia.diocese.descricao}`}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/paroquias",
            buttonVariant: "outline",
            buttonShow: true,
          },
        ]}
      />

      {!editar && (
        <div>
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Paróquia {paroquia.descricao}</CardTitle>
                <CardDescription>
                  {paroquia.diocese.tipoDiocese.descricao} {" de "}
                  {paroquia.diocese.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LabelData
                  titulo="Setor"
                  descricao={`${paroquia.setor?.descricao || "Não informado"}`}
                />
                <LabelData
                  titulo="Cidade"
                  descricao={`${paroquia.endereco.cidade.nome} - ${paroquia.endereco.cidade.estado.sigla}`}
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="default">
                  <Link href={`/dashboard/comunidades/novo/${paroquia.id}`}>
                    Cadastrar comunidade
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setEditar(true)}>
                  Editar paróquia
                </Button>
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      Excluir paróquia
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir paróquia?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a paróquia{" "}
                        {paroquia.descricao}? Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={(event) => {
                          event.preventDefault();
                          handleDelete();
                        }}
                      >
                        {isDeleting ? "Excluindo..." : "Excluir"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
          <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4">
            {paroquia.comunidades
              ?.sort((a, b) => a.numeroDaComunidade - b.numeroDaComunidade)
              .map((comunidade: Comunidade) => (
                <Link
                  key={comunidade.id}
                  href={`/dashboard/comunidades/${comunidade.id}`}
                  aria-label={`Ver detalhes da comunidade ${comunidade.numeroDaComunidade}`}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card className="h-full border-t-4 border-t-primary/50 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-t-primary group-hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-3">
                        <span>Comunidade {comunidade.numeroDaComunidade}</span>
                        <ArrowUpRightIcon
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start gap-3">
                      <p className="text-sm text-muted-foreground">
                        {comunidade.quantidadeMembros} irmãos
                      </p>
                      {comunidade.etapaAtual?.descricao ? (
                        <Badge>{comunidade.etapaAtual.descricao}</Badge>
                      ) : (
                        <Badge variant="destructive">
                          Nenhuma etapa cadastrada.
                          <TriangleAlertIcon />
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}

      {editar && (
        <ParoquiaForm
          urlBase={BASE_URL}
          paroquia={paroquia}
          dioceseId={paroquia.diocese.id}
          dioceseNome={paroquia.diocese.descricao}
        />
      )}
    </div>
  );
}
