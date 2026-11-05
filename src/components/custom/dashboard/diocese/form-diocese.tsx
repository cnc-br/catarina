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
import { Separator } from "@/components/ui/separator";
import { Diocese, TipoDiocese } from "neocatecumenal";
import { SkeletonLoading } from "../../ui/SkeletonLoading";
import { useCepHandler } from "@/hooks/useCepHandler";
import { addressSchema } from "@/schemas/addressSchema";
import { CepField } from "@/components/custom/form-fields/CepField";

type FormDioceseProps = {
  urlBase: string;
  diocese?: Diocese;
};

export default function DioceseForm({ urlBase, diocese }: FormDioceseProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [tipoDiocese, setTipoDiocese] = useState<TipoDiocese[]>();
  const [bairroDisabled, setBairroDisabled] = useState(true);
  const [cidadeDisabled, setCidadeDisabled] = useState(true);
  const [logradouroDisabled, setLogradouroDisabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      async function getTipoDiocese() {
        const res = await fetch(
          `${urlBase}/api/ambrosio/configuracoes/tipoDiocese`
        );
        return res.json();
      }

      try {
        const [dataTipoDiocese] = await Promise.all([getTipoDiocese()]);

        setTipoDiocese(dataTipoDiocese.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [urlBase]);

  const formSchema = z
    .object({
      descricao: z
        .string({ message: "Nome da diocese é obrigatório" })
        .min(2, { message: "Nome da diocese deve ter no minimo 2 caracteres." })
        .max(50, { message: "Tamanho máximo é 50 caracteres." }),
      tipoDiocese: z.string({ message: "Campo obrigatório" }).min(1, {
        message: "Selecione o tipo de diocese...",
      }),
      enderecoId: z.string().optional(),
    })
    .merge(addressSchema);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: diocese?.descricao || "",
      tipoDiocese: diocese?.tipoDiocese.id.toString() || "",
      enderecoId: diocese?.endereco.id.toString() || "",
      cep: diocese?.endereco.cep || "",
      bairro: diocese?.endereco.bairro || "",
      cidade: diocese?.endereco.cidade.nome || "",
      numero: diocese?.endereco.numero || "",
      logradouro: diocese?.endereco.logradouro || "",
      uf: diocese?.endereco.cidade.estado.sigla || "",
    },
  });

  const handleCep = useCepHandler({
    form,
    setBairroDisabled,
    setLogradouroDisabled,
    setCidadeDisabled,
  });

  if (!tipoDiocese) {
    return <SkeletonLoading mensagem="Carregando tipos de diocese ..." />;
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    let url = `${urlBase}/api/ambrosio/diocese`;
    let method = "POST";

    if (diocese) {
      url = `${url}/${diocese.id}`;
      method = "PATCH";
    }

    try {
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
        router.push(`/dashboard/dioceses/`);
        return;
      } else if (res.status === 200 && method === "PATCH") {
        toast({
          title: `${values.descricao}`,
          variant: "default",
          description: `Editada com sucesso!`,
        });
      } else {
        let acao = "cadastrado";
        if (method === "PATCH") {
          acao = "editado";
        }

        if (res.status === 400 || res.status === 404) {
          toast({
            title: `${values.descricao} não foi ${acao}!`,
            variant: "destructive",
            description: `Erro: ${data.message}`,
          });
        } else if (res.status === 401 || res.status === 403) {
          toast({
            title: `Sem permissão - ${res.status}`,
            variant: "default",
            description: `Você não tem permissão para ${
              method === "POST" ? "cadastrar" : "editar"
            } diocese`,
          });
        } else {
          toast({
            title: `${values.descricao} não foi ${acao}!`,
            variant: "destructive",
            description: `Erro: ${res.text}`,
          });
        }
      }
    } catch (error) {
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
                  <Input placeholder="Nome da diocese ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoDiocese"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={diocese?.tipoDiocese.id.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipoDiocese.map((es) => (
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

          <Separator />
          <h2>Endereço</h2>

          <CepField
            control={form.control}
            name="cep"
            label="CEP"
            placeholder="CEP da diocese ..."
            onCepChange={handleCep}
          />

          <FormField
            control={form.control}
            name="logradouro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logradouro</FormLabel>
                <FormControl>
                  <Input
                    disabled={logradouroDisabled}
                    placeholder="Logradouro ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero</FormLabel>
                <FormControl>
                  <Input placeholder="Numero ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input
                    disabled={bairroDisabled}
                    placeholder="Bairro ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input
                    disabled={cidadeDisabled}
                    placeholder="Cidade ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input
                    disabled={cidadeDisabled}
                    placeholder="Estado ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
