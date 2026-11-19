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
import { Regiao, MacroRegiao } from "neocatecumenal";
import { SkeletonLoading } from "../../ui/SkeletonLoading";

type FormRegiaoProps = {
  urlBase: string;
  regiao?: Regiao;
};

const formSchema = z.object({
  descricao: z
    .string({ message: "Nome da região é obrigatório" })
    .trim()
    .min(2, { message: "Nome da região deve ter no mínimo 2 caracteres." })
    .max(100, { message: "Tamanho máximo é 100 caracteres." }),
  macroRegiaoId: z
    .string({ message: "Campo obrigatório" })
    .min(1, { message: "Selecione a macro região ..." }),
  ativo: z.boolean(),
});

export default function RegiaoForm({ urlBase, regiao }: FormRegiaoProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [macroRegioes, setMacroRegioes] = useState<MacroRegiao[]>([]);
  const [carregandoMacroRegioes, setCarregandoMacroRegioes] = useState(true);
  const [erroMacroRegioes, setErroMacroRegioes] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const getMacroRegioes = async () => {
      try {
        const res = await fetch(`${urlBase}/api/ambrosio/macro-regiao`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar macro regiões");
        }

        const data = await res.json();
        setMacroRegioes(data.data ?? []);
        setErroMacroRegioes(null);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error(error);
        setErroMacroRegioes("Não foi possível carregar as macro regiões.");
      } finally {
        setCarregandoMacroRegioes(false);
      }
    };

    getMacroRegioes();

    return () => controller.abort();
  }, [urlBase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: regiao?.descricao ?? "",
      macroRegiaoId: regiao?.macroRegiao?.id
        ? regiao.macroRegiao.id.toString()
        : "",
      ativo: regiao?.ativo ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const editando = Boolean(regiao);
    const url = editando
      ? `${urlBase}/api/ambrosio/regiao/${regiao?.id}`
      : `${urlBase}/api/ambrosio/regiao`;

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
            ? "Região editada com sucesso!"
            : "Região cadastrada com sucesso!",
        });
        router.push("/dashboard/regioes");
        return;
      }

      if (res.status === 401 || res.status === 403) {
        toast({
          title: `Sem permissão - ${res.status}`,
          variant: "default",
          description: `Você não tem permissão para ${
            editando ? "editar" : "cadastrar"
          } região`,
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

  if (carregandoMacroRegioes) {
    return <SkeletonLoading mensagem="Carregando macro regiões ..." />;
  }

  return (
    <div className="max-w-md mx-auto sm:mt-8">
      {erroMacroRegioes && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erro ao carregar macro regiões</AlertTitle>
          <AlertDescription>{erroMacroRegioes}</AlertDescription>
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
                  <Input placeholder="Nome da região ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="macroRegiaoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Macro Região</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {macroRegioes.map((macroRegiao) => (
                      <SelectItem
                        key={macroRegiao.id}
                        value={macroRegiao.id.toString()}
                      >
                        {macroRegiao.descricao}
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
