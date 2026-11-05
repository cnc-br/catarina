"use client";

import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ITipoLocalidade } from "@/interfaces/ITipoLocalidade";
import { ILocalidade } from "@/interfaces/ILocalidade";

type LocalidadeFormProps = {
  urlBase: string;
  localidade?: ILocalidade;
};

export default function LocalidadeForm({
  urlBase,
  localidade,
}: LocalidadeFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [tipoLocalidade, setTipoLocalidade] = useState<ITipoLocalidade[]>();

  useEffect(() => {
    const fetchData = async () => {
      async function getTipoLocalidade() {
        const res = await fetch(
          `${urlBase}/api/ambrosio/configuracoes/tipoLocalidade`,
          {
            cache: "force-cache",
          }
        );
        return res.json();
      }

      try {
        const [dataLocalidade] = await Promise.all([getTipoLocalidade()]);

        setTipoLocalidade(dataLocalidade.data);
      } catch (error) {
        toast({
          title: `Erro ao buscar os Tipos de Localidade`,
          variant: "destructive",
          description: `Erro: ${error}`,
        });
        console.error(error);
      }
    };

    fetchData();
  }, [urlBase, toast]);

  const formSchema = z.object({
    descricao: z
      .string()
      .min(2, { message: "Nome deve ter no minimo 2 caracteres." })
      .max(50),
    tipoLocalidade: z.string({ message: "Campo obrigatório" }).min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: localidade?.descricao || "",
      tipoLocalidade: localidade?.tipoLocalidade?.id.toString() || "",
    },
  });

  if (!tipoLocalidade) {
    return (
      <div>
        <h2>Carregando ...</h2>
      </div>
    );
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    let url = `${urlBase}/api/ambrosio/configuracoes/localidade`;
    let method = "POST";

    if (localidade) {
      url = `${url}/${localidade.id}`;
      method = "PATCH";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    if (res.status === 201 && method === "POST") {
      toast({
        title: `${values.descricao}`,
        variant: "default",
        description: `Cadastrado(a) com sucesso!`,
      });
      router.push(`/dashboard/localidade/`);
    } else if (res.status === 200 && method === "PATCH") {
      toast({
        title: `${values.descricao}`,
        variant: "default",
        description: `Editada com sucesso!`,
      });
    } else {
      if (res.status === 400) {
        toast({
          title: `${values.descricao} não foi cadastrado!`,
          variant: "destructive",
          description: `Erro: ${data.message}`,
        });
      } else {
        toast({
          title: `${values.descricao} não foi cadastrado!`,
          variant: "destructive",
          description: `Erro: ${res.text}`,
        });
      }
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
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoLocalidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={localidade?.tipoLocalidade?.id.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipoLocalidade.map((es) => (
                      <SelectItem key={es.id} value={es.id.toString()}>
                        {es.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Salvar</Button>
        </form>
      </Form>
    </div>
  );
}
