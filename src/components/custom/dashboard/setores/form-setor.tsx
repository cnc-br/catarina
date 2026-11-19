"use client";

import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Setor, Regiao } from "neocatecumenal";
import { SkeletonLoading } from "../../ui/SkeletonLoading";

type FormSetorProps = {
  urlBase: string;
  setor?: Setor;
};

const formSchema = z.object({
  descricao: z
    .string({ message: "Nome do setor é obrigatório" })
    .trim()
    .min(2, { message: "Nome do setor deve ter no mínimo 2 caracteres." })
    .max(50, { message: "Tamanho máximo é 50 caracteres." }),
  regiaoId: z
    .string({ message: "Campo obrigatório" })
    .min(1, { message: "Selecione a região ..." }),
  ativo: z.boolean(),
});

export default function SetorForm({ urlBase, setor }: FormSetorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [carregandoRegioes, setCarregandoRegioes] = useState(true);
  const [erroRegioes, setErroRegioes] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const getRegioes = async () => {
      try {
        const res = await fetch(`${urlBase}/api/ambrosio/regiao`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar regiões");
        }

        const data = await res.json();
        setRegioes(data.data ?? []);
        setErroRegioes(null);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error(error);
        setErroRegioes("Não foi possível carregar as regiões.");
      } finally {
        setCarregandoRegioes(false);
      }
    };

    getRegioes();

    return () => controller.abort();
  }, [urlBase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: setor?.descricao ?? "",
      regiaoId: setor?.regiao?.id ? setor.regiao.id.toString() : "",
      ativo: setor?.ativo ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const editando = Boolean(setor);
    const url = editando
      ? `${urlBase}/api/ambrosio/setor/${setor?.id}`
      : `${urlBase}/api/ambrosio/setor`;

    try {
      const res = await fetch(url, {
        method: editando ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast({
          title: values.descricao,
          variant: "default",
          description: editando
            ? "Setor editado com sucesso!"
            : "Setor cadastrado com sucesso!",
        });
        router.push("/dashboard/setores");
        return;
      }

      if (res.status === 401 || res.status === 403) {
        toast({
          title: `Sem permissão - ${res.status}`,
          variant: "default",
          description: `Você não tem permissão para ${
            editando ? "editar" : "cadastrar"
          } setor`,
        });
      } else {
        toast({
          title: `${values.descricao} não foi ${editando ? "editado" : "cadastrado"}!`,
          variant: "destructive",
          description: `Erro: ${data?.message ?? "Tente novamente."}`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro de conexão",
        variant: "destructive",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (carregandoRegioes) {
    return <SkeletonLoading mensagem="Carregando regiões ..." />;
  }

  return (
    <div className="max-w-md mx-auto sm:mt-8">
      {erroRegioes && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erro ao carregar regiões</AlertTitle>
          <AlertDescription>{erroRegioes}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do setor ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regiaoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Região</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regioes.map((regiao) => (
                      <SelectItem key={regiao.id} value={regiao.id.toString()}>
                        {regiao.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="text-base">Ativo</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
