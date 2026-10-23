"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/user-provider";
import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import LabelData from "@/components/custom/dashboard/pessoa/label-data";
import UnauthorizedAccessAlert from "@/components/custom/ui/AlertSemCadastroOuPermissao";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import {
  FormUsuario,
} from "@/components/custom/dashboard/usuarios/form-usuario";
import { ParoquiasUsuario } from "@/components/custom/dashboard/usuarios/paroquias-usuario";
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
import { useToast } from "@/components/ui/use-toast";
import { ROLE_ADMIN } from "@/constants";
import { User } from "neocatecumenal";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

const ROUTE_LIST = "/dashboard/usuarios";

const formatPhone = (whatsapp?: string | null) => {
  if (!whatsapp) return "—";
  if (whatsapp.length === 11) {
    return `(${whatsapp.substring(0, 2)}) ${whatsapp.substring(
      2,
      7,
    )}-${whatsapp.substring(7)}`;
  }
  if (whatsapp.length === 10) {
    return `(${whatsapp.substring(0, 2)}) ${whatsapp.substring(
      2,
      6,
    )}-${whatsapp.substring(6)}`;
  }
  return whatsapp;
};

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
};

export default function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ambrosio/user/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Usuário excluído",
          variant: "default",
          description: "Usuário excluído com sucesso!",
        });
        router.push(ROUTE_LIST);
        return;
      }

      let message = "Não foi possível excluir o usuário.";
      try {
        const data = await response.json();
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Corpo vazio ou não-JSON: mantém a mensagem padrão
      }

      toast({
        title: "Usuário não foi excluído!",
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
    const controller = new AbortController();

    const fetchUsuario = async () => {
      try {
        const response = await fetch(`/api/ambrosio/user/${id}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          router.push(ROUTE_LIST);
          return;
        }

        if (!response.ok) {
          throw new Error("Erro ao carregar usuário");
        }

        const data = (await response.json()) as User;
        console.log("Fetched user data:", data);
        setUsuario(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUsuario();
    return () => controller.abort();
  }, [id, router, refreshKey]);

  if (user?.role !== ROLE_ADMIN) {
    return <UnauthorizedAccessAlert title="Usuários" />;
  }

  if (loading) {
    return <SkeletonLoading mensagem="Carregando usuário ..." />;
  }

  if (!usuario) {
    return null;
  }

  const isSelfUser = user != null && String(user.id) === String(usuario.id);

  return (
    <div>
      <PageSubtitle
        title={`Editar ${usuario.pessoa?.nome || usuario.email}`}
        subTitle={`Perfil do usuário: ${usuario.role}`}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: ROUTE_LIST,
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />


      {!usuario.pessoa && (
        <div className="mt-2 mb-6 w-full">
          <Alert variant="destructive" >
            <AlertCircleIcon />
            <AlertTitle>Usuario sem pessoa associada - Sera removido em breve!</AlertTitle>
            <AlertDescription>
              Esse usuario nao tem uma pessoa associada. Todo usuário precisa estar numa comunidade e ter uma pessoa associada. Para associar uma pessoa a esse usuário, você precisa criar uma pessoa e depois associar a pessoa ao usuário.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3 items-start">

        <div className="lg:col-span-1">
          {!isEditing && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">{usuario.pessoa?.nome || usuario.email}</CardTitle>
                <CardDescription>Dados do usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <LabelData titulo="Email" descricao={usuario.email} />
                <LabelData
                  titulo="WhatsApp"
                  descricao={formatPhone(usuario.whatsapp)}
                />
                <LabelData titulo="Role" descricao={usuario.role} />
                <LabelData
                  titulo="Criado em"
                  descricao={formatDate(usuario.createdAt)}
                />
                <div className="pt-1">
                  <span className="font-extrabold">Paróquias: </span>
                  {usuario.paroquias?.length ? (
                    <ul className="mt-1 space-y-0.5">
                      {usuario.paroquias.map((paroquia) => (
                        <li key={paroquia.id} className="text-sm">
                          {paroquia.descricao}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Nenhuma paróquia atribuída
                    </span>
                  )}
                </div>
                <div className="pt-3">
                  <span>Status: </span>
                  <Badge variant={usuario.active ? "default" : "destructive"}>
                    {usuario.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Button className="w-1/2" onClick={() => setIsEditing(true)}>
                    Editar dados
                  </Button>
                  {usuario.pessoaId ? (
                    <Button variant="secondary" className="w-1/2" asChild>
                      <Link href={`/dashboard/pessoas/${usuario.pessoaId}`}>Conferir pessoa</Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-1/2" disabled>
                      Conferir pessoa
                    </Button>
                  )}
                </div>
                {!isSelfUser && (
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isDeleting}
                      >
                        Excluir usuário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o usuário{" "}
                          {usuario.pessoa?.nome || usuario.email}? Essa ação não
                          pode ser desfeita.
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
                )}
              </CardFooter>
            </Card>
          )}

          {isEditing && (
            <FormUsuario
              user={usuario}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => router.push(ROUTE_LIST)}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          <ParoquiasUsuario
            userId={id}
            paroquias={usuario.paroquias}
            onSalvo={() => setRefreshKey((key) => key + 1)}
          />
        </div>
      </div>
    </div>
  );
}
