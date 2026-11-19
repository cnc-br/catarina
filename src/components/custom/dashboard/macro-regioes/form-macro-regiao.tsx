"use client";

import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MacroRegiao } from "neocatecumenal";

type FormMacroRegiaoProps = {
  urlBase: string;
  macroRegiao?: MacroRegiao;
};

const formSchema = z.object({
  descricao: z
    .string({ message: "Nome da macro região é obrigatório" })
    .trim()
    .min(2, { message: "Nome da macro região deve ter no mínimo 2 caracteres." })
    .max(50, { message: "Tamanho máximo é 50 caracteres." }),
  ativo: z.boolean(),
});

export default function MacroRegiaoForm({
  urlBase,
  macroRegiao,
}: FormMacroRegiaoProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: macroRegiao?.descricao ?? "",
      ativo: macroRegiao?.ativo ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const editando = Boolean(macroRegiao);
    const url = editando
      ? `${urlBase}/api/ambrosio/macro-regiao/${macroRegiao?.id}`
      : `${urlBase}/api/ambrosio/macro-regiao`;

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
            ? "Macro região editada com sucesso!"
            : "Macro região cadastrada com sucesso!",
        });
        router.push("/dashboard/macro-regiao");
        return;
      }

      if (res.status === 401 || res.status === 403) {
        toast({
          title: `Sem permissão - ${res.status}`,
          variant: "default",
          description: `Você não tem permissão para ${
            editando ? "editar" : "cadastrar"
          } macro região`,
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

  return (
    <div className="max-w-md mx-auto sm:mt-8">
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
                  <Input placeholder="Nome da macro região ..." {...field} />
                </FormControl>
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
